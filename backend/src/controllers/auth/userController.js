

import asyncHandler from 'express-async-handler';
import User from '../../models/auth/userModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Token from "../../models/auth/Token.js";
import crypto from "node:crypto";
import hashedToken from '../../helpers/hashToken.js';
import sendEmail from "../../helpers/sendEmail.js";


export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
        // 400 Bad Request
        res.status(400).json({ message: "All fields are required" });
    }

    // check password length
    if (password.length < 6) {
        return res 
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        // bad request
        return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    const user = await User.create({
        name,
        email,
        password,
    });

    // generate token with user id
    const token = generateToken(user._id);

    // send back the user and token in the response to the client
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "none", // cross-site access --> allow all third-party cookies
        secure: true,
    });

    if (user) {
        const { _id, name, email, role, photo, bio, isVerified } = user;

        // 201 Created
        res.status(201).json({
        _id,
        name,
        email,
        role,
        photo,
        bio,
        isVerified,
        token,
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
});

// user login
export const loginUser = asyncHandler(async (req, res) => {
// get email and password from req.body
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
        // 400 Bad Request
        return res.status(400).json({ message: "All fields are required" });
    }

    // check if user exists
    const userExists = await User.findOne({ email });

    if (!userExists) {
        return res.status(404).json({ message: "User not found, sign up!" });
    }

    // console.log(userExists);
    // console.log(password);

    // check id the password match the hashed password in the database
    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
        // 400 Bad Request
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate token with user id
    const token = generateToken(userExists._id);

    if (userExists && isMatch) {
        const { _id, name, email, role, photo, bio, isVerified } = userExists;

        // set the token in the cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: "none", // cross-site access --> allow all third-party cookies
            secure: true,
        });

        // send back the user and token in the response to the client
        res.status(200).json({
            _id,
            name,
            email,
            role,
            photo,
            bio,
            isVerified,
            token,
        });
    } else {
        res.status(400).json({ message: "Invalid email or password" });
    }
});


// logout user
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
});

// get user profile
export const getUser = asyncHandler(async (req, res) => {
    // get user details from the token -> 
    const user = await User.findById(req.user._id).select("-password");

    if(user){
        res.status(200).json(user);
    } else{
        res.status(404).json({message: "User not found"});
    }
});

// update user
export const updateUser = asyncHandler(async (req, res) => {
    // get user deatails from token --> protect middleware
    const user = await User.findById(req.user._id);

    if(user){
        // // user properties to update
        // const { name, bio, photo } = req.body;

        // update user properties
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.photo = req.body.photo || user.photo;
        user.bio = req.body.bio || user.bio;

        // save the updated user details
        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            photo: updatedUser.photo,
            bio: updatedUser.bio,
            isVerified: updatedUser.isVerified,
        });
    } else{
        res.status(404).json({message: "User not found"});
    }
});

export const userLoginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;

    if(!token){
        res.status(401).json({ message:"Not authorized, please login!" });
        return;
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded){
        res.status(200).json(true);
    } else{
        res.status(401).json(false);
    }
});

// email verification
export const verifyEmail = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);

    if(!user){
        return res.status(404).json( { message: "User not found" });
    }

    if(user.isVerified){
        return res.status(400).json({ message:"User is already verified" });
    }

    let token = await Token.findOne({ userId: user._id });

    // if token exists -> update the token
    if(token){
        await token.deleteOne();
    }

    // create a verification token using the user id --> crypto
    const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

    // hash the verification token
    const hashToken = hashedToken(verificationToken);
    
    await new Token ({
        userId: user._id,
        verificationToken: hashToken,
        createdAt: Date.now(),
        expiresAt: Date.now()+24*60*60*1000, // 24 hrs
    }).save();

    // verifiction link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    // send email to the user
    const send_from = process.env.USER_EMAIL;
    const send_to = user.email;
    const reply_to = "noreply4@gmail.com";
    const subject = "Fast Note - Email verification";
    const template = "emailVerification";
    const name  = user.name;
    const url = verificationLink;

    // console.log(user.email);
    // console.log(send_from);
    // console.log(url);

    try{
        await sendEmail(
            send_from, send_to, reply_to, subject, template, name, url
        );
        // console.log("hi");
        return res.status(200).json({ message: "Email sent" });
    } catch{
        // console.log("eroor sending email: ", error);
        return res.status(500).json({ message: "email could not be sent " });
    }
});


// verify user
export const verifyUser = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
  
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid verification token" });
    }
    // hash the verification token --> because it was hashed before saving
    const hashToken = hashedToken(verificationToken);
  
    // find user with the verification token
    const userToken = await Token.findOne({
      verificationToken: hashToken,
      // check if the token has not expired
      expiresAt: { $gt: Date.now() },
    });
  
    if (!userToken) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }
  
    //find user with the user id in the token
    const user = await User.findById(userToken.userId);
  
    if (user.isVerified) {
      // 400 Bad Request
      return res.status(400).json({ message: "User is already verified" });
    }
  
    // update user to verified
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "User verified" });
  });

// forgot password
export const forgotPassword = asyncHandler(async(req, res) => {
    const { email } = req.body;

    if(!email){
        return res.status(400).json({ message: "email is requied" });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if(!user){
        return res.status(404).json({ message:"user not found" });
    }

    // see if reset token exists
    let token = await Token.findOne({ userId: user._id });

    // if token exists --> delete the token
    if(token){
        await token.deleteOne();
    }

    // create a reset token using the user id --> expires in 1 hour
    const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

    // hash the reset token
    const hashToken = hashedToken(passwordResetToken);

    await new Token({
        userId: user._id,
        passwordResetToken: hashToken,
        createdAt: Date.now(),
        expiresAt: Date.now()+ 60*60*1000, // 1 hour
    }).save();

    // reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

    // send email to user
    const subject = "Fast Note - Password Reset";
    const send_to = user.email;
    const send_from = process.env.USER_EMAIL;
    const reply_to = "noreply@noreply.com";
    const template = "forgotPassword";
    const name = user.name;
    const url = resetLink;

    try{
        await sendEmail(send_from, send_to, reply_to, subject, template, name, url);
        res.json({ message: "Email sent" });
    }catch{
        console.log("Error sending email: ", error);
        return res.status(500).json({ message: "Email could not be sent" });
    }
});

// reset password
export const resetPassword = asyncHandler(async (req, res) => {
    const { resetPasswordToken } = req.params;
    const { password } = req.body;

    if(!password){
        return res.status(400).json({ message: "Password is required" });
    }

    // hash the reset token
    const hashToken = hashedToken(resetPasswordToken);

    // check if token exists and has not expired
    const userToken = await Token.findOne({
        passwordResetToken: hashToken,
        expiresAt: { $gt: Date.now() },
    });

    if(!userToken){
        return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // find user with the user id in the token
    const user = await User.findById(userToken.userId);

    // update password
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password update successfully" });
});

// change password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // console.log(req.user);

    if(!currentPassword || !newPassword){
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    // if current password doesn't match
    if(!isMatch){
        return res.status(400).json({ message: "Invalid Password" });
    }

    // reset password
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
});