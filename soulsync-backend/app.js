import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: "*", // allow all origins for deployment
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "5mb" }));

// ROUTES
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("SoulSync Backend Running 🚀");
});

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));
