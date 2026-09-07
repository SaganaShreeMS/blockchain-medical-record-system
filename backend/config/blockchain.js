const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const deploymentInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'deployedContract.json'), 'utf8')
);

// Connect to Ganache
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

let contract;

async function getContract() {
    if (contract) return contract;

    const accounts = await provider.listAccounts();
    const signer = await provider.getSigner(accounts[0].address);

    contract = new ethers.Contract(deploymentInfo.address, deploymentInfo.abi, signer);
    return contract;
}

// Writes a new entry to the blockchain audit log
async function recordLog(patientId, department, action) {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.recordLog(patientId, department, action);
        await tx.wait();
        console.log(`⛓️  Blockchain log recorded: Patient ${patientId} | ${department} | ${action}`);
    } catch (err) {
        console.error('Blockchain logging failed:', err.message);
    }
}

// Reads all logs back from the blockchain
async function getAllLogs() {
    const contractInstance = await getContract();
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