import { task } from "hardhat/config";

const contractAddress = "0x58DF30687526221BD6C6AB971BA185A1EC9304Fc";

task("addVoting", "Creates a new voting with given addresses")
  .addParam("addresses", "List of addresses")
  .setAction(async (taskArgs, hre) => {
    const applicants = taskArgs.addresses.split(" ");
    const voting = await hre.ethers.getContractAt("VotingEngine", contractAddress);
    await voting.addVoting(applicants);
    console.log("Successfully created new voting!");
  })