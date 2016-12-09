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

/**  
 * Set up a new purpose for use in the following functions, accessible through a particular alias
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose to be aliased
 * @param {String} alias the particular alias to be made
 * @return {Promise} a promise that resolves when the alias is set up.
 */

exports.setupPurpose = function(vault, purpose, alias) {
   return new Promise(function(resolve, reject) { 
      vault.message({'secp256k1SetupPurpose' : { purpose: purpose, alias: alias }}).then(function(result) { 
           resolve();
      });
   });
}

/** 
 * Get the public key for that particular purpose and derivation
 * @param {vault} vault the Vault module
 * @param {String} purpose the particular purpose, if normal, use 'auto'
 * @param {String} derive the particular BIP32 derivation, see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * @return {Promise} where resolve gets the public key
*/

exports.keyInfo = function(vault, purpose, derive) {     
   return new Promise(function(resolve, reject) { 
     vault.message({'secp256k1KeyInfo' : { key: { purpose: purpose, derive: derive } }}).then(function(result) { 
          resolve(result.pubkey);
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
 * @param {String} purpose the hex form signature
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

