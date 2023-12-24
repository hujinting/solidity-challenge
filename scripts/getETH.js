require("dotenv").config();
const ethers = require("ethers");
const ETHPool = require("../artifacts/contracts/ETHPool.sol/ETHPool.json");

const {API_KEY, PRIVATE_KEY, CONTRACT_ADDRESS} = process.env;
const abi = ETHPool.abi;

const provider = new ethers.InfuraProvider("sepolia", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const ethPool = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

const getETH = async() => {
    //const tx = await ethPool.deposit({value: ethers.parseEther("0.1")});
    //await tx.wait();
    const balance = await provider.getBalance(ethPool.target);
    console.log(`ETHPool balance is ${balance}`);

}

getETH()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });