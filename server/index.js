import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoute from "./routes/auth.js";
import postRoute from "./routes/posts.js";
import commentRoute from "./routes/comment.js";
import fileUpload from "express-fileupload";

const app = express();

//Constants
const mongoDB = process.env.MONGO;
const PORT = process.env.PORT || 3001;

//Middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.static("uploads"));

//Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

async function start() {
    try {
        await mongoose.connect(mongoDB);
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server started on port: ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

start();
