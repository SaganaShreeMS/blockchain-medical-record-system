// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract AuditLog {

    address public owner;

    struct LogEntry {
        uint256 patientId;
        string department;
        string action;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    mapping(address => string) public registeredDepartment;

    // Stores a content fingerprint for each medical record, keyed by a
    // record identifier (e.g. "medical_record:14" or "lab_report:7").
    // Anyone can later recompute the hash of the current MySQL content
    // and compare it here to prove whether it has been altered.
    mapping(string => bytes32) public recordHashes;

    event LogRecorded(
        uint256 indexed patientId,
        string department,
        string action,
        uint256 timestamp
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

        logs.push(LogEntry({
            patientId: _patientId,
            department: callerDepartment,
            action: _action,
            timestamp: block.timestamp
        }));

        emit LogRecorded(_patientId, callerDepartment, _action, block.timestamp);
    }

    // Stores the content hash for a record. Called once when a medical
    // record / lab report is created, using a hash computed by the backend
    // from the exact same fields saved to MySQL.
    function storeRecordHash(string memory _recordKey, bytes32 _contentHash) public {
        string memory callerDepartment = registeredDepartment[msg.sender];
        require(bytes(callerDepartment).length > 0, "This address is not registered to any department");

        recordHashes[_recordKey] = _contentHash;
        emit RecordHashStored(_recordKey, _contentHash, msg.sender, block.timestamp);
    }

    // Read-only: fetch the stored hash for a given record key, to compare
    // against a freshly computed hash of the current MySQL data.
    function getRecordHash(string memory _recordKey) public view returns (bytes32) {
        return recordHashes[_recordKey];
    }

    function getLogCount() public view returns (uint256) {
        return logs.length;
    }

    function getLog(uint256 _index) public view returns (uint256, string memory, string memory, uint256) {
        LogEntry memory entry = logs[_index];
        return (entry.patientId, entry.department, entry.action, entry.timestamp);
    }
}