// function that deploys our contract
const main = async () => {
  // generates instances of our contract
  const transactionsFactory = await hre.ethers.getContractFactory("Transactions");
  // for one instance of our contract
  const transactionsContract = await transactionsFactory.deploy();

  await transactionsContract.deployed();

  console.log("Transactions address: ", transactionsContract.address);

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
