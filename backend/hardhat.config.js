require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon_mainnet: {
      chainId: 137,
      url: process.env.POLYGON_MAINNET_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
