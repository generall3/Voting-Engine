import { task } from "hardhat/config";

const contractAddress = "0x58DF30687526221BD6C6AB971BA185A1EC9304Fc";

task("vote", "Votes in a certain vote for a certain candidate ")
  .addParam("votingId", "Index of certain voting")
  .addParam("applicantId", "Index of certain applicant")
  .setAction(async (taskArgs, hre) => {
    const voting = await hre.ethers.getContractAt("VotingEngine", contractAddress);
    await voting.vote(taskArgs.votingId, taskArgs.applicantId);
    console.log("Successfully voted!");
  })
