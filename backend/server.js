import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";
dotenv.config();

const app = express();  // ✅ MUST come BEFORE app.use

// ✅ Middleware AFTER app is created
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// routes
import analyzeRoute from "./routes/analyze.js";
app.use("/analyze", analyzeRoute);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});