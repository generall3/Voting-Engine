import { task } from "hardhat/config";

const contractAddress = "0x58DF30687526221BD6C6AB971BA185A1EC9304Fc";

task("withdraw", "Withdraws ether to owner address")
  .setAction(async (hre) => {
    const voting = await hre.ethers.getContractAt("VotingEngine", contractAddress);
    await voting.withdraw();
    console.log("Successfully withdrawal");
  })