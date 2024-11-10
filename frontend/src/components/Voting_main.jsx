import { useState, useEffect } from "react";
import Web3 from "web3";
import VotingContract from "../../../build/contracts/VotingSystem.json"; // Update the path to your ABI
import { useNavigate } from "react-router-dom";

export default function Voting() {
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([
    { name: "Party A", totalVotes: 0, index: 0 },
    { name: "Party B", totalVotes: 0, index: 1 },
    { name: "Party C", totalVotes: 0, index: 2 },
  ]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedParty, setUserVotedParty] = useState(null); // New state to track voted party
  const [winningParty, setWinningParty] = useState(null); // New state for winning party
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const contractAddress = "0xdD816a39fFB314fCD5C04f95F92a7fA18B598311"; // Replace with your contract address

  useEffect(() => {
    async function initializeWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(
          VotingContract.abi,
          contractAddress
        );
        setContract(contractInstance);

        checkIfVoted(contractInstance, accounts[0]);

        // Get current gas price
        const currentGasPrice = await web3Instance.eth.getGasPrice();
        setGasPrice(currentGasPrice);

        // Load initial vote counts from the contract
        loadVoteCounts(contractInstance);
      } else {
        alert("Please install MetaMask to use this application.");
      }
    }
    initializeWeb3();
  }, []);

  // Load vote counts for each party from the contract
  async function loadVoteCounts(contractInstance) {
    const updatedParties = [...parties];
    for (let i = 0; i < parties.length; i++) {
      const totalVotes = await contractInstance.methods
        .getPartyVotes(i)
        .call();
      updatedParties[i].totalVotes = parseInt(totalVotes);
    }
    setParties(updatedParties);
    calculateWinningParty(updatedParties); // Update winning party
  }

  // Check if the user has already voted
  async function checkIfVoted(contractInstance, userAddress) {
    const voted = await contractInstance.methods.hasVoted(userAddress).call();
    setHasVoted(voted);

    if (voted) {
      // Retrieve the party the user voted for
      const votedPartyIndex = await contractInstance.methods
        .getVoterParty(userAddress)
        .call();
      setUserVotedParty(parties[votedPartyIndex]);
    }
  }

  // Estimate gas cost for voting
  async function estimateGasCost(partyIndex) {
    if (!web3 || !contract) return;

    try {
      const gasEstimate = await contract.methods.vote(partyIndex).estimateGas({
        from: account,
      });
      setEstimatedGas(gasEstimate);

      const estimatedCostInWei = gasEstimate * gasPrice;
      const estimatedCostInEth = web3.utils.fromWei(
        estimatedCostInWei.toString(),
        "ether"
      );
      setEstimatedCost(estimatedCostInEth);
    } catch (error) {
      console.error("Error estimating gas:", error);
    }
  }

  // Handle voting for a selected party
  async function vote() {
    if (!web3 || !contract || selectedParty === null) return;

    try {
      await contract.methods.vote(selectedParty.index).send({
        from: account,
      });
      setHasVoted(true);
      setUserVotedParty(selectedParty); // Set the voted party

      // Update the vote counts after voting
      loadVoteCounts(contract);
    } catch (error) {
      console.error("Error while voting:", error);
      alert("There was an error while voting. Please try again.");
    }
  }

  // Calculate which party is currently winning
  function calculateWinningParty(updatedParties) {
    let maxVotes = -1;
    let leadingParty = null;
    for (let party of updatedParties) {
      if (party.totalVotes > maxVotes) {
        maxVotes = party.totalVotes;
        leadingParty = party.name;
      } else if (party.totalVotes === maxVotes) {
        leadingParty = "It's a tie!";
      }
    }
    setWinningParty(leadingParty);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Decentralized Voting System</h1>
      <p className="mb-4">Your account: {account || "Not connected"}</p>

      {winningParty && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Current leading party:{" "}
            <span className="text-blue-600">{winningParty}</span>
          </h2>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        {!hasVoted ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Select a Party to Vote</h2>
            <div className="space-y-4">
              {parties.map((party) => (
                <div key={party.index} className="flex items-center">
                  <input
                    type="radio"
                    id={`party-${party.index}`}
                    name="party"
                    value={party.index}
                    onChange={() => {
                      setSelectedParty(party);
                      estimateGasCost(party.index);
                    }}
                    disabled={hasVoted}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <label htmlFor={`party-${party.index}`} className="ml-2">
                    <span className="font-medium">{party.name}</span>{" "}
                    <span className="text-gray-600">
                      - {party.totalVotes} votes
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {selectedParty && estimatedCost && (
              <p className="mt-4 text-gray-700">
                Estimated transaction cost:{" "}
                <span className="font-semibold">{estimatedCost} ETH</span>
              </p>
            )}

            <button
              onClick={vote}
              disabled={hasVoted || !selectedParty}
              className={`mt-6 w-full px-4 py-2 text-white font-semibold rounded-lg ${
                hasVoted || !selectedParty
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Cast Vote
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Thank you for voting!</h2>
            <p className="mb-4">
              You voted for:{" "}
              <span className="font-semibold text-blue-600">
                {userVotedParty?.name}
              </span>
            </p>
            <button
              onClick={() => navigate("/")} // Navigate back to the front page
              className="mt-4 w-full px-4 py-2 text-white font-semibold rounded-lg bg-green-600 hover:bg-green-700"
            >
              Go Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
