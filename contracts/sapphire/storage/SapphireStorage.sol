// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Enclave, Result, autoswitch} from "@oasisprotocol/sapphire-contracts/contracts/OPL.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

// SapphireStorage using for secure storing user privacy
// Contract ProfileStorage must be deployed inside Sapphire network
// autoswitch function passing 1 argument chosen network for host contract
contract SapphireStorage is Enclave, EIP712 {
    error Unauthorized();

    mapping(address => string) private _profiles;

    bytes32 private constant _PRIVACY_ACCESS_HASH = keccak256("PrivacyAccess(address requester,uint256 expiry)");

    constructor(address _sbt) Enclave(_sbt, autoswitch("bsc")) EIP712("SapphireStorage", "1") {
        registerEndpoint("createProfile", _createProfile);
        registerEndpoint("removeProfile", _removeProfile);
    }

    struct PrivacyAccessRequest {
        address requester;
        uint256 expiry;
        bytes signature;
    }

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

    function _createProfile(bytes calldata args) internal returns (Result) {
        (address user, string memory profile) = abi.decode(
            args,
            (address, string)
        );
        _profiles[user] = profile;
        return Result.Success;
    }

    function _removeProfile(bytes calldata args) internal returns (Result) {
        (address user) = abi.decode(args, (address));
        delete (_profiles[user]);
        return Result.Success;
    }
}
