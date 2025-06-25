import mongoose from 'mongoose';

const VoterInfoSchema = new mongoose.Schema({
    Votername: {
        type: String,
        required: true
    },
    ID_type: {
        type: String,
        required: true
    },
    ID_Number: {
        type: String,  // Changed to String for alphanumeric ID support
        required: true,
    },
    ID_Photo: {
        data: Buffer,        // Binary data for image storage
        contentType: String  // MIME type of the image (e.g., 'image/jpeg')
    },
    loginTime: {
        type: Date,
        default: Date.now    // Sets login time to current date and time automatically
    }
});

const Voter = mongoose.model("VoterInfo", VoterInfoSchema); // Model name should match context
export default Voter;
