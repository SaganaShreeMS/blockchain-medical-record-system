# Secure QR-Based Medical Record Management System

## Overview
A blockchain-based healthcare application that improves medical record security using QR-based patient identification, department-specific access control, and blockchain audit logging.

## Features
- **QR-Based Patient Lookup:** Quickly identify patients and access their records.
- **Department-Specific Access:** Restricts access based on user roles and departments.
- **Medical Record Integrity:** Uses cryptographic hashes to detect unauthorized changes.
- **Blockchain Audit Logs:** Records important activities through smart contracts.
- **Chain Verification:** Checks the integrity of blockchain audit logs.
- **Admin Dashboard:** Supports patient lookup, record verification, and audit monitoring.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Blockchain:** Solidity, Hardhat, Ganache
- **Blockchain Interaction:** Ethers.js
- **Authentication:** JWT

## Blockchain Implementation
The Solidity smart contract records audit activities, including patient ID, department, action, timestamp, and hash links. It also supports audit chain verification.

Patient details and medical records are stored off-chain in MySQL, while blockchain-based mechanisms support auditability and integrity verification.

## Security
- JWT-based authentication
- Role-based authorization
- Department-specific access restrictions
- Cryptographic hash verification
- Tamper-evident blockchain audit logs

## Future Enhancements
- IPFS integration for decentralized storage
- Patient consent management
- Multi-factor authentication
- Integration with multiple healthcare institutions

**Key Focus:** Combining QR-based patient identification, department-specific access control, and blockchain-based medical record integrity verification.
