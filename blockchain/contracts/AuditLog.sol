// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract AuditLog {

    struct LogEntry {
        uint256 patientId;
        string department;
        string action;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    event LogRecorded(
        uint256 indexed patientId,
        string department,
        string action,
        uint256 timestamp
    );

    // Records a new audit entry. Once added, it can NEVER be changed or removed.
    function recordLog(uint256 _patientId, string memory _department, string memory _action) public {
        logs.push(LogEntry({
            patientId: _patientId,
            department: _department,
            action: _action,
            timestamp: block.timestamp
        }));

        emit LogRecorded(_patientId, _department, _action, block.timestamp);
    }

    // Returns how many total log entries exist
    function getLogCount() public view returns (uint256) {
        return logs.length;
    }

    // Returns a specific log entry by its index
    function getLog(uint256 _index) public view returns (uint256, string memory, string memory, uint256) {
        LogEntry memory entry = logs[_index];
        return (entry.patientId, entry.department, entry.action, entry.timestamp);
    }
}