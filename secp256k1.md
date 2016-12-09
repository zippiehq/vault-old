
The Zipper Vault secp256k1 module provides methods for:
* Generating 'purposes' which are sub-identities of your webapp
* Getting the key information about particular purpose and derivation (see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
* ECDSA Signing with particular keys
* ECIES encryption towards particular public key
* ECIES decryption using private key in vault
* Recovery of public key from ECDSA signature