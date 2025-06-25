import { useState, useEffect, useRef } from "react";
import {
  initializeContract,
  getAllPollIds,
  getPollSummary,
  getPollOptions,
  getPollVotes,
  getPollVoters,
  vote as voteOnContract,
  hasVoted as hasVotedOnContract,
  getWinner as getWinnerOnContract,
} from "./contract_connection";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function Notification({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded shadow-lg text-white font-semibold transition-all duration-300 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
      role="alert"
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-xl leading-none">
          &times;
        </button>
      </div>
    </div>
  );
}

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string,
  onClose: PropTypes.func,
};

export default function Voting() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [pollDetails, setPollDetails] = useState(null);
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [voters, setVoters] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });
  const notificationTimeout = useRef(null);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { contract, account } = await initializeContract();
        setContract(contract);
        setAccount(account);
        // Fetch all poll IDs
        const pollIds = await getAllPollIds(contract);
        // Fetch summaries for all polls
        const pollSummaries = await Promise.all(
          pollIds.map(async (id) => {
            const summary = await getPollSummary(contract, id);
            return { id, ...summary };
          })
        );
        // Filter for open polls only
        const now = Math.floor(Date.now() / 1000);
        const openPolls = pollSummaries.filter(
          (poll) => poll.end && now <= parseInt(poll.end)
        );
        setPolls(openPolls);
        // Select the latest open poll by default
        if (openPolls.length > 0) {
          setSelectedPollId(openPolls[openPolls.length - 1].id);
        } else {
          setSelectedPollId(null);
        }
      } catch {
        setError("Failed to load polls");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch poll details when a poll is selected
  useEffect(() => {
    if (!selectedPollId || !contract) return;
    (async () => {
      setLoading(true);
      try {
        const summary = await getPollSummary(contract, selectedPollId);
        const options = await getPollOptions(contract, selectedPollId);
        const votes = await getPollVotes(contract, selectedPollId);
        const voters = await getPollVoters(contract, selectedPollId);
        const hasVoted = await hasVotedOnContract(
          contract,
          selectedPollId,
          account
        );
        let winner = null;
        // If poll ended, get winner
        if (
          summary.end &&
          Math.floor(Date.now() / 1000) > parseInt(summary.end)
        ) {
          try {
            const [winnerName] = await getWinnerOnContract(
              contract,
              selectedPollId
            );
            winner = winnerName;
          } catch {
            winner = null;
          }
        }
        setPollDetails(summary);
        setOptions(options);
        setVotes(votes);
        setVoters(voters);
        setHasVoted(hasVoted);
        setWinner(winner);
      } catch {
        setError("Failed to load poll details");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedPollId, contract, account]);

  // Update countdown timer for selected poll
  useEffect(() => {
    if (!pollDetails || !pollDetails.end) {
      setTimeLeft("");
      return;
    }
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const end = parseInt(pollDetails.end);
      const secondsLeft = end - now;
      if (secondsLeft <= 0) {
        setTimeLeft("Voting ended");
      } else {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        setTimeLeft(`${mins}m ${secs}s left`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pollDetails]);

  const handleVote = async () => {
    if (!selectedOption || !contract || !selectedPollId) return;
    try {
      await voteOnContract(contract, selectedPollId, selectedOption, account);
      setHasVoted(true);
      // Refresh votes
      const updatedVotes = await getPollVotes(contract, selectedPollId);
      setVotes(updatedVotes);
      setNotification({ message: "Vote cast successfully!", type: "success" });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
    } catch {
      setNotification({
        message: "Voting failed. Please try again.",
        type: "error",
      });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          All Polls
        </h1>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 text-center col-span-2">
              <span>No active polls available.</span>
              <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => navigate("/")}
              >
                Go to Home / Create Poll
              </button>
            </div>
          ) : (
            polls.map((poll) => (
              <div
                key={poll.id}
                className={`cursor-pointer rounded-xl border-2 p-4 shadow transition-all duration-200 ${
                  selectedPollId === poll.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-blue-400"
                }`}
                onClick={() => setSelectedPollId(poll.id)}
              >
                <div className="font-bold text-lg mb-2">{poll.name}</div>
                <div className="text-xs text-gray-500 mb-1">
                  Creator: {poll.creator}
                </div>
                <div className="text-xs text-gray-500">Status: Open</div>
              </div>
            ))
          )}
        </div>
        {selectedPollId && pollDetails && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{pollDetails.name}</h2>
            <div className="mb-2 text-sm text-gray-600">
              Creator: {pollDetails.creator}
            </div>
            <div className="mb-2 text-sm text-gray-600">
              Status:{" "}
              {pollDetails.end &&
              Math.floor(Date.now() / 1000) > parseInt(pollDetails.end)
                ? "Closed"
                : "Open"}
            </div>
            <div className="mb-2 text-sm text-gray-600">Time: {timeLeft}</div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Options:</h3>
              <div className="grid grid-cols-1 gap-3">
                {options.map((option, idx) => (
                  <button
                    key={option}
                    className={`w-full flex items-center justify-between px-6 py-3 rounded-xl shadow transition-all duration-200 text-lg font-medium border-2 focus:outline-none
                      ${
                        selectedOption === option
                          ? "bg-blue-500 text-white border-blue-600 scale-105"
                          : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-blue-100 hover:border-blue-400"
                      }
                      ${
                        hasVoted &&
                        voters.includes(account) &&
                        selectedOption === option
                          ? "ring-2 ring-green-400"
                          : ""
                      }
                    `}
                    disabled={
                      hasVoted ||
                      (pollDetails.end &&
                        Math.floor(Date.now() / 1000) >
                          parseInt(pollDetails.end))
                    }
                    onClick={() => setSelectedOption(option)}
                  >
                    <span>{option}</span>
                    {votes[idx] !== undefined && (
                      <span className="ml-4 text-sm text-gray-500">
                        Votes: {votes[idx]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {!hasVoted &&
              (!pollDetails.end ||
                Math.floor(Date.now() / 1000) <= parseInt(pollDetails.end)) && (
                <button
                  className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-all duration-200 focus:outline-none
                  ${
                    selectedOption
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedOption}
                  onClick={handleVote}
                >
                  Vote
                </button>
              )}
            {hasVoted && (
              <div className="mt-6 flex flex-col items-center">
                <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-2">
                  <span className="font-semibold">You have voted!</span>
                </div>
                <button
                  className="mt-2 px-6 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition"
                  onClick={() => navigate("/")}
                >
                  Back to Polls
                </button>
              </div>
            )}
            {winner && (
              <div className="mt-6 flex flex-col items-center">
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-2">
                  <span className="font-bold">Winner: {winner}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
