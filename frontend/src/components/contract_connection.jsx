// contractConnection.js
import Web3 from "web3";
import VotingContract from "../../abi.json"; // Update the path if needed

const CONTRACT_ADDRESS = "0x3C6E4a239DC9C359bb6Ab0E72ccD3824856A01Ab"; // Replace with your actual deployed contract address

export async function initializeContract() {
  if (!window.ethereum) {
    alert("MetaMask not found. Please install MetaMask to continue.");
    throw new Error("MetaMask not found. Please install MetaMask to continue.");
  }
  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await web3.eth.getAccounts();
  const contractInstance = new web3.eth.Contract(
    VotingContract.abi,
    CONTRACT_ADDRESS
  );
  return { web3, contract: contractInstance, account: accounts[0] };
}

// Create a new poll
export async function createPoll(
  contract,
  account,
  name,
  options,
  durationInMinutes,
  whitelistEnabled,
  whitelistAddresses
) {
  return await contract.methods
    .createPoll(
      name,
      options,
      durationInMinutes,
      whitelistEnabled,
      whitelistAddresses
    )
    .send({ from: account });
}

// Get all poll IDs
export async function getAllPollIds(contract) {
  return await contract.methods.getAllPollIds().call();
}

// Get poll summary (basic info)
export async function getPollSummary(contract, pollId) {
  return await contract.methods.getPollSummary(pollId).call();
}

// Get poll options (array of option names)
export async function getPollOptions(contract, pollId) {
  return await contract.methods.getPollOptions(pollId).call();
}

// Get poll votes (array of vote counts per option)
export async function getPollVotes(contract, pollId) {
  return await contract.methods.getPollVotes(pollId).call();
}

// Get poll voters (array of addresses)
export async function getPollVoters(contract, pollId) {
  return await contract.methods.getPollVoters(pollId).call();
}

// Vote in a poll
export async function vote(contract, pollId, optionName, account) {
  return await contract.methods
    .vote(pollId, optionName)
    .send({ from: account });
}

// Check if an address has voted in a poll
export async function hasVoted(contract, pollId, address) {
  return await contract.methods.hasVoted(pollId, address).call();
}

// Check if an address is whitelisted for a poll
export async function isWhitelisted(contract, pollId, address) {
  return await contract.methods.isWhitelisted(pollId, address).call();
}

// Get winner for a poll (after voting ends)
export async function getWinner(contract, pollId) {
  return await contract.methods.getWinner(pollId).call();
}
