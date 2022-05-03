import { task } from "hardhat/config";

const contractAddress = "0x58DF30687526221BD6C6AB971BA185A1EC9304Fc";

task("finish", "Ends a certain vote")
  .addParam("votingId", "Index of certain voting")
  .setAction(async (taskArgs, hre) => {
    const voting = await hre.ethers.getContractAt("VotingEngine", contractAddress);
    await voting.finish(taskArgs.votingId);
    console.log("Voting successfuly ended!");
  })
