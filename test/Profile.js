const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");

describe("FibariumProfile", function () {
    const metadata = `data:application/json;base64`;
    let owner, user;
    let fibariumProfile;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const implementation = await ethers.getContractFactory("Profile");
        fibariumProfile = await upgrades.deployProxy(implementation, ["Fibarium", "FIBA"], {
            initializer: 'initialize',
            kind: 'uups',
        });
        await fibariumProfile.deployed();
    });

    it("mint", async function () {
        await fibariumProfile.connect(owner).mint(metadata);
        let token = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(token).to.eq(1);
    });

    it("remint", async function () {
        // first SBT
        await fibariumProfile.connect(owner).mint(metadata);
        let token = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(token.toNumber()).to.eq(1);
        let tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);
        let tokenURL = await fibariumProfile.connect(owner).tokenURI(tokenID);
        expect(tokenURL).to.eq(metadata);
        console.log("first", metadata);

        // second SBT
        await fibariumProfile.connect(owner).mint(metadata);
        token = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(token.toNumber()).to.eq(1);
        tokenID = await fibariumProfile.connect(owner).tokenIdOf(owner.address);
        expect(tokenID).to.eq(1);
        tokenURL = await fibariumProfile.connect(owner).tokenURI(tokenID);
        expect(tokenURL).to.eq(metadata);
        console.log("second", metadata)
    });

    it("burn", async function () {
        await fibariumProfile.connect(owner).mint(metadata);
        let token = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(token).to.eq(1);

        await fibariumProfile.connect(owner).burn();
        token = await fibariumProfile.connect(owner).balanceOf(owner.address);
        expect(token).to.eq(0);
    });

    it("prohibited transferFrom", async function () {
        await fibariumProfile.connect(owner).mint(metadata);
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
            fibariumProfile['safeTransferFrom(address,address,uint256,bytes)'](owner.address, user.address, 1, [])
        ).to.be.revertedWithCustomError(fibariumProfile, 'TokenTransferProhibited');
    });
});
