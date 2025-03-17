
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/auth/userModel.js';

export const protect = asyncHandler(async (req, res, next) => {
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message: "Not authorized, please login!"});
        }

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // het user details fromt the token;
        const user = await User.findById(decoded.id).select("-password");

        // check if user exist
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        // set the user details in the request object
        req.user = user;

        next();
    }catch(error){
        console.error(error);
    }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
    // console.log(req.user.isAdmin);
    if((req.user && req.user.role == "admin") || (req.user && req.user.role == "creator")){
        // if user is admin, move to the next middleware
        next();
        return;
    }

    // if not admin, send 403 forbidden status
    res.status(403).json({message: "Not authorized as an admin"});
});

export const creatorMiddleware = asyncHandler(async (req, res, next) => {
    if(req.user && req.user.role == "creator") {
        next();
        return;
    }
    
    res.status(403).json({ message: "Only creators can do this! "});
});

// verified middleware
export const varifiedMiddleware = asyncHandler(async (req, res, next) => {
    // console.log(req.user.isAdmin);
    if(req.user && req.user.isVerified){
        // if user is admin, move to the next middleware
        next();
        return;
    }

    // if not admin, send 403 forbidden status
    res.status(403).json({message: "Please verify your email address! "});
});


