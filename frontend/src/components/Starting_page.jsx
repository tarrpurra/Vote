import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  initializeContract,
  getAllPollIds,
  getPollSummary,
  getPollOptions,
  getPollVotes,
  getWinner,
} from "./contract_connection";
import { ResponsiveBar } from "@nivo/bar";
import logo from "../assets/logo.png";

export default function Start() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [pollDetails, setPollDetails] = useState(null);
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { contract } = await initializeContract();
        const pollIds = await getAllPollIds(contract);
        const pollSummaries = await Promise.all(
          pollIds.map(async (id) => {
            const summary = await getPollSummary(contract, id);
            return { id, ...summary };
          })
        );
        setPolls(pollSummaries);
        if (pollSummaries.length > 0) {
          setSelectedPollId(pollSummaries[pollSummaries.length - 1].id); // Select latest poll by default
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
    if (!selectedPollId) return;
    (async () => {
      setLoading(true);
      try {
        const { contract } = await initializeContract();
        const summary = await getPollSummary(contract, selectedPollId);
        const options = await getPollOptions(contract, selectedPollId);
        const votes = await getPollVotes(contract, selectedPollId);
        let winner = null;
        if (
          summary.end &&
          Math.floor(Date.now() / 1000) > parseInt(summary.end)
        ) {
          try {
            const [winnerName] = await getWinner(contract, selectedPollId);
            winner = winnerName;
          } catch {
            winner = null;
          }
        }
        setPollDetails(summary);
        setOptions(options);
        setVotes(votes);
        setWinner(winner);
      } catch {
        setError("Failed to load poll details");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedPollId]);

  const reDirect = () => {
    navigate("/login");
  };

  // Prepare data for Nivo ResponsiveBar
  const nivoData = options.map((opt, idx) => ({
    name: String(opt),
    votes: Number(votes[idx] || 0),
  }));

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 rounded-full shadow bg-white object-contain"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">
              OneVote
            </h1>
            <p className="text-sm text-gray-500">
              Decentralized Polling Platform
            </p>
          </div>
        </div>
        <button
          onClick={reDirect}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition"
        >
          Go to Login / Create Poll
        </button>
      </header>
      {/* Avalanche Testnet Warning Banner */}
      {showWarning && (
        <div className="w-full flex items-center justify-between bg-yellow-100 border-b-2 border-yellow-400 text-yellow-900 px-6 py-3 text-sm font-semibold z-50">
          <div>
            ⚠️ This system is running on the{" "}
            <span className="font-bold">Avalanche Fuji Testnet</span>.{" "}
            <br className="sm:hidden" />
            Please visit
            <a
              href="https://forum.avax.network/t/faucet-coupon-code/1628"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 mx-1"
            >
              this forum
            </a>
            for a faucet coupon code and
            <a
              href="https://core.app/en/tools/testnet-faucet/?subnet=c&token=c"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 mx-1"
            >
              the official testnet faucet
            </a>
            to get test AVAX.
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="ml-4 text-xl leading-none hover:text-yellow-700"
          >
            &times;
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Poll List Sidebar */}
        <aside className="w-80 min-w-[220px] max-w-xs bg-white border-r border-gray-200 flex flex-col py-6 px-4 overflow-y-auto shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            All Polls
          </h2>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {polls.length === 0 && (
              <div className="text-gray-400 text-center py-8">
                No polls yet.
              </div>
            )}
            {polls.map((poll) => (
              <button
                key={poll.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 font-semibold shadow transition-all duration-200 text-left ${
                  selectedPollId === poll.id
                    ? "bg-blue-100 border-blue-500 text-blue-900"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-400"
                }`}
                onClick={() => setSelectedPollId(poll.id)}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-700 font-bold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span className="truncate">{poll.name}</span>
              </button>
            ))}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-8 overflow-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
            {loading ? (
              <p className="text-gray-700">Loading poll details...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : selectedPollId && pollDetails ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-7 h-7 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {pollDetails.name}
                  </h2>
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Creator:</span>{" "}
                  <span className="font-mono text-blue-600">
                    {pollDetails.creator}
                  </span>
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Status:</span>{" "}
                  {pollDetails.end &&
                  Math.floor(Date.now() / 1000) > parseInt(pollDetails.end) ? (
                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded">
                      Closed
                    </span>
                  ) : (
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded">
                      Open
                    </span>
                  )}
                </div>
                {winner && (
                  <div className="mt-2 text-blue-700 font-semibold">
                    Winner: {winner}
                  </div>
                )}
                <div className="mt-8 mb-2 text-lg font-semibold text-gray-700 text-center">
                  Poll Results
                </div>
                <div className="w-full h-72">
                  {options.length > 0 ? (
                    <ResponsiveBar
                      data={nivoData}
                      keys={["votes"]}
                      indexBy="name"
                      margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
                      padding={0.3}
                      colors={({ data }) => {
                        // Assign a unique color per bar
                        const colorMap = {
                          Cow: "#6366f1",
                          Cat: "#f59e42",
                          Dog: "#10b981",
                          // Add more as needed
                        };
                        return colorMap[data.name] || "#8884d8";
                      }}
                      borderRadius={6}
                      enableLabel={true}
                      labelSkipWidth={16}
                      labelSkipHeight={12}
                      labelTextColor="#fff"
                      axisBottom={{
                        legend: "Option",
                        legendPosition: "middle",
                        legendOffset: 32,
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legendTextColor: "#374151",
                      }}
                      axisLeft={{
                        legend: "Votes",
                        legendPosition: "middle",
                        legendOffset: -40,
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legendTextColor: "#374151",
                      }}
                      tooltip={({ value, indexValue }) => (
                        <div
                          style={{
                            padding: 12,
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            color: "#111",
                            fontWeight: "bold",
                          }}
                        >
                          {indexValue}: {value} votes
                        </div>
                      )}
                      animate={true}
                      motionStiffness={90}
                      motionDamping={15}
                    />
                  ) : (
                    <p className="text-gray-700 text-lg text-center">
                      No poll data available.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-700 text-lg text-center">
                No poll selected.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
