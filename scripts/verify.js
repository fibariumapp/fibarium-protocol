const hre = require("hardhat")
require("dotenv").config();

async function main() {
    try {
        await hre.run("verify:verify", {
            contract: "contracts/Profile.sol:Profile",
            address: "0xC27E0b2d9a2cd015E3f2C3B66355e0532B9D42E7", //proxy address for verification
        })
    } catch (error) {
        console.log("error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })