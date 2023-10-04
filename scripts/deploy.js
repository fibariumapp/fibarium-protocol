require("dotenv").config();
const hre = require("hardhat");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    const Profile = await hre.ethers.getContractFactory("Profile", deployer);
    const proxy = await hre.upgrades.deployProxy(
        Profile,
        ["FibariumSBT", "FibaSBT", deployer.address],
        {
            initializer: 'initialize',
            kind: 'uups',
        }
    );
    await proxy.waitForDeployment();
    console.log('PROXY IS', await proxy.getAddress());

    await sleep(5 * 1000); // 30s = 30 * 1000 milliseconds

    try {
        await hre.run("verify:verify", {
            contract: "contracts/Profile.sol:Profile",
            address: await proxy.getAddress(), //proxy address for verification
        })
    } catch (error) {
        console.log("error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });