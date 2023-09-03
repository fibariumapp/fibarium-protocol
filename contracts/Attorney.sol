// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Attorney is Ownable, AccessControl {
    using Strings for uint256;
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    // Mapping from token ID to owner address
    mapping(address => address) private _confidant;
    EnumerableMap.AddressToUintMap private _confidantPermission;

    // Operator
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /**
    * @dev This emits when an existing SBT is burned by an account
     */
    event Issue(address indexed to, uint256 indexed state);

    /**
     * @dev This emits when an existing SBT is burned by an account
     */
    event Revoke(address indexed from);

    /**
    * @dev This emits when an existing SBT is burned by an account
     */
    event Refuse(address indexed owner);

    constructor(address admin_) {
        // grant DEFAULT_ADMIN_ROLE to contract creator
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(OPERATOR_ROLE, admin_);
    }

    function issue(address to, uint256 permission) external {
        require(to != address(0), "Address is empty");
        require(permission > 0, "Permission must be > 0");
        require(!_confidant[to], "Confident bound");

        _confidant[to] = _msgSender();
        _confidantPermission.set(to, permission);

        emit Issue(to, tokenId);
    }

    function revoke(address from) external {
        require(from != address(0), "Address is empty");
        require(_confidant[to], "Confident must be bound");
        require(_confidant[to] == _msgSender(), "The account does bound to msg.sender attorney");

        delete(_confidant, from);
        _confidantPermission.remove(from);

        emit Revoke(from);
    }

    function refuse() external {
        require(_confidant[_msgSender()], "Confident must be bound");

        delete(_confidant, from);
        _confidantPermission.remove(from);

        emit Refuse(owner);
    }

    function fetchPermission(address owner) external view returns (uint256){
        require(_confidant[owner], "Confident must be bound");
        return _confidantPermission.get(owner);
    }

    function isOperator(address account) external view returns (bool) {
        return hasRole(OPERATOR_ROLE, account);
    }

    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
