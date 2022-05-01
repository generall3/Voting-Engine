
import { task } from "hardhat/config";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

task("addVoting", "Creates new voting")
  .addParam("addresses", "List of applicants addresses")
  .setAction(async (taskArgs) => [
    const VotingEngine = await ethers.getContractFactory("VotingEngine");
  ])