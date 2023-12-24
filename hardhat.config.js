require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const {API_URL, PRIVATE_KEY} = process.env
module.exports = {
  solidity: "0.8.19",
  etherscan: {
    apiKey: "TD6N6C5I6VWMA7VR1YYVDQ6NTA78BX2DQX",
  },
  networks:{
    sepolia: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
      }
    }  
};
