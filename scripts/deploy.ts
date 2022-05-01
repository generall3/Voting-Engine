import { ethers } from "hardhat";

async function main() {
    const VotingEngine = await ethers.getContractFactory("VotingEngine");
    const voting = await VotingEngine.deploy();

    await voting.deployed();

    console.log("VotingEngine deployed to:", voting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });