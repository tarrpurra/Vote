const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("VotingSystem", function () {
  async function deployVotingFixture() {
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const [owner, addr1, addr2] = await ethers.getSigners();
    const voting = await VotingSystem.deploy();
    return { voting, owner, addr1, addr2 };
  }

  it("Should start voting with options and whitelist enabled", async function () {
    const { voting, owner } = await loadFixture(deployVotingFixture);

    const options = ["Instagram", "LinkedIn"];
    const duration = 10;
    const whitelistEnabled = true;

    await voting.startVoting(options, duration, whitelistEnabled);

    expect(await voting.Owner()).to.equal(owner.address);
    expect(await voting.getAllOptions()).to.deep.equal(options);
  });

  it("Should add addresses to whitelist", async function () {
    const { voting, addr1, addr2 } = await loadFixture(deployVotingFixture);
    await voting.startVoting(["X"], 10, true);

    await voting.addToWhitelist([addr1.address, addr2.address]);

    expect(await voting.whiteListed(addr1.address)).to.equal(true);
    expect(await voting.whitelisted(addr2.address)).to.equal(true);
  });

  it("Should allow a whitelisted address to vote", async function () {
    const { voting, addr1 } = await loadFixture(deployVotingFixture);
    await voting.startVoting(["X"], 10, true);
    await voting.addToWhitelist([addr1.address]);

    await voting.connect(addr1).vote("X");
    expect((await voting.Options("X")).Votes).to.equal(1);
  });

  it("Should reject vote from non-whitelisted address if enabled", async function () {
    const { voting, addr2 } = await loadFixture(deployVotingFixture);
    await voting.startVoting(["X"], 10, true);
    await expect(voting.connect(addr2).vote("X")).to.be.revertedWith("Not whitelisted to vote");
  });

  it("Should allow any user to vote if whitelist is disabled", async function () {
    const { voting, addr2 } = await loadFixture(deployVotingFixture);
    await voting.startVoting(["X"], 10, false);

    await voting.connect(addr2).vote("X");
    expect((await voting.Options("X")).Votes).to.equal(1);
  });

  it("Should prevent double voting", async function () {
    const { voting, addr2 } = await loadFixture(deployVotingFixture);
    await voting.startVoting(["X"], 10, false);
    await voting.connect(addr2).vote("X");

    await expect(voting.connect(addr2).vote("X")).to.be.revertedWith("You have already voted");
  });

  it("Should return the correct winner", async function () {
    const { voting, addr1, addr2 } = await loadFixture(deployVotingFixture);
    await voting.startVoting(["X", "Y"], 1, false);
    await voting.connect(addr1).vote("X");
    await voting.connect(addr2).vote("X");

    // Fast-forward time to after voting ends
    await ethers.provider.send("evm_increaseTime", [61 * 60]);
    await ethers.provider.send("evm_mine");

    const [winnerName, voteCount] = await voting.getWinner();
    expect(winnerName).to.equal("X");
    expect(voteCount).to.equal(2);
  });
});
