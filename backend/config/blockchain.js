const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const deploymentInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'deployedContract.json'), 'utf8')
);

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

// Each department signs with its OWN Ganache account, not a shared one.
// Index corresponds to the order accounts appear in Ganache's "Accounts" tab.
const DEPARTMENT_ACCOUNT_INDEX = {
    Reception: 0,
    Doctor: 1,
    Laboratory: 2,
    Pharmacy: 3,
    Admin: 4
};

// A read-only contract instance (no signer needed) for GET-style calls
let readOnlyContract;
async function getReadOnlyContract() {
    if (readOnlyContract) return readOnlyContract;
    readOnlyContract = new ethers.Contract(deploymentInfo.address, deploymentInfo.abi, provider);
    return readOnlyContract;
}

// A signed contract instance, using the specific account for this department
async function getContractForDepartment(department) {
    const index = DEPARTMENT_ACCOUNT_INDEX[department];

    if (index === undefined) {
        throw new Error(`No blockchain account mapped for department: ${department}`);
    }

    const accounts = await provider.listAccounts();
    const signer = await provider.getSigner(accounts[index].address);

    return new ethers.Contract(deploymentInfo.address, deploymentInfo.abi, signer);
}

// Writes a new entry to the blockchain audit log, signed by THIS department's own account
async function recordLog(patientId, department, action) {
    try {
        const contractInstance = await getContractForDepartment(department);
        const tx = await contractInstance.recordLog(patientId, action);
        await tx.wait();
        console.log(`⛓️  Logged by ${department} (${(await contractInstance.runner.getAddress()).slice(0, 10)}...): Patient ${patientId} | ${action}`);
    } catch (err) {
        console.error('Blockchain logging failed:', err.message);
    }
}

// Reads all logs back from the blockchain (read-only, no signer/gas needed)
async function getAllLogs() {
    const contractInstance = await getReadOnlyContract();
    const count = await contractInstance.getLogCount();

    const logs = [];
    for (let i = 0; i < count; i++) {
        const entry = await contractInstance.getLog(i);
        logs.push({
            patientId: entry[0].toString(),
            department: entry[1],
            action: entry[2],
            timestamp: new Date(Number(entry[3]) * 1000).toISOString()
        });
    }

    return logs;
}

module.exports = { recordLog, getAllLogs };