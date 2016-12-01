/*
 * Copyright (c) 2016 True Global Ltd. 
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

var authedForwarder = "0xf8260e2729e5f618005dc011a36d699bd2e53055";
var pmg = "https://enclave.zipperglobal.com/pmg";

exports.toEthSig = function(sig) {
    var ret = {}
    ret.r = sig.signature.slice(0, 64)
    ret.s = sig.signature.slice(64, 128)
    ret.v = sig.recovery + 27
    return ret
}

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

exports.ethAddress = function(vault, purpose, derive) {
    return new Promise( 
        function (resolve, reject) {
            vaultSecp256k1.keyInfo(vault, purpose, derive).then(function(pubkey) {
                resolve(ethutil.bufferToHex(ethutil.pubToAddress("0x" + pubkey.slice(2))));
            }); 
    });
}

exports.ecsign = function(vault, msgHash, purpose, derive) {
      return new Promise(
        function (resolve, reject) {
            vaultSecp256k1.sign(vault, purpose, derive, msgHash).then(function(result) { 
                resolve(exports.toEthSig(result));
            });             
        });
}

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

exports.sendAuthedTransaction = function(vault, purpose, derive, contract, calldata, careReturn)
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