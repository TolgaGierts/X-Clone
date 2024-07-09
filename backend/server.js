import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectDb.js";
dotenv.config()
const app = express();
const PORT = process.env.PORT || 8000


app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectMongoDb()
});