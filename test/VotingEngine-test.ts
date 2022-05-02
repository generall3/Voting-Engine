import { run, ethers, network } from "hardhat";
import { Signer, BigNumber, Contract, ContractFactory } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("VotingEngine", function () {
    let timeDelay = 3 * 24 * 60 * 60;

    let owner: SignerWithAddress
    let applicant1: SignerWithAddress
    let applicant2: SignerWithAddress
    let voter1: SignerWithAddress
    let voter2: SignerWithAddress
    let voting: Contract
    let VotingEngine: ContractFactory

    beforeEach(async function () {
      [owner, applicant1, applicant2, voter1, voter2] = await ethers.getSigners()
      VotingEngine = await ethers.getContractFactory("VotingEngine");
      voting = await VotingEngine.deploy();
      await voting.deployed();
    });

    describe("Basic properties", () => {
      it("feeRate should be 10**16", async () => {
        expect((await voting.feeRate()).toString()).to.equal((10**16).toString());
      });

      it("voteTime should be 3 days", async () => {
        expect(await voting.voteTime()).to.equal((3*24*60*60).toString());
      });

      it("percentFee should be 10", async () => {
        expect(await voting.percentFee()).to.equal(10);
      });

      it("feeSum should be 0", async () => {
        expect(await voting.feeSum()).to.equal(0);
      });

      it("votingCounter should be 0", async() => {
        expect(await voting.votingCounter()).to.equal(0);
      });

      it("owner address should be correct", async() => {
        expect(await voting.owner()).to.equal(owner.address);
      });
    });

  describe("addVoting", () => {
    it("Only owner can call function", async () => {
      expect(voting.connect(applicant1).addVoting([applicant1.address],[applicant2.address])).to.be.revertedWith("You are not an owner!")
    });

    it("Should create correct voting with given addresses", async () => {
      const applicantsList = ([applicant1.address, applicant2.address]).toString();
      await voting.addVoting([applicant1.address, applicant2.address]);
      expect((await voting.getApplicants(0)).toString()).to.equal(applicantsList);
    });

    it("Should increase votingCounter by 1 after creating new voting", async () => {
      await voting.addVoting([applicant1.address, applicant2.address]);
      expect(await voting.votingCounter()).to.equal(1);
    });

    it("addVoting should emit event", async () => {
      expect(voting.addVoting([applicant1.address, applicant2.address])).to.be.emit(voting, "VotingCreated");
    });
  });

  describe("vote", () => {
    it("Should revert if incorrect amount", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.001")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      expect(voting.vote(0,0, fee)).to.be.revertedWith("Incorrect fee amount!");
    });

    it("Should revert if voting index is incorrect", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await expect(voting.connect(voter1).vote(1,0, fee)).to.be.revertedWith("Incorrect voting index!");
    }); 
  });

  describe("finish", () => {

    it("Should revert if voting time is not ended", async () => {
      await voting.addVoting([applicant1.address, applicant2.address]);
      expect(voting.finish(0)).to.be.revertedWith("Voting time is not ended");
    });

    it("Should revert if incorrect voting index", async () => {
      await voting.addVoting([applicant1.address, applicant2.address]);
    });

  });

  describe("withdraw", () => {
    it("Only owner can withdraw", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await voting.connect(voter1).vote(0,1, fee);
      await voting.connect(voter2).vote(0,1, fee);
      await network.provider.send("evm_increaseTime", [3*24*60*60]);
      await voting.connect(voter2).finish(0);
      await expect(voting.connect(voter1).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("After withdraw feeSum should be equal 0", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await voting.connect(voter1).vote(0,1, fee);
      await voting.connect(voter2).vote(0,1, fee);
      await network.provider.send("evm_increaseTime", [3*24*60*60]);
      await voting.connect(voter2).finish(0);
      await voting.withdraw();
      expect(await voting.feeSum()).to.eq(0);
    })
  });

  describe("getApplicants", () => {
    it("Should correctly show array of applicants", async () => {
      const applicantsList = ([applicant1.address, applicant2.address]).toString();
      await voting.addVoting([applicant1.address, applicant2.address]);
      expect((await voting.getApplicants(0)).toString()).to.equal(applicantsList);
    });
  });

  describe("getVotes", () => {
    it("Should correctly show array of votes 1", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await voting.connect(voter1).vote(0,1, fee);
      await voting.connect(voter2).vote(0,1, fee);
      expect((await voting.getVotes(0)).toString()).to.equal("0,2");
    });
    it("Should correctly show array of votes 2", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await voting.connect(voter1).vote(0,1, fee);
      await voting.connect(voter2).vote(0,0, fee);
      expect((await voting.getVotes(0)).toString()).to.equal("1,1");
    });
  });

  describe("getVotingTime", () => {
    it("Should correctly show endsAt", async () => {
      const duration = 3 * 24 * 60 * 60;
      await voting.addVoting([applicant1.address, applicant2.address]);
      const [startAtTime, endsAtTime] = (await voting.getEndsAt(0));
      expect(endsAtTime).to.eq(startAtTime.add(duration));
    });
  });

  describe("getWinner", () => {
    it("Should correctly show the winner of voting", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await voting.connect(voter1).vote(0,1, fee);
      await voting.connect(voter2).vote(0,1, fee);
      await network.provider.send("evm_increaseTime", [3*24*60*60]);
      await voting.connect(voter1).finish(0);
      expect(await voting.getWinner(0)).to.eq(applicant2.address);
    });
  });

  describe("isVotingStopped", () => {
    it("Should correctly show voting condition 1", async () => {
      await voting.addVoting([applicant1.address, applicant2.address]);
      expect(await voting.isVotingStopped(0)).to.eq(false);
    });

    it("Should correctly show voting condition 2", async () => {
      let fee = {
        value: await ethers.utils.parseEther("0.01")
      };
      await voting.addVoting([applicant1.address, applicant2.address]);
      await voting.connect(voter1).vote(0,1, fee);
      await voting.connect(voter2).vote(0,1, fee);
      await network.provider.send("evm_increaseTime", [3*24*60*60]);
      await voting.connect(voter2).finish(0);
      expect(await voting.isVotingStopped(0)).to.eq(true);
    });
  });
});