import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useInfo} from "../info/information";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    identity: "Aadhar",
    idNum: "",
    file: null,
  });
  const [errors, setErrors] = useState({});
  const { createVoteInfo } = useInfo();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
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

    // Prepare data to submit to createVoteInfo
    const voterData = new FormData();
    voterData.append("Votername", formData.name);
    voterData.append("ID_type", formData.identity);
    voterData.append("ID_Number", formData.idNum);
    voterData.append("ID_Photo", formData.file);

    // Call createVoteInfo and handle the response
    const result = await createVoteInfo({
      Votername: formData.name,
      ID_type: formData.identity,
      ID_Number: formData.idNum,
      ID_Photo: formData.file,
    });

    if (result.success) {
      navigate("/Voting", { replace: true });
    } else {
      alert(result.message || "Submission failed.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <div className="hidden md:block w-1/2 h-full bg-portal-back bg-center bg-cover bg-no-repeat bg-black box-border border-r-4 border-gray-900"></div>

      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-4">
        <form onSubmit={next} className="flex flex-col border-4 p-6 bg-white rounded-lg shadow-lg w-full max-w-sm">
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
          {errors.name && <span className="text-red-500 mb-2">{errors.name}</span>}

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
            <option value="Aadhar">Aadhar</option>
            <option value="Pan">Pan Card</option>
            <option value="Voting Id">Voting Id</option>
            <option value="Ration-other">
              Ration Card or any other government ID with recent photo
            </option>
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
          {errors.idNum && <span className="text-red-500 mb-2">{errors.idNum}</span>}

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
          {errors.file && <span className="text-red-500 mb-2">{errors.file}</span>}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
