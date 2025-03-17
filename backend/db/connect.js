
import mongoose from "mongoose";

const connectDB = async () => {
    try{
        console.log("attempting to connect to MongoDB....");
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("connected to MongoDB....");
    } catch (error) {
        console.log("Failed to connect to MongoDB.... ", error.message);
        process.exit(1);
    } 
};

export default connectDB;