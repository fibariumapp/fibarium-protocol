// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDataStorageCartridge {
    function fetch() external view returns (string memory);

    function create(bytes calldata args) external payable returns (bool);

    function remove(bytes calldata args) external payable returns (bool);

    function typeOf() external pure returns (bytes32);

}
