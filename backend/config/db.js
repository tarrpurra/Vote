import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

export const connectDB =async () =>{ 
    try{
        const con =await mongoose.connect(process.env.MONGO_URI);
        console.log(`MONGODB connected: ${con.connection.host}`);
    }
    catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1);

    }
}