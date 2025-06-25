// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Option {
        string OptionName;
        uint256 Votes;
    }

    struct Voter {
        bool Voted;
    }

    struct Poll {
        uint id;
        string name;
        string[] optionNames;
        mapping(string => uint) votes;
        mapping(address => bool) hasVoted;
        mapping(address => bool) whitelisted;
        bool whitelistEnabled;
        address creator;
        uint start;
        uint end;
        address[] voters;
        bool exists;
    }

    uint public pollCount;
    mapping(uint => Poll) private polls;
    uint[] public pollIds;

    event PollCreated(uint indexed pollId, string name, address creator, uint start, uint end, bool whitelistEnabled);
    event Voted(uint indexed pollId, address voter, string option);

    modifier pollExists(uint pollId) {
        require(polls[pollId].exists, "Poll does not exist");
        _;
    }

    modifier onlyDuringVoting(uint pollId) {
        require(block.timestamp >= polls[pollId].start && block.timestamp <= polls[pollId].end, "Voting is not active");
        _;
    }

    modifier onlyAfterVoting(uint pollId) {
        require(block.timestamp > polls[pollId].end, "Voting is still active");
        _;
    }

    function createPoll(
        string calldata _name,
        string[] calldata _options,
        uint _durationInMinutes,
        bool _whitelistEnabled,
        address[] calldata _whitelist
    ) external {
        require(_options.length > 0, "At least one option required");
        require(_durationInMinutes > 0, "Duration must be positive");
        pollCount++;
        uint pollId = pollCount;
        Poll storage p = polls[pollId];
        p.id = pollId;
        p.name = _name;
        p.creator = msg.sender;
        p.start = block.timestamp;
        p.end = block.timestamp + (_durationInMinutes * 1 minutes);
        p.whitelistEnabled = _whitelistEnabled;
        p.exists = true;
        for (uint i = 0; i < _options.length; i++) {
            p.optionNames.push(_options[i]);
            p.votes[_options[i]] = 0;
        }
        if (_whitelistEnabled) {
            for (uint i = 0; i < _whitelist.length; i++) {
                p.whitelisted[_whitelist[i]] = true;
            }
        }
        pollIds.push(pollId);
        emit PollCreated(pollId, _name, msg.sender, p.start, p.end, _whitelistEnabled);
    }

    function vote(uint pollId, string calldata _optionName) external pollExists(pollId) onlyDuringVoting(pollId) {
        Poll storage p = polls[pollId];
        require(!p.hasVoted[msg.sender], "You have already voted");
        if (p.whitelistEnabled) {
            require(p.whitelisted[msg.sender], "Not whitelisted to vote");
        }
        bool validOption = false;
        for (uint i = 0; i < p.optionNames.length; i++) {
            if (keccak256(bytes(p.optionNames[i])) == keccak256(bytes(_optionName))) {
                validOption = true;
                break;
            }
        }
        require(validOption, "Option does not exist");
        p.votes[_optionName] += 1;
        p.hasVoted[msg.sender] = true;
        p.voters.push(msg.sender);
        emit Voted(pollId, msg.sender, _optionName);
    }

    function getPollSummary(uint pollId) external view pollExists(pollId) returns (
        uint id,
        string memory name,
        address creator,
        uint start,
        uint end,
        bool whitelistEnabled,
        uint optionCount,
        uint voterCount
    ) {
        Poll storage p = polls[pollId];
        return (
            p.id,
            p.name,
            p.creator,
            p.start,
            p.end,
            p.whitelistEnabled,
            p.optionNames.length,
            p.voters.length
        );
    }

    function getPollOptions(uint pollId) external view pollExists(pollId) returns (string[] memory) {
        return polls[pollId].optionNames;
    }

    function getPollVotes(uint pollId) external view pollExists(pollId) returns (uint[] memory) {
        Poll storage p = polls[pollId];
        uint[] memory votesArr = new uint[](p.optionNames.length);
        for (uint i = 0; i < p.optionNames.length; i++) {
            votesArr[i] = p.votes[p.optionNames[i]];
        }
        return votesArr;
    }

    function getPollVoters(uint pollId) external view pollExists(pollId) returns (address[] memory) {
        return polls[pollId].voters;
    }

    function hasVoted(uint pollId, address voter) external view pollExists(pollId) returns (bool) {
        return polls[pollId].hasVoted[voter];
    }

    function isWhitelisted(uint pollId, address voter) external view pollExists(pollId) returns (bool) {
        return polls[pollId].whitelisted[voter];
    }

    function getAllPollIds() external view returns (uint[] memory) {
        return pollIds;
    }

    function getWinner(uint pollId) external view pollExists(pollId) onlyAfterVoting(pollId) returns (string memory winner, uint maxVotes) {
        Poll storage p = polls[pollId];
        maxVotes = 0;
        winner = "";
        for (uint i = 0; i < p.optionNames.length; i++) {
            string memory name = p.optionNames[i];
            if (p.votes[name] > maxVotes) {
                maxVotes = p.votes[name];
                winner = name;
            }
        }
    }
}
