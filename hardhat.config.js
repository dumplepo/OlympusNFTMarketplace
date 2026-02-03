require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Install dotenv: npm install dotenv

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Alchemy/Infura URL
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
};