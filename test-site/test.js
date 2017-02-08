
var vault = require('../index.js');
var ethVault = require('../ethereum.js');
var Web3 = require('web3');
var web3 = new Web3();
var secp256k1F = require('../secp256k1.js');

var authedforwarderContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"sig","type":"bytes4"}],"name":"whitelist","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_foo","type":"address"}],"name":"test","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"address"},{"name":"_calldata","type":"bytes"},{"name":"_nonce","type":"uint256"},{"name":"_careReturn","type":"bool"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"callOtherContract32","outputs":[],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_foo","type":"address"}],"name":"EcRecovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_foo","type":"address"}],"name":"Test","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_result","type":"bytes32"}],"name":"TransactionReturnValue32","type":"event"},{"anonymous":false,"inputs":[],"name":"TransactionDenied","type":"event"}]);
var authedforwarder = authedforwarderContract.at("0xf8260e2729e5f618005dc011a36d699bd2e53055");

vault.init({ "useOrigin" : true, "testing" : true  }).then(function() { 
     secp256k1F.setupPurpose(vault, 'auto', 'auto').then(function() {
      console.log("Auto purpose set up");
      secp256k1F.keyInfo(vault, 'auto', 'm/0', true).then(function(result) {
           secp256k1F.derive(vault, result.pubex, 'm/0').then(function(result) {
                console.log("Derived " + result.pubkey + " " + result.pubex);
           });
      });
      secp256k1F.setupPurpose(vault, 'foo', 'bar').then(function() { 
             console.log("BAR");
             ethVault.ethAddress(vault, 'bar', 'm/0').then(function(pubkey) { console.log(" BAR " + pubkey); });
        });     
      ethVault.ethAddress(vault, 'auto', 'm/0').then(function(pubkey) { console.log(pubkey); });    
      ethVault.ethAddress(vault, 'auto', 'm/1').then(function(pubkey) { console.log(pubkey); });    
      ethVault.ethAddress(vault, 'auto', 'm/2').then(function(pubkey) { console.log(pubkey); });    
      ethVault.ecsign(vault, "0123456789012345678901234567890123456789012345678901234567890101", 'auto', 'm/0').then(function(sig) {
            console.log(sig);
            ethVault.ecrecover(vault, "0123456789012345678901234567890123456789012345678901234567890101", sig.v, sig.r, sig.s).then(function(result) {
                console.log(result);
            });
      });
      secp256k1F.getProof(vault, 'auto', 'm/0', 'pub').then(function(result) {
             console.log("Proof result: " + JSON.stringify(result));
             secp256k1F.verifyProof(vault, result.signature, result.recovery, result.message).then(function(result) {
                console.log("Verify result: " + JSON.stringify(result));
             });
      });
 
      secp256k1F.getProof(vault, 'auto', 'm/0', 'pubex').then(function(result) {
             console.log("Proof result: " + Buffer.from(result.message, 'hex').toString('utf8'));
             secp256k1F.verifyProof(vault, result.signature, result.recovery, result.message).then(function(result) {
                console.log("Verify result: " + JSON.stringify(result));
             });
      });
      ethVault.ethAddress(vault, 'auto', 'm/0').then(function(pubkey) {
         ethVault.sendAuthedTransaction(vault, 'auto', 'm/0', authedforwarder.address, authedforwarder.test.getData("0x" + pubkey), true).then(function(result) {
           console.log("https://etherscan.io/tx/" + result);
       });
     });    
    });
});
