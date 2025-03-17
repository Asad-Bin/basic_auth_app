

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connect.js";
import cookieParser from "cookie-parser";

import fs from "node:fs";
import errorHandler from "./src/helpers/errorHandler.js";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

// middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// error handler middleware
app.use(errorHandler);

// routes
const routeFiles = fs.readdirSync("./src/routes");

// console.log(routeFiles);

routeFiles.forEach((file) => {
    // use dynamic import
    import(`./src/routes/${file}`).then((route) => {
        app.use("/api/v1", route.default); // what does this do?????
    }).catch((error) => {
        console.log("Failed to import route: ", error);
    });
});

const server = async () => {
    try{
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log("Failed to strant server.... ", error.message);
        process.exit(1);
    }
};

server();