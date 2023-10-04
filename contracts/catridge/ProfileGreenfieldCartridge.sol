// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IDataStorageCartridge.sol";
import "./Types.sol";

contract ProfileGreenfieldCartridge is IDataStorageCartridge {
    mapping(address => string) private _encrypted;
    mapping(address => bool) private _profileContracts;

    constructor(address profile) {
        _profileContracts[profile] = true;
    }

    function fetch(address user) external view returns (string memory) {
        return _encrypted[user];
    }

    function create(bytes memory args) external payable returns (bool) {
        if (_profileContracts[msg.sender] != true) revert OnlyProfileContractAccess();
        (address user, string memory profile) = abi.decode(args, (address, string));
        require(user == msg.sender, "user must be sender");
        _encrypted[user] = profile;
        return true;
    }

    function remove(bytes memory args) external payable returns (bool) {
        if (_profileContracts[msg.sender] != true) revert OnlyProfileContractAccess();
        (address user) = abi.decode(args, (address));
        require(user == msg.sender, "user must be sender");
        delete _encrypted[user];
        return true;
    }

    function typeOf() external pure returns (bytes32) {
        return keccak256(abi.encode("greenfield-1"));
    }
}
