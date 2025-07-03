import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useInfo } from "../info/information";
import { initializeContract, createPoll } from "./contract_connection";
import PropTypes from "prop-types";
import VotingImg from "../assets/Voting.png";
import createpoll from "../assets/creation.png";

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

export default function Login() {
  const navigate = useNavigate();
  const [showVote, setShowVote] = useState(false);
  const [showPoll, setShowPoll] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    identity: "Aadhar",
    idNum: "",
    file: null,
  });

  // useEffect(() => {
  //   const initialize = async () => {
  //     try {
  //       await initializeContract();
  //     } catch (error) {
  //       console.error("Error initializing contract:", error);
  //     }
  //   };
  //   initialize();

  // },[])
  const [errors, setErrors] = useState({});
  const { createVoteInfo } = useInfo();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const [voteData, setVoteData] = useState({
    title: "",
    options: [""],
    whitelistEnabled: false,
    whitelist: [""],
    duration: 10, // default to 10 minutes
  });

  const handleVoteChange = (e) => {
    const { name, value } = e.target;
    setVoteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...voteData.options];
    newOptions[index] = value;
    setVoteData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setVoteData((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const deleteOption = () => {
    setVoteData((prev) => {
      if (prev.options.length <= 1) return prev;
      return {
        ...prev,
        options: prev.options.slice(0, -1),
      };
    });
  };

  const handleWhitelistChange = (index, value) => {
    const newWhitelist = [...voteData.whitelist];
    newWhitelist[index] = value;
    setVoteData((prev) => ({ ...prev, whitelist: newWhitelist }));
  };

  const addWhitelistAddress = () => {
    setVoteData((prev) => ({ ...prev, whitelist: [...prev.whitelist, ""] }));
  };

  const RemoveWhitelistAddress = () => {
    setVoteData((prev) => ({
      ...prev,
      whitelist: prev.whitelist.slice(0, -1),
    }));
  };

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });
  const notificationTimeout = useRef(null);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!voteData.title || voteData.options.some((opt) => opt.trim() === "")) {
      setNotification({
        message: "Please enter a title and valid options.",
        type: "error",
      });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
      return;
    }
    if (!voteData.duration || voteData.duration < 1) {
      setNotification({
        message: "Please enter a valid duration (at least 1 minute).",
        type: "error",
      });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
      return;
    }

    try {
      // 1. Initialize contract and get account
      const { contract, account } = await initializeContract();

      // 2. Create poll (duration set by user)
      const addresses = voteData.whitelistEnabled
        ? voteData.whitelist.filter((addr) => addr.trim() !== "")
        : [];
      await createPoll(
        contract,
        account,
        voteData.title,
        voteData.options,
        voteData.duration,
        voteData.whitelistEnabled,
        addresses
      );

      setNotification({
        message: "Poll Created Successfully!",
        type: "success",
      });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
      // Optionally, redirect or reset form
      setVoteData({
        title: "",
        options: [""],
        whitelistEnabled: false,
        whitelist: [""],
        duration: 10,
      });
      setShowVote(false);
      setShowPoll(true);
    } catch (err) {
      console.error(err);
      setNotification({ message: "Poll creation failed.", type: "error" });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.idNum) newErrors.idNum = "Identification Number is required.";
    if (!formData.file) newErrors.file = "Please upload a file.";
    return newErrors;
  };

  const next = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const voterData = new FormData();
    voterData.append("Votername", formData.name);
    voterData.append("ID_type", formData.identity);
    voterData.append("ID_Number", formData.idNum);
    voterData.append("ID_Photo", formData.file);

    const result = await createVoteInfo({
      Votername: formData.name,
      ID_type: formData.identity,
      ID_Number: formData.idNum,
      ID_Photo: formData.file,
    });

    if (result.success) {
      navigate("/Voting", { replace: true });
    } else {
      setNotification({
        message: result.message || "Submission failed.",
        type: "error",
      });
      clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(
        () => setNotification({ message: "", type: "success" }),
        3500
      );
    }
  };

  // Animation handlers
  const switchToCreatePoll = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setShowPoll(false);
      setShowVote(true);
      setIsTransitioning(false);
    }, 250);
  };

  const switchToVoteOption = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setShowVote(false);
      setShowPoll(true);
      setIsTransitioning(false);
    }, 250);
  };

  return (
    <div className="flex h-screen bg-slate-100 relative overflow-hidden">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
      {/* Create Poll View - Image on left, Form on right */}
      <div
        className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${
          showVote ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Image Section - Left Side */}
        <div className="w-1/2 h-full  bg-center bg-cover bg-no-repeat bg-black border-r-4 border-gray-900">
          <img src={VotingImg} alt="Voting" />
        </div>

        {/* Form Section - Right Side */}
        <div className="w-1/2 h-full flex items-center justify-center p-4">
          <form
            onSubmit={handleVoteSubmit}
            className="flex flex-col border-4 p-6 bg-white rounded-lg shadow-lg w-full max-w-sm max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Create a Poll
            </h2>

            <label htmlFor="heading" className="mb-2">
              Heading for Voting:
            </label>
            <input
              type="text"
              id="heading"
              name="title"
              value={voteData.title}
              onChange={handleVoteChange}
              placeholder="Enter poll title"
              className="border border-gray-300 p-2 mb-4 rounded"
            />

            <label className="mb-2">Options:</label>
            {voteData.options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="border border-gray-300 p-2 mb-2 rounded"
                placeholder={`Option ${idx + 1}`}
              />
            ))}

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={addOption}
                className="flex-1 text-blue-500 border border-blue-500 p-2 rounded hover:bg-blue-50"
              >
                + Add Option
              </button>
              <button
                type="button"
                onClick={deleteOption}
                className="flex-1 text-red-500 border border-red-500 p-2 rounded hover:bg-red-50"
              >
                - Remove Option
              </button>
            </div>

            <label className="mb-2 flex items-center">
              <input
                type="checkbox"
                checked={voteData.whitelistEnabled}
                onChange={(e) =>
                  setVoteData({
                    ...voteData,
                    whitelistEnabled: e.target.checked,
                  })
                }
                className="mr-2"
              />
              Enable Whitelist
            </label>

            {voteData.whitelistEnabled && (
              <>
                <label className="mb-2">Whitelist Addresses:</label>
                {voteData.whitelist.map((addr, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={addr}
                    onChange={(e) => handleWhitelistChange(idx, e.target.value)}
                    className="border border-gray-300 p-2 mb-2 rounded"
                    placeholder={`0x...`}
                  />
                ))}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={addWhitelistAddress}
                    className="flex-1 text-blue-500 border border-blue-500 p-2 rounded hover:bg-blue-50"
                  >
                    + Add Address
                  </button>
                  <button
                    type="button"
                    onClick={RemoveWhitelistAddress}
                    className="flex-1 text-red-500 border border-red-500 p-2 rounded hover:bg-red-50"
                  >
                    - Remove Address
                  </button>
                </div>
              </>
            )}

            <label htmlFor="duration" className="mb-2">
              Voting Duration (minutes):
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              min="1"
              value={voteData.duration}
              onChange={(e) =>
                setVoteData({ ...voteData, duration: parseInt(e.target.value) })
              }
              className="border border-gray-300 p-2 mb-4 rounded"
              placeholder="Enter duration in minutes"
            />

            <button
              type="submit"
              className="bg-green-600 text-white p-3 rounded hover:bg-green-700 transition mb-4"
            >
              Create Poll
            </button>

            <button
              type="button"
              className="bg-yellow-500 text-center p-3 rounded cursor-pointer hover:bg-yellow-600 transition"
              onClick={switchToVoteOption}
              disabled={isTransitioning}
            >
              Switch to Vote for an Option
            </button>
          </form>
        </div>
      </div>

      {/* Vote/Login View - Form on left, Image on right */}
      <div
        className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${
          showPoll ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Form Section - Left Side */}
        <div className="w-1/2 h-full flex items-center justify-center p-4">
          <form
            onSubmit={next}
            className="flex flex-col border-4 p-6 bg-white rounded-lg shadow-lg w-full max-w-sm"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Voter Registration
            </h2>

            <label htmlFor="name" className="mb-2">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name Please"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 p-2 mb-4 rounded"
            />
            {errors.name && (
              <span className="text-red-500 mb-2">{errors.name}</span>
            )}

            <label htmlFor="identity" className="mb-2">
              Choose One of the following documents:
            </label>
            <select
              name="identity"
              id="identity"
              value={formData.identity}
              onChange={handleChange}
              className="border border-gray-300 p-2 mb-4 rounded"
            >
              <option value="Aadhar">Passport</option>
              <option value="Pan">Any other id with Photo</option>
              <option value="Voting Id">Voting Id</option>
              <option value="Ration-other">Goverment recognized card</option>
            </select>

            <label htmlFor="idNum" className="mb-2">
              Identification Number:
            </label>
            <input
              type="text"
              id="idNum"
              name="idNum"
              placeholder="Enter The Number"
              value={formData.idNum}
              onChange={handleChange}
              className="border border-gray-300 p-2 mb-4 rounded"
            />
            {errors.idNum && (
              <span className="text-red-500 mb-2">{errors.idNum}</span>
            )}

            <label htmlFor="file" className="mb-2">
              Please Submit The File Here:
            </label>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,pdf"
              onChange={handleChange}
              className="border border-gray-300 p-2 mb-4 rounded"
            />
            {errors.file && (
              <span className="text-red-500 mb-2">{errors.file}</span>
            )}

            <button
              type="submit"
              className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition mb-4"
            >
              Submit Registration
            </button>

            <button
              type="button"
              className="bg-yellow-500 text-center p-3 rounded cursor-pointer hover:bg-yellow-600 transition"
              onClick={switchToCreatePoll}
              disabled={isTransitioning}
            >
              Switch to Create A Poll
            </button>
          </form>
        </div>

        {/* Image Section - Right Side */}
        <div className="w-1/2 h-full  bg-center bg-cover bg-no-repeat bg-black border-l-4 border-gray-900">
          <img src={createpoll} alt="createpoll" />
        </div>
      </div>
    </div>
  );
}
