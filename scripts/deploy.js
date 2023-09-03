const {ethers, upgrades, config} = require('hardhat');
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Profile = await ethers.getContractFactory("Profile", deployer);
    const proxy = await upgrades.deployProxy(
        Profile,
        ["FibariumSBT", "FibaSBT"],
        {
            initializer: 'initialize',
            kind: 'uups',
        }
    );
    await proxy.deployed();
    console.log("PROXY IS", await proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });