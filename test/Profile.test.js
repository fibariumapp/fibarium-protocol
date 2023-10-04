const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const hre = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FibariumProfile", function () {
    let owner, user;

    async function deploy() {
        [owner, user] = await ethers.getSigners();

        const Profile = await hre.ethers.getContractFactory("Profile", owner);
        let fibariumProfile = await hre.upgrades.deployProxy(
            Profile,
            ["FibariumSBT", "FibaSBT", owner.address],
            {
                initializer: 'initialize',
                kind: 'uups',
            }
        );
        await fibariumProfile.waitForDeployment();

        const profileEncryptedSlot = await ethers.getContractFactory("ProfileEncryptedSlotCartridge");
        let pEncryptedSlotStorage = await profileEncryptedSlot.deploy(await fibariumProfile.getAddress());
        await pEncryptedSlotStorage.waitForDeployment();

        const defaultUserProfile = {
            checksum: "0x7131323431323431323431323431323331323431323431323431323431323431",
            issuedBy: "0x68F8Be198D570Ac5761c0651CCA963Ffd2852273",
            issuedAt: 1,
            signature: ethers.hexlify("0x182374812345"),
            metadata: "application/json:base64,test",
            storageAddress: await pEncryptedSlotStorage.getAddress()
        }
        return {
            fibariumProfile,
            pEncryptedSlotStorage,
            defaultUserProfile
        };
    }

    describe("Deployment", function () {
        it("Should set the right admin address", async function () {
            const {fibariumProfile} = await loadFixture(deploy);
            expect(await fibariumProfile.owner()).to.equal(owner.address);
        });
    });

    it("mint with profile encrypted slot storage", async function () {
        const {fibariumProfile, pEncryptedSlotStorage, defaultUserProfile} = await loadFixture(deploy);
        fibariumProfile.connect(owner).setDataStorageProvider(defaultUserProfile.storageAddress);

        const privateMsg = "SECRET PROFILE";
        await fibariumProfile.connect(owner).mint(defaultUserProfile, privateMsg, {value: ethers.parseEther("0")});

        let amount = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(amount).to.eq(1);

        const artifact = await hre.artifacts.readArtifact("IDataStorageCartridge");
        const ProfileStorage = await hre.ethers.getContractAtFromArtifact(artifact, defaultUserProfile.storageAddress);
        const result = await ProfileStorage.connect(owner).fetch(owner.address);
        expect(result).to.eq(privateMsg);

        let tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);

        let tokenURI = await fibariumProfile.connect(owner).tokenURI(tokenID);
        expect(tokenURI).to.eq(defaultUserProfile.metadata);

        let newUserProfile = await fibariumProfile.connect(owner).getUserProfile(tokenID);
        expect(newUserProfile.checksum).to.eq(defaultUserProfile.checksum);
        expect(newUserProfile.issuedBy).to.eq(defaultUserProfile.issuedBy);
        expect(newUserProfile.issuedAt).to.eq(defaultUserProfile.issuedAt);
        expect(newUserProfile.signature).to.eq(defaultUserProfile.signature);
        expect(newUserProfile.storageAddress).to.eq(defaultUserProfile.storageAddress);
    });

    it("remint", async function () {
        const {fibariumProfile, _, defaultUserProfile} = await loadFixture(deploy);
        fibariumProfile.connect(owner).setDataStorageProvider(defaultUserProfile.storageAddress);

        // first SBT
        await fibariumProfile.connect(owner).mint(defaultUserProfile, "msg");
        let amount = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(amount).to.eq(1);
        let tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);
        let tokenURI = await fibariumProfile.connect(owner).tokenURI(tokenID);
        expect(tokenURI).to.eq(defaultUserProfile.metadata);
        console.log("first", defaultUserProfile.metadata);

        // second SBT
        await fibariumProfile.connect(owner).mint(defaultUserProfile, "msg");
        amount = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(amount).to.eq(1);
        tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);
        tokenURI = await fibariumProfile.connect(owner).tokenURI(tokenID);
        expect(tokenURI).to.eq(defaultUserProfile.metadata);
        console.log("second", defaultUserProfile.metadata)
    });

    it("burn", async function () {
        const {fibariumProfile, _, defaultUserProfile} = await loadFixture(deploy);
        fibariumProfile.connect(owner).setDataStorageProvider(defaultUserProfile.storageAddress);

        await fibariumProfile.connect(owner).mint(defaultUserProfile, "privateMsg", {value: ethers.parseEther("0")});
        let countTokens = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(countTokens).to.eq(1);
        let tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);

        await fibariumProfile.connect(owner).burn();
        token = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(token).to.eq(0);

        const artifact = await hre.artifacts.readArtifact("IDataStorageCartridge");
        const ProfileStorage = await hre.ethers.getContractAtFromArtifact(artifact, defaultUserProfile.storageAddress);
        const result = await ProfileStorage.connect(owner).fetch(owner.address);
        expect(result).to.eq("");
    });

    it("prohibited transferFrom", async function () {
        const {fibariumProfile, _, defaultUserProfile} = await loadFixture(deploy);
        fibariumProfile.connect(owner).setDataStorageProvider(defaultUserProfile.storageAddress);

        await fibariumProfile.connect(owner).mint(defaultUserProfile, "privateMsg", {value: ethers.parseEther("0")});
        let countTokens = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(countTokens).to.eq(1);
        let tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);

        await expect(
            fibariumProfile.connect(owner).transferFrom(owner.address, user.address, 1)
        ).to.be.revertedWithCustomError(fibariumProfile, 'TokenTransferProhibited');
        await expect(
            fibariumProfile['safeTransferFrom(address,address,uint256)'](owner.address, user.address, 1)
        ).to.be.revertedWithCustomError(fibariumProfile, 'TokenTransferProhibited');
        await expect(
            fibariumProfile['safeTransferFrom(address,address,uint256,bytes)'](owner.address, user.address, 1, "0x00")
        ).to.be.revertedWithCustomError(fibariumProfile, 'TokenTransferProhibited');
    });
});
