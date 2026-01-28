import express from "express";
import Chat from "../models/Chat.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

// save a chat message (protected)
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { from, message } = req.body;
    if (!message) return res.status(400).json({ msg: "Message required" });

    const chat = await Chat.create({
      userId: req.userId,
      from,
      message
    });

    res.json({ msg: "Saved", chat });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// get chat history for user (protected)
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({ createdAt: 1 }).limit(1000);
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

export default router;
