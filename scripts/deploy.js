const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying MythicNFTMarketplace...");
    console.log("Deployer address:", deployer.address);

    // ✅ Ethers v6 way
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        throw new Error("❌ Deployer has 0 ETH on Sepolia. Fund this address.");
    }

    const MythicNFTMarketplace = await ethers.getContractFactory("MythicNFTMarketplace");

    const marketplace = await MythicNFTMarketplace.deploy();
    await marketplace.waitForDeployment();

    console.log("✅ MythicNFTMarketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
