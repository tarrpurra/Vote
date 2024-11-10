import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

import { connectDB } from "./config/db.js";
import Voter from "./models/VoterInfo.model.js";

const PORT = process.env.PORT||5000;
const app = express();
app.use(cors());
app.use(express.json());

//for deployment
// const __dirname=path.resolve();


// if(process.env.NODE_ENV==="production"){
//     app.use(express.static(path.join(__dirname,"/frontend/dist")));
//     app.get("*",(req,res)=>{
//         res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
//     });
// }

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Login route with a sign-in check
app.post("/api/login", upload.single("ID_Photo"), async (req, res) => {
  const { Votername, ID_type, ID_Number } = req.body;

  // Check if all required fields are provided
  if (!Votername || !ID_type || !ID_Number || !req.file) {
    return res.status(400).json("Please fill in all fields and provide an ID photo.");
  }

  try {
    // Check if the user has already signed in
    const existingVoter = await Voter.findOne({ ID_Number });
    if (existingVoter) {
      return res.status(400).json({ success: false, message: "User has already Voted." });
    }

    // If not signed in, create a new record
    const newVoter = new Voter({
      Votername,
      ID_type,
      ID_Number,
      ID_Photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      loginTime: new Date() // Automatically captures login time
    });

    await newVoter.save();
    res.status(201).json({ success: true, data: newVoter });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Listening on PORT ${PORT}`);
});
