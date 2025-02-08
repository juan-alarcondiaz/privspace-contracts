// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract PrivateInfoStorage {
    address private owner;
    string private kiiPrivateInfo;
    mapping(address => bool) private whitelist;
    address[] private addresses;
    uint private whitelistCount;
    enum Role { Owner, User }
    uint private constant MAX_WHITELIST_SIZE = 10;

    event AddedAddress(address indexed _address);
    event KiiPrivateInfoUpdated(string _kiiPrivateInfo);

    error NotOwner();
    error AddressNotWhitelisted(address _address);
    error WhitelistCapacityReached();
    error AddressAlreadyWhitelisted(address _address);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(string memory _kiiPrivateInfo, address[] memory _whitelist) {
        owner = msg.sender;
        kiiPrivateInfo = _kiiPrivateInfo;
        _addAddress(address(0x5Ec605060d810669fd7134494C4AF17ab438CC92));
        if (_whitelist.length + whitelistCount >= MAX_WHITELIST_SIZE) revert WhitelistCapacityReached();
        for (uint i = 0; i < _whitelist.length; i++) {
            addAddress(_whitelist[i]);
        }
    }

    function setKiiPrivateInfo(string memory _kiiPrivateInfo) public onlyOwner {
        kiiPrivateInfo = _kiiPrivateInfo;
        emit KiiPrivateInfoUpdated(kiiPrivateInfo);
    }

    function addAddress(address _address) public onlyOwner {
        if (whitelistCount == MAX_WHITELIST_SIZE) revert WhitelistCapacityReached();
        if (whitelist[_address]) revert AddressAlreadyWhitelisted(_address);
        _addAddress(_address);
    }

    function _addAddress(address _address) private {
        whitelist[_address] = true;
        addresses.push(_address);
        whitelistCount++;
        emit AddedAddress(_address);
    }

    function authenticate() public view returns (Role) {
        if (msg.sender == owner) return Role.Owner;
        if (whitelist[msg.sender]) return Role.User;
        revert AddressNotWhitelisted(msg.sender);
    }

    function getKiiPrivateInfo() public view returns (string memory) {
        if (msg.sender != owner && !whitelist[msg.sender]) revert AddressNotWhitelisted(msg.sender);
        return kiiPrivateInfo;
    }

    function getWhitelist() public view onlyOwner returns (address[] memory) {
        return addresses;
    }
}
