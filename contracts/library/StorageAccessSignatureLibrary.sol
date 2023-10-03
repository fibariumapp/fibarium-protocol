// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

library StorageAccessSignatureLibrary {
    function verify(bytes memory signature) public view returns (bool) {
        address signer = recoverSigner(msg.sender, signature);
        return signer == msg.sender;
    }

    function recoverSigner(
        address account,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 msgHash = keccak256(abi.encodePacked(account));
        bytes32 msgEthHash = ECDSA.toEthSignedMessageHash(msgHash);
        address signer = ECDSA.recover(msgEthHash, signature);
        return signer;
    }
}
