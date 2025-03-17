
import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please provide your name"] },
    email: { type: String, required: [true, "Please provide your email"], unique: true, trim: true, match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Please provide a valid email"] },
    password: { type: String, required: [true, "Please provide your password"], },
    photo: { type: String, default: "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-1170x780.jpg" },
    bio: { type: String, default: "I am a new user" },
    role: {
        type: String,
        enum: ["user", "admin", "creator"],
        default: "user"
    },
    isVerified: { type: Boolean, default: false },
    // token: { type: String },
}, { timestamps: true, minimize: true });

// hash the password before saving
userSchema.pre("save", async function (next) {
    // check if the password is not modified
    if (!this.isModified("password")) {
        return next();
    }

    // save the hashed password
    const salt = await bcrypt.genSalt(10);
    // hash the password with the salt
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // set the pasword to the hashed password
    this.password = hashedPassword;

    next();
});

const User = mongoose.model("User", userSchema);

export default User;
