require("dotenv").config();
require("ethers");

require('@oasisprotocol/sapphire-hardhat');
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
require('@openzeppelin/hardhat-upgrades');

const {task} = require('hardhat/config');

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

// npx hardhat accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        console.log(account.address);
    }
});

// https://github.com/teller-protocol/teller-protocol-v2/blob/2b396c79777c38aac6d48b35610059d6bc944255/packages/contracts/hardhat.config.ts#L188
module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            outputSelection: {
                "*": {
                    "*": ["storageLayout"]
                }
            }
        }
    },
    networks: {
        'bsc-testnet': {
            url: `https://bsc-testnet.publicnode.com`,
            chainId: 97,
            gasPrice: 'auto',
            accounts: [process.env.WALLET_BSC_TESTNET_PRIVATE_KEY_OWNER]
        },
        'bsc': {
            url: `https://bsc-dataseed.binance.org`,
            chainId: 56,
            gasPrice: 'auto',
            accounts: [process.env.WALLET_BSC_MAINNET_PRIVATE_KEY_OWNER]
        },
        'opbnb-testnet': {
            url: `https://opbnb-testnet-rpc.bnbchain.org`,
            chainId: 5611,
            gasPrice: 200000000,
            accounts: [process.env.WALLET_OPBNB_TESTNET_PRIVATE_KEY_OWNER]
        },
        'sapphire-testnet': {
            url: 'https://testnet.sapphire.oasis.dev',
            chainId: 0x5aff,
            gasPrice: 'auto',
            accounts: [process.env.WALLET_SAPPHIRE_TESTNET_PRIVATE_KEY_OWNER]
        }
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: false,
        strict: true
    },
    mocha: {
        timeout: 1000000
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETH_TESTNET_SCAN_API_KEY,
            bscTestnet: process.env.BSC_TESTNET_SCAN_API_KEY
        }
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts'
    },
    gasReporter: {
        enabled: true,
        noColors: false,
        showTimeSpent: true,
        showMethodSig: true,
        onlyCalledMethods: true
    }
};

task('wallet', 'Create a wallet (pk) link', async (_, {ethers}) => {
    const randomWallet = ethers.Wallet.createRandom()
    console.log(`WALLET Generated as ${randomWallet.address}`)
    console.log(`WALLET PK ${randomWallet.privateKey}`)
})

task('blockNumber', 'Prints the block number', async (_, {ethers}) => {
    const blockNumber = await ethers.provider.getBlockNumber()
    console.log(blockNumber)
})

// deploy sapphire storage in sapphire testnet network
// args hostNetwork - name of main network (bsc, bsc-testnet)
task('deploy-sapphire-storage')
    .addParam('hostNetwork')
    .setAction(async (args, hre) => {
        await hre.run('compile');
        const ethers = hre.ethers;

        const signer = ethers.provider.getSigner();
        console.log("signer", (await signer).address);
        // Start by predicting the address of the DAO contract.
        const hostConfig = hre.config.networks[args.hostNetwork];
        if (!('url' in hostConfig)) throw new Error(`${args.hostNetwork} not configured`);
        const provider = new ethers.JsonRpcProvider(hostConfig.url);
        let nonce = await provider.getTransactionCount((await signer).address);
        const profileSapphireStorageAddress = ethers.getCreateAddress({
            from: (await signer).address,
            nonce: nonce
        });

        console.log('expected ProfileSapphireCartridge address', profileSapphireStorageAddress);

        const SapphireStorage = await ethers.getContractFactory('SapphireStorage');
        const feeData = await hre.ethers.provider.getFeeData();
        const sapphireStorage = await SapphireStorage.deploy(
            profileSapphireStorageAddress,
            {
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                maxFeePerGas: feeData.maxFeePerGas,
                type: 2
            }
        );
        await sapphireStorage.waitForDeployment();
        console.log('SapphireStorage address', await sapphireStorage.getAddress());
        return sapphireStorage.address;
    });

// deploy sapphire storage in sapphire testnet network
// args sapphireStorageAddress - contract address SapphireStorage from sapphire network
task('deploy-profile-sapphire-storage')
    .addParam('sapphireStorageAddress')
    .addParam('profileAddress')
    .setAction(async (args, hre) => {
        await hre.run('compile');
        const ProfileSapphireCartridge = await hre.ethers.getContractFactory('ProfileSapphireCartridge');
        const profileSapphireCartridge = await ProfileSapphireCartridge.deploy(
            args.sapphireStorageAddress, args.profileAddress,
        );
        await profileSapphireCartridge.waitForDeployment();
        console.log('ProfileSapphireCartridge address', await profileSapphireCartridge.getAddress());

        await sleep(3000); // 5 sec
        try {
            await hre.run("verify:verify", {
                contract: "contracts/storage/ProfileSapphireStorage.sol:ProfileSapphireCartridge",
                address: await profileSapphireStorage.getAddress(),
                constructorArguments: [args.sapphireStorageAddress, args.profileAddress]
            })
        } catch (error) {
            console.log("error:", error.message);
        }

        return profileSapphireCartridge.address;
    });
