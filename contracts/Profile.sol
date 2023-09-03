// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableMapUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

    error TokenTransferProhibited();

contract Profile is Initializable, ERC721Upgradeable, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableMapUpgradeable for EnumerableMapUpgradeable.AddressToUintMap;
    using EnumerableMapUpgradeable for EnumerableMapUpgradeable.UintToAddressMap;

    // Mapping from token ID to owner address
    EnumerableMapUpgradeable.UintToAddressMap private _ownerMap;
    EnumerableMapUpgradeable.AddressToUintMap private _tokenMap;
    mapping(address => string) private _profileMap;

    // Token Id
    CountersUpgradeable.Counter private _tokenId;

    event Mint(address indexed to, uint256 tokenId);
    event Burn(address indexed to, uint256 tokenId);

    /// @notice the constructor is not used since the contract is upgradeable except to disable initializers in the implementations that are deployed.
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name, string memory symbol) public initializer {
        __Ownable_init();
        __AccessControl_init();
        __ERC721_init(name, symbol);
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable) returns (string memory) {
        address owner = _ownerMap.get(tokenId, "Token not exist");
        return bytes(_profileMap[owner]).length > 0 ? _profileMap[owner] : "";
    }

    function mint(string memory data) external returns (uint256)  {
        uint256 tokenId = 0;
        if (_tokenMap.contains(msg.sender)) {
            tokenId = _tokenMap.get(msg.sender);
        } else {
            _tokenId.increment();
            tokenId = _tokenId.current();
            _tokenMap.set(msg.sender, tokenId);
            _ownerMap.set(tokenId, msg.sender);
        }

        _profileMap[msg.sender] = data;

        emit Mint(msg.sender, tokenId);

        return tokenId;
    }

    function burn() external {
        require(
            _tokenMap.contains(msg.sender),
            "The account does not have any SBT"
        );

        uint256 tokenId = _tokenMap.get(msg.sender);

        _tokenMap.remove(msg.sender);
        _ownerMap.remove(tokenId);
        delete _profileMap[msg.sender];

        emit Burn(msg.sender, tokenId);
    }

    function balanceOf(address owner) public view override(ERC721Upgradeable) returns (uint256) {
        (bool success,) = _tokenMap.tryGet(owner);
        return success ? 1 : 0;
    }

    function tokenIdOf(address from) external view returns (uint256) {
        return _tokenMap.get(from, "The wallet does not have a completed profile");
    }

    function ownerOf(uint256 tokenId) public view override(ERC721Upgradeable) returns (address) {
        return _ownerMap.get(tokenId, "Invalid tokenId");
    }

    function totalSupply() external view returns (uint256) {
        return _tokenMap.length();
    }

    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721Upgradeable, AccessControlUpgradeable)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721Upgradeable) {
        if (from != address(0)) revert TokenTransferProhibited();
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721Upgradeable) {
        if (from != address(0)) revert TokenTransferProhibited();
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override(ERC721Upgradeable) {
        if (from != address(0)) revert TokenTransferProhibited();
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}
}
