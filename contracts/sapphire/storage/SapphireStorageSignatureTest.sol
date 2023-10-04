// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract SapphireStorageSignatureTest is EIP712 {
    error Unauthorized();

    mapping(address => string) private _profiles;

    bytes32 private constant _PRIVACY_ACCESS_HASH = keccak256("PrivacyAccess(address requester,uint256 expiry)");

    struct PrivacyAccessRequest {
        address requester;
        uint256 expiry;
        bytes signature;
    }

    constructor() EIP712("SapphireStorageSignatureTest", "1") {}

    modifier onlyPermitted(PrivacyAccessRequest calldata req) {
        if (block.timestamp > req.expiry) revert Unauthorized();
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(_PRIVACY_ACCESS_HASH, req.requester, req.expiry)));
        address signer = ECDSA.recover(digest, req.signature);
        if (signer != req.requester) revert Unauthorized();
        _;
    }

    function getProfile(PrivacyAccessRequest calldata req)
    external
    view
    onlyPermitted(req)
    returns (string memory) {
        return _profiles[req.requester];
    }

    function createProfile(string calldata data) external {
        _profiles[msg.sender] = data;
    }
}
