# Main module (index.js)

The main module provides simple method for interacting directly with the
vault, but it is recommended to use the [Ethereum](../docs/ethereum/index.html)
or [secp256k1](../docs/secp256k1/index.html) modules directly.

The main module requires initialisation and is provided when calling into
those modules. There's a 'testing' mode so you can develop offline.

This is the client modules for use on websites, licensed under MIT license. The 'server side' vault and it's
code can be found in vault-site/ and is AGPLv3 licensed. 

# Zipper vault

Zipper Vault gives the end-user a digital identity, stored in their devices' web browsers, with no private data hosted on our company servers that:

- Doesn't require any sign-up, starts building up at first use

- Doesn't require any extensions, installed app, blockchain downloads, or even light client, just a modern browser (Firefox, IE9+, Chrome, etc)

- Works on desktop and mobile alike; and can be leveraged for IoT as well (give your robot vacuum cleaner it's own wallet)


- Gives websites that leverages it, a unique cryptographic sub-identity (you+it) usable for signing/encryption/decryption/verification; along with any number of sub-cryptographic keys - so for example a newspaper website running in a browser would be able to receive micropayments into it's sub-identity and pay directly to journalists.

- Allows for secure 'purposes' where a PIN/passphrase or other means of authentication is required to access cryptographic sub-keys

- Uses standard security means developed in blockchain communities to accomplish this

- And is as easy as including a JavaScript library to a website to begin using.

# TODO

- Is consistent without synchronisation across devices, same encryption keys, same data

- Can be used across multiple devices, where each device's access to the digital identity (and cryptographic keys) can be blocked in case of device loss, through flexible means (other devices, password recovery, ID check, etc)

- Works with decentralized applications too, hosted on IPFS

- Supports KYC keys, where a subset of public keys can be shared with an identity provider, which will certify that it knows who those keys belong to; allowing to transact in KYC-requiring tokens.

- The above can be leveraged to have additional types of attestations ('I certify that key X has this name') ('That key X has this facebook account") along with attestation revocations that empowers the end-user to leverage in business transactions or other scenarios.



# Contributions 

Contributions to Zipper Vault requires accepting a Contributor License Agreement, see more here: [Zipper Contribution](https://contribute.zipperglobal.com/)

# Developing

$ npm install

$ npm run build-vault

$ npm run build-test

$ npm run build-docs

$ npm run www

Open [http://localhost:8000/test/test.html](http://localhost:8000/test/test.html) and view output in console and
check out test.js.

# Getting started using Vault APIs

$ npm install zipperglobal/vault

and in your .js:

var vault = require('zipper-vault');
var ethVault = require('zipper-vault/ethereum');
var secp256k1Vault = requuire('zipper-vault/secp256k1');

vault.init({ "useOrigin" : true }).then(function() { 
    ethVault.ethAddress(vault, 'auto', 'm/0').then(function(pubkey) {
          console.log(pubkey);
    });    
});
