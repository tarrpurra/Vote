const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingSystemModule", (m) => {
  const votingSystem = m.contract("VotingSystem");

  return { votingSystem };
});
