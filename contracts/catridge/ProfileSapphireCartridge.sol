// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Host, Result} from "@oasisprotocol/sapphire-contracts/contracts/OPL.sol";
import "../interfaces/IDataStorageCartridge.sol";
import "./Types.sol";

// ProfileSapphireStorage using for transporting data from main Profile contract to Sapphire network
contract ProfileSapphireCartridge is Host, IDataStorageCartridge {
    mapping(address => bool) private _profileContracts;

    constructor(address _storage, address profile) Host(_storage) {
        _profileContracts[profile] = true;
    }

    function fetch() external view returns (string memory) {
        return "";
    }

    function create(bytes memory args) external payable returns (bool) {
        if (_profileContracts[msg.sender] != true) revert OnlyProfileContractAccess();
        postMessage("createProfile", args);
        return true;
    }

    function remove(bytes memory args) external payable returns (bool) {
        if (_profileContracts[msg.sender] != true) revert OnlyProfileContractAccess();
        postMessage("removeProfile", args);
        return true;
    }

    function typeOf() external pure returns (bytes32) {
        return keccak256(abi.encode("sapphire-1"));
    }
}
