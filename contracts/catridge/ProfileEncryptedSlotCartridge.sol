// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../interfaces/IDataStorageCartridge.sol";
import "./Types.sol";

contract ProfileEncryptedSlotCartridge is AccessControl, IDataStorageCartridge {
    mapping(address => string) private _encrypted;
    mapping(address => bool) private _profileContracts;

    constructor(address profile) {
        _profileContracts[profile] = true;
    }

    function fetch() external view returns (string memory) {
        return _encrypted[msg.sender];
    }

    function create(bytes memory args) external payable returns (bool) {
        if (_profileContracts[msg.sender] != true) revert OnlyProfileContractAccess();
        (address user, string memory profile) = abi.decode(args, (address, string));
        _encrypted[user] = profile;
        return true;
    }

    function remove(bytes memory args) external payable returns (bool) {
        if (_profileContracts[msg.sender] != true) revert OnlyProfileContractAccess();
        (address user) = abi.decode(args, (address));
        delete _encrypted[user];
        return true;
    }

    function typeOf() external pure returns (bytes32) {
        return keccak256(abi.encode("encryptedSlot-1"));
    }
}
