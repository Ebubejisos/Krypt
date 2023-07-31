const { ethers } = require("hardhat");
// function that deploys our contract
const main = async () => {
  // generates instances of our contract
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  // for one instance of our contract
  const transactionsContract = await ethers.deployContract("Transactions");

  console.log("Transactions address: ", await transactionsContract.getAddress());

}

const runMain = async () => {
  try {
    await main();
    process.exit(0);// process is successful
  } catch (error) {
    console.error(error);
    process.exit(1);// error in process
  }
}

runMain();
