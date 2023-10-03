// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Enclave, Result, autoswitch} from "@oasisprotocol/sapphire-contracts/contracts/OPL.sol";

// SapphireStorage using for secure storing user privacy
// Contract ProfileStorage must be deployed inside Sapphire network
// autoswitch function passing 1 argument chosen network for host contract
contract SapphireStorage is Enclave {
    mapping(address => string) private _profiles;

    constructor(address _sbt) Enclave(_sbt, autoswitch("bsc")) {
        registerEndpoint("createProfile", _createProfile);
        registerEndpoint("removeProfile", _removeProfile);
    }

    function getProfile(address user) external view returns (string memory) {
        return _profiles[user];
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
