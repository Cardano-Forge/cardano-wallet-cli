# Cardano Wallet CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![GitHub release (latest)](https://img.shields.io/github/v/release/Cardano-Forge/cardano-wallet-cli)

> ⚡ Generate and manage **Cardano wallets** directly from your terminal.  
> Designed for **developers and testers**.

---

## ⚠️ Security Notice

**This tool is primarily intended for development and testing purposes.**

- **DO NOT** use this tool with real funds on Cardano mainnet without a thorough security review.  
- **Always** store mnemonic phrases securely and never share them.  
- **Use testnet** for development and testing.  
- **Review the code** before using with any valuable assets.  

---

## ✨ Features

- 🚀 **Fast wallet generation** for development and testing
- 🔐 **Enterprise wallets** (no staking capabilities)
- 🌱 **Mnemonic wallets** with full staking support (12 or 24 words)
- 🔄 **Wallet restoration** from existing mnemonic phrases
- 🔒 **Password protection** for enhanced security
- 📱 **Wallet extension compatible** mnemonics

---

## ⚡ Quick Start

```bash
# Download the binary for you OS 
# Go to the folder where it is
cd ./Downloads

# Create your first wallet
./cardano-wallet-windows-latest.exe --name=my-first-wallet --mnemonic

# Check generated files
ls -la my-first-wallet.*
```

👉 The wallet data will be saved to `{name}.json` in the current directory.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Enterprise Wallets](#enterprise-wallets-no-staking)
  - [Mnemonic Wallets](#mnemonic-wallets-with-staking)
  - [Wallet Restoration](#wallet-restoration)
  - [Password Protection](#password-protection)
- [Output Files](#-output-files)
- [Examples](#-examples)
- [Troubleshooting](#-troubleshooting)
- [Related Projects](#-related-projects)
- [License](#-license)

---

## 🔧 Prerequisites

- **Supported OS**: Windows | macOS | Linux
- **(optional) Deno Runtime**: Version 1.28.0 or higher  
  Install from [deno.land](https://deno.land/manual/getting_started/installation)

---

## 📦 Installation

### Option 1: Build from source

```bash
git clone https://github.com/Cardano-Forge/cardano-wallet-cli.git
cd cardano-wallet-cli
deno compile --allow-read --allow-write --output cardano-wallet src/mod.ts
chmod +x cardano-wallet # (Linux/macOS only)
```

### Option 2: Direct run from release

Download the binary release and run directly:

```bash
cd ./Downloads
./cardano-wallet-windows-latest.exe --name=my-first-wallet --mnemonic
```

---

## 🚀 Usage

### Enterprise Wallets (no staking)

```bash
./cardano-wallet --name=customer
./cardano-wallet --name=policy-cip68
./cardano-wallet --name=meta-manager
```

### Mnemonic Wallets (with staking)

24-word mnemonic (default):

```bash
./cardano-wallet --name=wallet-1 --mnemonic
```

12-word mnemonic:

```bash
./cardano-wallet --name=wallet-1 --mnemonic --bits=128
```

### Wallet Restoration

```bash
./cardano-wallet --name=wallet-2 --mnemonic --seed="beef swamp swing original fresh acquire virus hub essay welcome nut spray"
```

### Password Protection

```bash
./cardano-wallet --name=wallet-3 --mnemonic --password=helloworld
```

---

## 📁 Output Files

Each wallet generates a `{name}.json` file in the current directory with the following structure:

```json
{
  "stake_skey": "Private stake signing key (Bech32 format)",
  "stake_skey_hex": "Private stake signing key (hexadecimal)",
  "skey": "Private payment signing key (Bech32 format)",
  "skey_hex": "Private payment signing key (hexadecimal)",
  "pkey": "Public payment verification key (Bech32 format)",
  "pkey_hex": "Public payment verification key (hexadecimal)",
  "key_hash": "Hash of the public payment key",
  "stake_key_hash": "Hash of the public stake key",
  "base_address_preview": "Base address for Preview testnet",
  "base_address_preprod": "Base address for Preprod testnet",
  "base_address_mainnet": "Base address for Mainnet",
  "enterprise_address_mainnet": "Enterprise address for Mainnet",
  "enterprise_address_preview": "Enterprise address for Preview testnet",
  "enterprise_address_preprod": "Enterprise address for Preprod testnet",
  "reward_address_mainnet": "Stake reward address for Mainnet",
  "reward_address_preview": "Stake reward address for Preview testnet",
  "reward_address_preprod": "Stake reward address for Preprod testnet",
  "mnemonic": "24-word recovery phrase"
}
```

---

## 📚 Examples

### Development workflow

```bash
# Create a test wallet for DApp development
./cardano-wallet --name=dapp-test --mnemonic

# Create a policy wallet for NFT minting
./cardano-wallet --name=nft-policy

# Restore a wallet from testnet
./cardano-wallet --name=restored-wallet --mnemonic --seed="abandon abandon ... about"
```

---

## 🛠️ Command Line Options

| Option       | Description                                        | Required | Default |
| ------------ | -------------------------------------------------- | -------- | ------- |
| `--name`     | Wallet name/identifier                             | ✅       | -       |
| `--mnemonic` | Generate mnemonic wallet                           | ❌       | false   |
| `--bits`     | Mnemonic entropy bits (128=12 words, 256=24 words) | ❌       | 256     |
| `--seed`     | Restore from existing mnemonic                     | ❌       | -       |
| `--password` | Add password protection                            | ❌       | -       |

---

## 🔍 Troubleshooting

**Problem**: `Permission denied`  
**Solution**: Ensure the binary is executable: `chmod +x cardano-wallet`

**Problem**: `Deno command not found`  
**Solution**: Install Deno from [deno.land](https://deno.land/manual/getting_started/installation)

**Problem**: Invalid mnemonic error  
**Solution**: Ensure your phrase is valid BIP39 and properly quoted

**Problem**: Files not generated  
**Solution**: Check write permissions in the current directory

---

## 🔗 Related Projects

- [Cardano CLI](https://github.com/input-output-hk/cardano-cli) – Official Cardano command line tools
- [Cardano Serialization Lib](https://github.com/Emurgo/cardano-serialization-lib) – Core serialization library

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

**⚠️ Reminder**: This tool is for **development and testing only**. Never use with real funds unless you have performed a full security audit.
