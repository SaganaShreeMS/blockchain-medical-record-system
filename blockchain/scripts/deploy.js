import { ethers } from "ethers";
import fs from "fs";

const DEPARTMENTS = ["Reception", "Doctor", "Laboratory", "Pharmacy", "Admin"];

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

    const accounts = await provider.listAccounts();
    const deployerSigner = await provider.getSigner(accounts[0].address);

    console.log("Deploying from account:", accounts[0].address);

    const artifact = JSON.parse(
        fs.readFileSync("./artifacts/contracts/AuditLog.sol/AuditLog.json", "utf8")
    );

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployerSigner);

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ AuditLog contract deployed at:", contractAddress);

    // Register each department's Ganache account on-chain.
    // Must be called by the owner (account 0, the deployer) — matches
    // DEPARTMENT_ACCOUNT_INDEX in backend/config/blockchain.js.
    console.log("\nRegistering department accounts...");
    for (let i = 0; i < DEPARTMENTS.length; i++) {
        const dept = DEPARTMENTS[i];
        const account = accounts[i].address;

        const tx = await contract.registerDepartment(account, dept);
        await tx.wait();

        console.log(`  ${dept.padEnd(11)} -> ${account}`);
    }

    const deploymentInfo = {
        address: contractAddress,
        abi: artifact.abi
    };

    fs.writeFileSync(
        "./deployedContract.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nContract info saved to deployedContract.json");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});