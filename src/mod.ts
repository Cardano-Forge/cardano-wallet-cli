import { Buffer } from "node:buffer";
import {
  BaseAddress,
  Bip32PrivateKey,
  Credential,
  EnterpriseAddress,
  NetworkInfo,
  PrivateKey,
  RewardAddress,
} from "npm:@emurgo/cardano-serialization-lib-nodejs@14.1.1";
import { generateMnemonic, mnemonicToEntropy } from "npm:bip39";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { existsSync } from "jsr:@std/fs";

const args: {
  _: [];
  name: string;
  mnemonic: boolean;
  seed: string;
  bits: number;
  password: string

} = parseArgs(Deno.args);

if (!args.name) {
  console.error("Missing --name=wallet_name");
  Deno.exit(1);
}
if (existsSync(`${args.name}.json`)) {
  console.error(`'${args.name}.json' file already exists.`);
  Deno.exit(2);
}

function saveWallet(wallet: object, filename: string, save_locally: boolean) {
  if (save_locally) {
    Deno.writeTextFileSync(`${filename}.json`, JSON.stringify(wallet, null, 2));
  } else {
    console.log(
      "WARNING: The wallet information has not been saved locally, you must keep this safe somewhere.",
    );
  }
}

export function createWallet(
  filename: string,
  save_locally = false,
): {
  skey: string;
  skey_hex: string;
  pkey: string;
  pkey_hex: string;
  key_hash: string;
  enterprise_address_preview: string;
  enterprise_address_preprod: string;
  enterprise_address_mainnet: string;
} {
  const privateKey = PrivateKey.generate_ed25519();
  // Derive the public key
  const publicKey = privateKey.to_public();
  // Create a key hash
  const keyHash = publicKey.hash();

  // Create an enterprise address for each networks. (mainnet and testnets)
  const enterpriseAddressPreview = EnterpriseAddress.new(
    NetworkInfo.testnet_preview().network_id(),
    Credential.from_keyhash(keyHash),
  );
  const enterpriseAddressPreprod = EnterpriseAddress.new(
    NetworkInfo.testnet_preprod().network_id(),
    Credential.from_keyhash(keyHash),
  );
  const enterpriseAddressMainnet = EnterpriseAddress.new(
    NetworkInfo.mainnet().network_id(),
    Credential.from_keyhash(keyHash),
  );
  const wallet = {
    skey: privateKey.to_bech32(),
    skey_hex: privateKey.to_hex(),
    pkey: publicKey.to_bech32(),
    pkey_hex: publicKey.to_hex(), // Represent the hex that is save in ogmios transaction/signatories, useful to scan the chain searching for tx signed by this address.
    key_hash: keyHash.to_hex(),
    enterprise_address_preview: enterpriseAddressPreview
      .to_address()
      .to_bech32(),
    enterprise_address_preprod: enterpriseAddressPreprod
      .to_address()
      .to_bech32(),
    enterprise_address_mainnet: enterpriseAddressMainnet
      .to_address()
      .to_bech32(),
  };

  saveWallet(wallet, filename, save_locally);

  return wallet;
}

export function createOrRestoreWalletMnemonic(
  filename: string,
  save_locally = false,
  mnemonic = generateMnemonic(256), // Restore or Create new one
  password = ""
) {
  const rootKey = Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(mnemonicToEntropy(mnemonic), "hex"),
    Buffer.from(password),
  );

  function harden(num: number): number {
    return 0x80000000 + num;
  }

  const accountIndex = 0;
  const walletIndex = 0;

  const accountKey = rootKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(accountIndex)); // account index

  const utxoPrivKey = accountKey
    .derive(0) // role - external
    .derive(walletIndex); // index
  const utxoPubKey = utxoPrivKey.to_public();

  const stakePrivKey = accountKey
    .derive(2) // role - staking
    .derive(walletIndex) // index
  const stakePubKey = stakePrivKey.to_public();

  // base address with staking key
  const baseAddr = BaseAddress.new(
    NetworkInfo.mainnet().network_id(),
    Credential.from_keyhash(utxoPubKey.to_raw_key().hash()),
    Credential.from_keyhash(stakePubKey.to_raw_key().hash()),
  );
  const baseAddrTestnet = BaseAddress.new(
    NetworkInfo.testnet_preprod().network_id(),
    Credential.from_keyhash(utxoPubKey.to_raw_key().hash()),
    Credential.from_keyhash(stakePubKey.to_raw_key().hash()),
  );

  // enterprise address without staking ability, for use by exchanges/etc
  const enterpriseAddr = EnterpriseAddress.new(
    NetworkInfo.mainnet().network_id(),
    Credential.from_keyhash(utxoPubKey.to_raw_key().hash()),
  );
  // enterprise address without staking ability, for use by exchanges/etc
  const enterpriseAddrTestnet = EnterpriseAddress.new(
    NetworkInfo.testnet_preprod().network_id(),
    Credential.from_keyhash(utxoPubKey.to_raw_key().hash()),
  );

  // reward address - used for withdrawing accumulated staking rewards
  const rewardAddr = RewardAddress.new(
    NetworkInfo.mainnet().network_id(),
    Credential.from_keyhash(stakePubKey.to_raw_key().hash()),
  );
  const rewardAddrTestnet = RewardAddress.new(
    NetworkInfo.testnet_preprod().network_id(),
    Credential.from_keyhash(stakePubKey.to_raw_key().hash()),
  );

  const wallet = {
    stake_skey: stakePrivKey.to_raw_key().to_bech32(),
    stake_skey_hex: stakePrivKey.to_raw_key().to_hex(),
    skey: utxoPrivKey.to_raw_key().to_bech32(),
    skey_hex: utxoPrivKey.to_raw_key().to_hex(),
    pkey: utxoPubKey.to_raw_key().to_bech32(),
    pkey_hex: utxoPubKey.to_raw_key().to_hex(), // Represent the hex that is save in ogmios transaction/signatories, useful to scan the chain searching for tx signed by this address.
    key_hash: utxoPubKey.to_raw_key().hash().to_hex(),
    stake_key_hash: stakePubKey.to_raw_key().hash().to_hex(),
    base_address_preview: baseAddrTestnet.to_address().to_bech32(),
    base_address_preprod: baseAddrTestnet.to_address().to_bech32(),
    base_address_mainnet: baseAddr.to_address().to_bech32(),
    enterprise_address_mainnet: enterpriseAddr.to_address().to_bech32(),
    enterprise_address_preview: enterpriseAddrTestnet.to_address().to_bech32(),
    enterprise_address_preprod: enterpriseAddrTestnet.to_address().to_bech32(),
    reward_address_mainnet: rewardAddr.to_address().to_bech32(),
    reward_address_preview: rewardAddrTestnet.to_address().to_bech32(),
    reward_address_preprod: rewardAddrTestnet.to_address().to_bech32(),
    mnemonic,
  };

  saveWallet(wallet, filename, save_locally);

  return wallet;
}

if (args.seed && args.seed.length > 0) {
  console.log("Restoring wallet using seedphrase");
  createOrRestoreWalletMnemonic(args.name, true, args.seed, args.password);
} else if (args.mnemonic) {
  console.log("Creating wallet with seedphrase (Default 24 words)");
  createOrRestoreWalletMnemonic(args.name, true, generateMnemonic(args.bits || 256), args.password);
} else {
  console.log("Creating Enterprise wallet (No staking)");
  createWallet(args.name, true);
}
