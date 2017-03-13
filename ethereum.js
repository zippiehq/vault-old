/*
 * Copyright (c) 2016 True Holding Ltd. 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/

var ethutil = require('ethereumjs-util');
var abi = require('ethereumjs-abi');
var BN = require('bn.js');

var vaultSecp256k1 = require ('./secp256k1.js');

/**
 * Converts a secp256k1 signature in hex form into a Ethereum form v,r,s
 * @param {{signature: String, recovery: Number} sig the signature to convert
 * @return {{v: Number, r: String, s: String}} the Ethereum form signature
 */

exports.toEthSig = function(sig) {
    var ret = {}
    ret.r = sig.signature.slice(0, 64)
    ret.s = sig.signature.slice(64, 128)
    ret.v = sig.recovery + 27
    return ret
}

/**
 * Converts a Ethereum style signature into secp256k1 form
 * @param {Number} v part of Ethereum style signature, either 27 or 28
 * @param {String} r part of Ethereum style signature, in hex form
 * @param {String} s part of Ethereum style signature, in hex form
 * @return {{String, Number}} secp256k1 signature
 */

exports.fromEcSig = function(v,r,s) {
    r = Buffer.from(r, 'hex');
    s = Buffer.from(s, 'hex');
    var signature = Buffer.concat([r, s]);
    var recovery = v - 27
    if (recovery !== 0 && recovery !== 1) {
       throw new Error('Invalid signature v value')
    }
    return { signature: signature.toString('hex'), recovery: recovery }
}

/** 
 * Gets the particular Ethereum style address for the particular purpose and derivation
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} purpose the particular BIP39 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @return {Promise} where resolve is the Ethereum style address
 */
 
exports.ethAddress = function(vault, purpose, derive, cacheResult = false) {
    return new Promise( 
        function (resolve, reject) {
            vaultSecp256k1.keyInfo(vault, purpose, derive, cacheResult).then(function(result) {
                resolve(ethutil.bufferToHex(ethutil.pubToAddress("0x" + result.pubkey.slice(2))));
            }); 
    });
}

/** 
 * Signs the particular msgHash in hex form with the private key of particular purpoes and derivation
 * @param {vault} vault the Vault module
 * @param {String} msgHash The hash (32 bytes in hex form) to be signed
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP39 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @return {Promise} where resolve is the Ethereum signature (v,r,s)
*/ 
 
exports.ecsign = function(vault, msgHash, purpose, derive) {
      return new Promise(
        function (resolve, reject) {
            vaultSecp256k1.sign(vault, purpose, derive, msgHash).then(function(result) { 
                resolve(exports.toEthSig(result));
            });             
        });
}

/** 
 * Recovers the Ethereum address and public key of the particular Ethereum-style signature for a specific hash
 * @param {vault} vault the Vault module
 * @param {String} msgHash The hash (32 bytes in hex form) to be signed
 * @param {Number} v the Ethereum-style signature part
 * @param {String} r the Ethereum-style signature part, in hex form
 * @param {String} s the Ethereum-style signature part, in hex form
 * @return {Promise} where the result is { ethAddress: Ethereum Address, pubkey: Public key }
*/
  
exports.ecrecover = function(vault, msgHash, v, r, s)  {
     return new Promise(
         function (resolve, reject) {
            var sig = exports.fromEcSig(v, r, s);
            vaultSecp256k1.recover(vault, sig.signature, sig.recovery, msgHash).then(function(result) {
                resolve({ ethAddress: ethutil.bufferToHex(ethutil.pubToAddress("0x" + result.slice(2))), pubkey: result});
            });
         }
     );
}

/**
 * Send a transaction to a particular contract without paying ether
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP39 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @param {String} contract The Ethereum address of the smart contract to be called
 * @param {String} calldata calldata of the call. First argument MUST be equal to ethAddress(vault, purpose, derive) or it will fail
 * @param {Boolean} careReturn if a event should be issued for the return value of the execution
 * @return {Promise} where the resolve is the Ethereum blockchain transaction ID
 */
 
exports.sendAuthedTransaction = function(vault, purpose, derive, contract, calldata, careReturn, pmg="https://enclave.zipperglobal.com/pmg", authedForwarder="0xf8260e2729e5f618005dc011a36d699bd2e53055")
{
    return new Promise(
        function(resolve, reject) {
             var nonce = new Date().getTime();
             var hash = abi.soliditySHA3(['address', 'address', 'bytes', 'uint'], [
                 new BN(authedForwarder, 16),
                 new BN(contract, 16),
                 new Buffer(calldata.replace('0x', ''), "hex"),
                 nonce]).toString('hex');
             
              exports.ecsign(vault, hash, purpose, derive).then(function(sig) {
                  var tx = { to: contract,
                             nonce: "0x" + nonce.toString(16),
                             careReturn: careReturn,
                             calldata: calldata,
                             v: "0x" + sig.v.toString(16),
                             r: "0x" + Buffer.from(sig.r, 'hex').toString('hex'),
                             s: "0x" + Buffer.from(sig.s, 'hex').toString('hex')
                          };
                  // we then send result to the PMG server over JSON-RPC and make a callback with the transaction ID that we get from it
                  var xmlhttp = new XMLHttpRequest(); 
                  xmlhttp.open("POST", pmg);
                  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                  xmlhttp.onreadystatechange = function() {
                       if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                          resolve(xmlhttp.responseText);
                       }
                  }
                  xmlhttp.send(JSON.stringify(tx));          
             });
        }); 
}
