import { Buffer } from "node:buffer";
import {
	BaseAddress,
	Bip32PrivateKey,
	Credential,
	EnterpriseAddress,
	NetworkInfo,
	PrivateKey,
	RewardAddress,
} from "npm:@emurgo/cardano-serialization-lib-nodejs@13.2.0";
import { generateMnemonic, mnemonicToEntropy } from "npm:bip39";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { existsSync } from "jsr:@std/fs";

const args: {
	_: [];
	name: string;
	mnemonic: boolean;
	seed: string;
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
	address_preview: string;
	address_preprod: string;
	address_mainnet: string;
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
		address_preview: enterpriseAddressPreview.to_address().to_bech32(),
		address_preprod: enterpriseAddressPreprod.to_address().to_bech32(),
		address_mainnet: enterpriseAddressMainnet.to_address().to_bech32(),
	};

	saveWallet(wallet, filename, save_locally);

	return wallet;
}

export function createOrRestoreWalletMnemonic(
	filename: string,
	save_locally = false,
	mnemonic = generateMnemonic(128), // Restore or Create new one
) {
	const rootKey = Bip32PrivateKey.from_bip39_entropy(
		Buffer.from(mnemonicToEntropy(mnemonic), "hex"),
		Buffer.from(""),
	);

	function harden(num: number): number {
		return 0x80000000 + num;
	}

	const accountKey = rootKey
		.derive(harden(1852)) // purpose
		.derive(harden(1815)) // coin type
		.derive(harden(0)); // account #0

	const utxoPubKey = accountKey
		.derive(0) // external
		.derive(0)
		.to_public();

	const stakeKey = accountKey
		.derive(2) // chimeric
		.derive(0)
		.to_public();

	// base address with staking key
	const baseAddr = BaseAddress.new(
		NetworkInfo.mainnet().network_id(),
		Credential.from_keyhash(utxoPubKey.to_raw_key().hash()),
		Credential.from_keyhash(stakeKey.to_raw_key().hash()),
	);
	const baseAddrTestnet = BaseAddress.new(
		NetworkInfo.testnet_preprod().network_id(),
		Credential.from_keyhash(utxoPubKey.to_raw_key().hash()),
		Credential.from_keyhash(stakeKey.to_raw_key().hash()),
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
		Credential.from_keyhash(stakeKey.to_raw_key().hash()),
	);
	const rewardAddrTestnet = RewardAddress.new(
		NetworkInfo.testnet_preprod().network_id(),
		Credential.from_keyhash(stakeKey.to_raw_key().hash()),
	);

	const wallet = {
		skey: rootKey.to_raw_key().to_bech32(),
		skey_hex: rootKey.to_raw_key().to_hex(),
		pkey: utxoPubKey.to_raw_key().to_bech32(),
		pkey_hex: utxoPubKey.to_raw_key().to_hex(), // Represent the hex that is save in ogmios transaction/signatories, useful to scan the chain searching for tx signed by this address.
		key_hash: utxoPubKey.to_raw_key().hash().to_hex(),
		base_address_preview: baseAddrTestnet.to_address().to_bech32(),
		base_address_preprod: baseAddrTestnet.to_address().to_bech32(),
		base_address_mainnet: baseAddr.to_address().to_bech32(),
		enterprise_address_mainnet: enterpriseAddr.to_address().to_bech32(),
		enterprise_address_testnet: enterpriseAddrTestnet.to_address().to_bech32(),
		reward_address_mainnet: rewardAddr.to_address().to_bech32(),
		reward_address_testnet: rewardAddrTestnet.to_address().to_bech32(),
		mnemonic,
	};

	saveWallet(wallet, filename, save_locally);

	return wallet;
}

if (args.seed && args.seed.length > 0) {
	console.log("Restoring wallet using seedphrase");
	createOrRestoreWalletMnemonic(args.name, true, args.seed);
} else if (args.mnemonic) {
	console.log("Creating wallet with seedphrase");
	createOrRestoreWalletMnemonic(args.name, true);
} else {
	console.log("Creating Enterprise wallet (No staking)");
	createWallet(args.name, true);
}
