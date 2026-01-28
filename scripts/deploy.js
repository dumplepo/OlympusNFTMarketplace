const { ethers } = require("hardhat");

async function main() {
    const MythicNFTMarketplace = await ethers.getContractFactory("MythicNFTMarketplace");

    console.log("Deploying MythicNFTMarketplace...");

    // In Ethers v6, deploy() returns a promise that resolves to the contract instance
    const marketplace = await MythicNFTMarketplace.deploy();

    // Wait for the deployment to be mined/confirmed
    await marketplace.waitForDeployment();

    // Access the address using .target instead of .address
    console.log("MythicNFTMarketplace deployed to:", await marketplace.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });