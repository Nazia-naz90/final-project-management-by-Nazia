// src\app.js
import express from "express";
import cors from "cors";
import healthCheckRoutes from "./routes/healthCheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

const app = express();
// ----------- COOKIE PARSER -----------
app.use(cookieParser());

// ----------- MIDDLEWARES -----------
app.use(express.json({ limit: "16kb" })); // To make readable json data from request body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // This will encode your url for safety reasons
app.use(express.static("public")); // This tells express about never changing files OR data

// ------------------ CORS ------------------
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization","X-Requested-With","Accept"],

}))

// ----------- BASIC API -----------
app.get("/", (req, res) => {
  res.end(" ✅ Welcome to Project Management API ");
});

// ----------------- API ROUTES ----------------
app.use("/api/v1/health-check", healthCheckRoutes)

app.use("/api/v1/auth", authRouter)

export default app;
