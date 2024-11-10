// migrations/2_deploy_PrivateVoting.js
const PrivateVoting = artifacts.require("VotingSystem");

module.exports = function(deployer) {
  deployer.deploy(PrivateVoting);
};


