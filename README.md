
Zipper Vault gives the end-user a digital identity, stored in their devices' web browsers, with no private data hosted on our company servers that:

- Doesn't require any sign-up, starts building up at first use

- Is consistent without synchronisation across devices, same encryption keys, same data

- Doesn't require any extensions, installed app, blockchain downloads, or even light client, just a modern browser (Firefox, IE9+, Chrome, etc)

- Works on desktop and mobile alike; and can be leveraged for IoT as well (give your robot vacuum cleaner it's own wallet)

- Can be used across multiple devices, where each device's access to the digital identity (and cryptographic keys) can be blocked in case of device loss, through flexible means (other devices, password recovery, ID check, etc)

- Gives websites that leverages it, a unique cryptographic sub-identity (you+it) usable for signing/encryption/decryption/verification; along with any number of sub-cryptographic keys - so for example a newspaper website running in a browser would be able to receive micropayments into it's sub-identity and pay directly to journalists.

- Allows for secure 'purposes' where a PIN/passphrase or other means of authentication is required to access cryptographic sub-keys

- Uses standard security means developed in blockchain communities to accomplish this

- Works with decentralized applications too, hosted on IPFS

- Supports KYC keys, where a subset of public keys can be shared with an identity provider, which will certify that it knows who those keys belong to; allowing to transact in KYC-requiring tokens.

- The above can be leveraged to have additional types of attestations ('I certify that key X has this name') ('That key X has this facebook account") along with attestation revocations that empowers the end-user to leverage in business transactions or other scenarios.

- And is as easy as including a JavaScript library to a website.

Contributions to Zipper Vault requires accepting a Contributor License Agreement, see more here: XXXX

To build:

$ npm install

$ npm run build-vault

$ npm run build-test

$ npm run www

Open http://localhost:8000/test/test.html and view output in console and
check out test.js.
