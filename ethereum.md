
The Ethereum module of Zipper vault provides handy methods to recover & sign
with Ethereum style signatures, utilizing the secp256k1 private keys inside
the Vault.

Additionally it provides easy method to send Zipper Authed Ethereum
Transactions, where end-users won't have to pay any blockchain fees,
provided that the receipient contract supports the "Authed Forwarder" scheme
where the first argument of the calldata is guaranteed to be the originator
of the transaction, one-time signed by the originator.

Be aware that you will likely have to pre-pay for Ethereum transactions that your
end users will eventually do.
