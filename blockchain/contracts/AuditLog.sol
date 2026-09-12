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

    // Maps each blockchain address to its registered department.
    // Set once by the contract owner (the deploying account) — staff accounts
    // cannot register or change their own department.
    mapping(address => string) public registeredDepartment;

    event LogRecorded(
        uint256 indexed patientId,
        string department,
        string action,
        uint256 timestamp
    );

    event DepartmentRegistered(address account, string department);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Owner-only: register which department a given address represents.
    // Done once during setup for each of the 5 department accounts.
    function registerDepartment(address _account, string memory _department) public onlyOwner {
        registeredDepartment[_account] = _department;
        emit DepartmentRegistered(_account, _department);
    }

    // Records a new audit entry. The department is NOT taken from the caller's input —
    // it is looked up from the on-chain registry based on who is actually calling this
    // function (msg.sender). This is the core fix: the chain verifies identity itself,
    // rather than trusting whatever department string the backend sends.
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

    function getLogCount() public view returns (uint256) {
        return logs.length;
    }

    function getLog(uint256 _index) public view returns (uint256, string memory, string memory, uint256) {
        LogEntry memory entry = logs[_index];
        return (entry.patientId, entry.department, entry.action, entry.timestamp);
    }
}