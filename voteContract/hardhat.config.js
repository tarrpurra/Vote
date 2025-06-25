require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    //  add the custom network here in the same formate
    avalanche: {
      name: "Avalanche Fuji Testnet",
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [
        process.env.PRIVATE_KEY, // Load the private key from .env file
      ],
    },
  },
};

//
