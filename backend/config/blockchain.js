const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const deploymentInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'deployedContract.json'), 'utf8')
);

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

const DEPARTMENT_ACCOUNT_INDEX = {
    Reception: 0,
    Doctor: 1,
    Laboratory: 2,
    Pharmacy: 3,
    Admin: 4
};

let readOnlyContract;
async function getReadOnlyContract() {
    if (readOnlyContract) return readOnlyContract;
    readOnlyContract = new ethers.Contract(deploymentInfo.address, deploymentInfo.abi, provider);
    return readOnlyContract;
}

const contractCache = {};
async function getContractForDepartment(department) {
    const index = DEPARTMENT_ACCOUNT_INDEX[department];
    if (index === undefined) {
        throw new Error(`No blockchain account mapped for department: ${department}`);
    }
    if (contractCache[department]) return contractCache[department];

    const accounts = await provider.listAccounts();
    const signer = await provider.getSigner(accounts[index].address);
    contractCache[department] = new ethers.Contract(deploymentInfo.address, deploymentInfo.abi, signer);
    return contractCache[department];
}

// Ensures only ONE transaction is ever in-flight per department account at a time,
// preventing nonce collisions when multiple recordLog/storeRecordHash calls fire
// close together for the same department (very common, since controllers don't
// await these calls before responding).
const departmentQueues = {};
function queueForDepartment(department, taskFn) {
    const previous = departmentQueues[department] || Promise.resolve();
    const current = previous.then(taskFn, taskFn);
    departmentQueues[department] = current.catch(() => {}); // don't let one failure jam the queue
    return current;
}

const GAS_LIMIT = 500000n;

function hashRecordContent(fields) {
    const combined = fields.join('|');
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    return '0x' + hash;
}

async function recordLog(patientId, department, action) {
    try {
        await queueForDepartment(department, async () => {
            const contractInstance = await getContractForDepartment(department);
            const tx = await contractInstance.recordLog(patientId, action, { gasLimit: GAS_LIMIT });
            const receipt = await tx.wait();
            console.log(`⛓️  Logged by ${department} (${(await contractInstance.runner.getAddress()).slice(0, 10)}...): Patient ${patientId} | ${action} | block ${receipt.blockNumber}`);
        });
    } catch (err) {
        console.error('Blockchain logging failed:', err.message);
    }
}

async function storeRecordHash(recordKey, contentHash, department) {
    try {
        await queueForDepartment(department, async () => {
            const contractInstance = await getContractForDepartment(department);
            const tx = await contractInstance.storeRecordHash(recordKey, contentHash, { gasLimit: GAS_LIMIT });
            await tx.wait();
            console.log(`🔒 Hash stored for ${recordKey}`);
        });
    } catch (err) {
        console.error('Storing record hash failed:', err.message);
    }
}

async function getRecordHash(recordKey) {
    const contractInstance = await getReadOnlyContract();
    return await contractInstance.getRecordHash(recordKey);
}

async function getAllLogs() {
    const contractInstance = await getReadOnlyContract();
    const count = await contractInstance.getLogCount();

    // Fetch all LogRecorded events once, so we can match each log entry
    // to its actual transaction hash and block number
    const events = await contractInstance.queryFilter('LogRecorded', 0, 'latest');

    const logs = [];
    for (let i = 0; i < count; i++) {
        const entry = await contractInstance.getLog(i);
        const matchingEvent = events[i]; // events fire in the same order entries are added

        logs.push({
            patientId: entry[0].toString(),
            department: entry[1],
            action: entry[2],
            timestamp: new Date(Number(entry[3]) * 1000).toISOString(),
            previousHash: entry[4],
            entryHash: entry[5],
            txHash: matchingEvent ? matchingEvent.transactionHash : null,
            blockNumber: matchingEvent ? matchingEvent.blockNumber : null
        });
    }

    return logs;
}

async function verifyLogChain() {
    const contractInstance = await getReadOnlyContract();
    const count = await contractInstance.getLogCount();

    let expectedPrevHash = '0x' + '0'.repeat(64);

    for (let i = 0; i < count; i++) {
        const entry = await contractInstance.getLog(i);
        const [patientId, department, action, timestamp, previousHash, entryHash] = entry;

        if (previousHash.toLowerCase() !== expectedPrevHash.toLowerCase()) {
            return {
                valid: false,
                brokenAtIndex: i,
                message: `Chain broken at log entry ${i} — its recorded previous-hash doesn't match the actual previous entry.`
            };
        }

        const recomputed = ethers.keccak256(
            ethers.solidityPacked(
                ['uint256', 'string', 'string', 'uint256', 'bytes32'],
                [patientId, department, action, timestamp, previousHash]
            )
        );

        if (recomputed.toLowerCase() !== entryHash.toLowerCase()) {
            return {
                valid: false,
                brokenAtIndex: i,
                message: `Chain broken at log entry ${i} — its content hash doesn't match what's recorded on-chain.`
            };
        }

        expectedPrevHash = entryHash;
    }

    return {
        valid: true,
        entriesChecked: Number(count),
        message: `All ${count} log entries verified — chain is fully intact.`
    };
}

module.exports = { recordLog, getAllLogs, hashRecordContent, storeRecordHash, getRecordHash, verifyLogChain };