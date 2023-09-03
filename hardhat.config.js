require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');

// npx hardhat accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        console.log(account.address);
    }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: "0.8.18",
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
        bsc_testnet: {
            url: ``,
            chainId: 97,
            gasPrice: 'auto',
            accounts: [process.env.WALLET_BSC_TESTNET_PRIVATE_KEY_OWNER]
        },
        bsc_mainnet: {
            url: `https://bsc-dataseed.binance.org`,
            chainId: 56,
            gasPrice: 'auto',
            accounts: [process.env.WALLET_BSC_MAINNET_PRIVATE_KEY_OWNER]
        },
        opbnb_testnet: {
            url: `https://opbnb-testnet-rpc.bnbchain.org`,
            chainId: 5611,
            gasPrice: 200000000,
            accounts: [process.env.WALLET_OPBNB_TESTNET_PRIVATE_KEY_OWNER]
        }
    },
    mocha: {
        timeout: 1000000
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
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
