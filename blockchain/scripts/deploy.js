import { ethers } from "ethers";
import fs from "fs";

async function main() {
    // Connect to your local Ganache blockchain
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

    // Use the first Ganache test account to deploy (it has 100 fake ETH)
    // Ganache's default accounts are deterministic when using Quickstart,
    // but we'll fetch the actual private key dynamically for safety.
    const accounts = await provider.listAccounts();
    const signer = await provider.getSigner(accounts[0].address);

    console.log("Deploying from account:", accounts[0].address);

    // Load the compiled contract's ABI and bytecode
    const artifact = JSON.parse(
        fs.readFileSync("./artifacts/contracts/AuditLog.sol/AuditLog.json", "utf8")
    );

    // Create a "factory" - a blueprint for deploying this specific contract
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    // Deploy it
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log("✅ AuditLog contract deployed at:", contractAddress);

    // Save the address + ABI so our backend can use them later
    const deploymentInfo = {
        address: contractAddress,
        abi: artifact.abi
    };

    fs.writeFileSync(
        "./deployedContract.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Contract info saved to deployedContract.json");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});