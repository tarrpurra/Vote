// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Party {
        string partyName;
        uint256 totalVotes;
    }

    address public owner;
    mapping(address => bool) public hasVoted;       // Tracks if an address has voted
    mapping(address => uint256) public voterParty;  // Stores the party index a voter voted for
    Party[3] public parties;                        // Array to store the 3 fixed parties

    // Events
    event VoteCast(address voter, string partyName);

    // Modifier to restrict certain functions to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    // Constructor to set the 3 fixed parties and the contract deployer as the owner
    constructor() {
        owner = msg.sender;

        // Initialize the 3 fixed parties
        parties[0] = Party({partyName: "Party A", totalVotes: 0});
        parties[1] = Party({partyName: "Party B", totalVotes: 0});
        parties[2] = Party({partyName: "Party C", totalVotes: 0});
    }

    // Function to vote for a party by index (0, 1, or 2)
    function vote(uint partyIndex) public {
        require(partyIndex < 3, "Invalid party index.");
        require(!hasVoted[msg.sender], "You have already voted.");

        // Register the vote
        parties[partyIndex].totalVotes += 1;
        hasVoted[msg.sender] = true;        // Mark voter as having voted
        voterParty[msg.sender] = partyIndex; // Store the party index the voter voted for

        emit VoteCast(msg.sender, parties[partyIndex].partyName);
    }

    // Get total votes for a specific party by index
    function getPartyVotes(uint partyIndex) public view returns (uint256) {
        require(partyIndex < 3, "Invalid party index.");
        return parties[partyIndex].totalVotes;
    }

    // Get all parties' names and their total votes
    function getAllPartyVotes() public view returns (string[3] memory, uint256[3] memory) {
        string[3] memory names;
        uint256[3] memory votes;

        for (uint i = 0; i < 3; i++) {
            names[i] = parties[i].partyName;
            votes[i] = parties[i].totalVotes;
        }

        return (names, votes);
    }

    // Get the party index a voter voted for
    function getVoterParty(address voter) public view returns (uint256) {
        require(hasVoted[voter], "This address has not voted.");
        return voterParty[voter];
    }
}
