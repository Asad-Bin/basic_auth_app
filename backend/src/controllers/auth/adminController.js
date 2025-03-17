 
import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";


 export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // attempt to find and delete the user
    try{
        const user = await User.findByIdAndDelete(id);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({message: "User deleted successfully"});
    } catch (error){
        res.status(500).json({message: "Cannot delete user!"});
    }
 });

 // get all users
 export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});

    if(!users){
        res.status(404).json({ message: "No users found! "});
    }

    res.status(400).json(users);
 });