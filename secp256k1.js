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


var store = require('store');

/**  
 * Set up a new purpose for use in the following functions, accessible through a particular alias
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose to be aliased
 * @param {String} alias the particular alias to be made
 * @return {Promise} a promise that resolves when the alias is set up and rejects if the device is offline
 */

exports.setupPurpose = function(vault, purpose, alias) {
   return new Promise(function(resolve, reject) { 
      vault.message({'secp256k1SetupPurpose' : { purpose: purpose, alias: alias }}).then(function(result) { 
           if (result == "offline")
              reject();
           else
              resolve();
      });
   });
}

/** 
 * Get the public key and extended public key for that particular purpose and derivation
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP32 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @param {bool} cacheResult if to cache the result in local storage for offline use
 * @return {Promise} where resolve gets the public key and public extended key in a dictionary
*/

exports.keyInfo = function(vault, purpose, derive, cacheResult = false) {     
   return new Promise(function(resolve, reject) {
     // XXX Need a way to invalidate cache in case vault changes user
     var cache = store.get('vault:' + purpose + '/' + derive);
     if (cache)
         resolve(JSON.parse(cache));
     
     vault.message({'secp256k1KeyInfo' : { key: { purpose: purpose, derive: derive } }}).then(function(result) { 
          if (cacheResult)
             store.set('vault:' + purpose + '/' + derive, JSON.stringify(result.result));
          resolve(result.result);
     });
   });
}

/** 
 * Derive a public extended key into a particular public key & public extended key
 * @param {vault} vault the Vault module
 * @param {String} pubex public extended key
 * @param {String} derive the particular BIP32 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @return {Promise} where resolve gets the public key and public extended key in a dictionary
*/

exports.derive = function(vault, pubex, derive) {
   return new Promise(function(resolve, reject) {
     vault.message({'secp256k1Derive' : { key: { pubex: pubex, derive: derive } }}).then(function(result) { 
          resolve(result.result);
     });
   });
}

/** 
 * Signs a particular hash with the private for that particular purpose and derivation
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP32 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @param {String} hash the hash (32-bytes) that should be signed
 * @return {Promise} a promise where the resolve returns a string with the particular signature
*/
 
exports.sign = function(vault, purpose, derive, hash) {
   return new Promise(function(resolve, reject) { 
     vault.message({'secp256k1Sign' : { key: { purpose: purpose, derive: derive }, hash: hash }}).then(function(result) { 
          resolve(result.result);
     });
   });
}


/** 
 * Encrypts a particular plaintext with ECIES with the public key
 * @param {vault} vault the Vault module
 * @param {String} pubkey the  public key to be encrypted towards
 * @param {String} plaintext the hex form of the plaintext
 * @return {Promise} where the result is the information needed to transmit the encrypted text
*/

exports.encrypt = function(vault, pubkey, plaintext) {
   return new Promise(function(resolve, reject) { 
     vault.message({'secp256k1Encrypt' : { pubkey: pubkey, plaintext: plaintext }}).then(function(result) { 
          resolve(result.result);
     });
   });

}

/** 
 * Decrypts a particular ciphertext with ECIES with the private key for a particular purpose and derivation
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP32 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @param {String} iv in hex form, the IV given by the encryption process
 * @param {String} ephemPublicKey in hex form, the ephemPublicKey given by the encryption process
 * @param {String} ciphertext in hex form, the ciphertext given by the encryption process
 * @param {String} mac in hex form, the MAC given by the encryption process
 * @return {Promise} where the result is the information needed to transmit the encrypted text
*/

exports.decrypt = function(vault, purpose, derive, iv, ephemPublicKey, ciphertext, mac) {
   return new Promise(function(resolve, reject) { 
     vault.message({'secp256k1Decrypt' : { key: { purpose: purpose, derive: derive }, 
            iv: iv, ephemPublicKey: ephemPublicKey, ciphertext: ciphertext, mac: mac }}).then(function(result) { 
            resolve(result.result);
     });
   });
   
}

/** 
 * Recovers the public key that signed a particular hash given the signature
 * @param {vault} vault the Vault module
 * @param {String} signature the hex form signature
 * @param {Number} recovery the recovery part of the signature
 * @param {String} hash the hash (32-bytes) that was signed
 * @return {Promise} a promise where the resolve is the public key that signed the signature
*/
exports.recover = function(vault, signature, recovery, hash) {
   return new Promise(function(resolve, reject) {
     vault.message({'secp256k1Recover' : { signature: signature, recovery: recovery, hash: hash }}).then(function(result) { 
            resolve(result.result);
     });
  });
}

/** 
 * Retrieves an attestation by vault that a particular public key or extended public key
 * originates from a particular vault-guaranteed origin. If you share a pubex with untrusted parties, make sure to use
 * hardened keys
 *
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP32 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @param {String} proofType either 'pub' or 'pubex'
 * @return {Promise} a promise that resolves to a dictionary of signature, recovery, message (hex format of the JSON attestation containing type/origin and the pub(ex)key itself)
*/

exports.getProof = function(vault, purpose, derive, proofType) {
   return new Promise(function(resolve, reject) { 
     vault.message({'secp256k1GetProof' : { key: { purpose: purpose, derive: derive }, 
         proofType: proofType }}).then(function(result) {
            resolve(result.result); 
     });     
   });
}

/** 
 * Verifies an attestation was done by vault, that this message was signed by vault
 * @param {Number} recovery the recovery part of the signature
 * @param {vault} vault the Vault module
 * @param {String} signature the hex form signature
 * @param {String} the message in hex form
 * @return {Promise} a promise that resolves to a boolean value if this attestation is valid
 */

exports.verifyProof = function(vault, signature, recovery, message) {
   return new Promise(function(resolve, reject) { 
     vault.message({'secp256k1VerifyProof' : { message: message, signature: signature, recovery: recovery }}).then(function(result) {
            resolve(result.result);
     });
   });
}