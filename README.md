# Cardano Wallet CLI

## Goal

Simple utility CLI to create cardano wallets.
This tool allows to quickly generate wallets, the goal is to streamline our testbench and have tools to automate most of the process.

## Usage

**Create binary**

```bash
deno compile --allow-read --allow-write cardano-wallet.ts
```

**Creating enterprise Wallet (No staking)**

> Limited wallet, no staking, unable to import in a wallet extension.

```bash
./cardano-wallet --name=customer
./cardano-wallet --name=policy-cip68
./cardano-wallet --name=meta-manager
```

**Creating mnemonic Wallet (With staking)**

> Allows to get the key to sign without human interaction AND imports the mnenomic in a wallet extension.

```bash
./cardano-wallet --name=wallet-1 --mnemonic
```

**Restoring mnemonic Wallet (With staking)**

*Tested with 12 and 24 words mnemonic*

```bash
./cardano-wallet --name=wallet-2 --mnemonic --seed="beef swamp swing original fresh acquire virus hub essay welcome nut spray"
```
