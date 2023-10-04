const {ethers, upgrades} = require("hardhat");
const hre = require("hardhat");
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {expect} = require("chai");

const defaultMessage = "HELLO IM PRIVATE";

async function deploy() {
    const [owner, user] = await ethers.getSigners();
    const Storage = await ethers.getContractFactory("SapphireStorageSignatureTest", owner);
    const storage = await Storage.deploy();
    await storage.waitForDeployment();
    await storage.connect(owner).createProfile(defaultMessage);

    const chainID = (await ethers.provider.getNetwork()).chainId;
    const domainHeader = {
        name: 'SapphireStorageSignatureTest',
        version: '1',
        chainId: chainID,
        verifyingContract: await storage.getAddress(),
    };

    return {
        storage, owner, user, domainHeader
    };
}

describe("Sapphire", function () {
    const types = {
        PrivacyAccess: [
            {name: 'requester', type: 'address'},
            {name: 'expiry', type: 'uint256'},
        ],
    };

    let storage;
    let owner, user;
    let domainHeader;

    before(async function () {
        ({storage, owner, user, domainHeader} = await loadFixture(deploy));
    });

    it("signature access check", async function () {
        const expiry = (await time.latest()) + 1000;
        const value = {
            requester: owner.address,
            expiry: expiry
        };

        const eip712signature = await owner.signTypedData(domainHeader, types, value);

        const req = {
            requester: owner.address,
            expiry: expiry,
            signature: eip712signature,
        }
        const msg = await storage.connect(owner).getProfile(req);
        expect(msg).to.equal(defaultMessage);
    });

    it("signature access invalid deadline failure", async function () {
        const expiry = (await time.latest()) - 1000;
        const value = {
            requester: owner.address,
            expiry: expiry
        };

        const eip712signature = await owner.signTypedData(domainHeader, types, value);

        const req = {
            requester: user.address,
            expiry: expiry,
            signature: eip712signature,
        }

        await expect(storage.connect(owner).getProfile(req)).to.be.revertedWithCustomError(
            storage, "Unauthorized()"
        );
    });

    it("signature access invalid requester failure", async function () {
        const expiry = (await time.latest()) + 1000;
        const value = {
            requester: user.address,
            expiry: expiry
        };

        const eip712signature = await owner.signTypedData(domainHeader, types, value);

        const req = {
            requester: owner.address,
            expiry: expiry,
            signature: eip712signature,
        }

        await expect(storage.connect(owner).getProfile(req)).to.be.revertedWithCustomError(
            storage, "Unauthorized()"
        );
    });

});
