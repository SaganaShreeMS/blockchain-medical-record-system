// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract AuditLog {

    address public owner;

    struct LogEntry {
        uint256 patientId;
        string department;
        string action;
        uint256 timestamp;
        bytes32 previousHash;
        bytes32 entryHash;
    }

    LogEntry[] public logs;

    mapping(address => string) public registeredDepartment;
    mapping(string => bytes32) public recordHashes;

    event LogRecorded(
        uint256 indexed patientId,
        string department,
        string action,
        uint256 timestamp,
        bytes32 entryHash
    );

    event DepartmentRegistered(address account, string department);
    event RecordHashStored(string recordKey, bytes32 contentHash, address storedBy, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerDepartment(address _account, string memory _department) public onlyOwner {
        registeredDepartment[_account] = _department;
        emit DepartmentRegistered(_account, _department);
    }

    function recordLog(uint256 _patientId, string memory _action) public {
        string memory callerDepartment = registeredDepartment[msg.sender];
        require(bytes(callerDepartment).length > 0, "This address is not registered to any department");

        // Chain this entry to the previous one, like blocks in a blockchain.
        // The very first entry chains to a zero hash (genesis).
        bytes32 prevHash = logs.length == 0
            ? bytes32(0)
            : logs[logs.length - 1].entryHash;

        bytes32 thisEntryHash = keccak256(
            abi.encodePacked(_patientId, callerDepartment, _action, block.timestamp, prevHash)
        );

        logs.push(LogEntry({
            patientId: _patientId,
            department: callerDepartment,
            action: _action,
            timestamp: block.timestamp,
            previousHash: prevHash,
            entryHash: thisEntryHash
        }));

        emit LogRecorded(_patientId, callerDepartment, _action, block.timestamp, thisEntryHash);
    }

    function storeRecordHash(string memory _recordKey, bytes32 _contentHash) public {
        string memory callerDepartment = registeredDepartment[msg.sender];
        require(bytes(callerDepartment).length > 0, "This address is not registered to any department");

        recordHashes[_recordKey] = _contentHash;
        emit RecordHashStored(_recordKey, _contentHash, msg.sender, block.timestamp);
    }

    function getRecordHash(string memory _recordKey) public view returns (bytes32) {
        return recordHashes[_recordKey];
    }

    function getLogCount() public view returns (uint256) {
        return logs.length;
    }

    // Now also returns the chain-linking hashes, so the backend/UI can verify the chain
    function getLog(uint256 _index) public view returns (uint256, string memory, string memory, uint256, bytes32, bytes32) {
        LogEntry memory entry = logs[_index];
        return (entry.patientId, entry.department, entry.action, entry.timestamp, entry.previousHash, entry.entryHash);
    }
}