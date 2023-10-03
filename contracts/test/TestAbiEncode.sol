// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestAbiEncode {
    constructor() {}

    function getAbiEncode(address user, string memory data) external view returns (bytes memory) {
        return abi.encode(user, data);
    }
}
