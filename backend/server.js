import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// IMPORTANT: Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/analyze", analyzeRoute);
app.get("/test", (req, res) => {
  res.send("Analyze route is ready");
});