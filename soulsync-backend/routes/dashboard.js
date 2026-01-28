import express from "express";
import authMiddleware from "../utils/authMiddleware.js";

import Diary from "../models/Diary.js";
import MoodEntry from "../models/MoodEntry.js";
import Streak from "../models/Streak.js";
import Chat from "../models/Chat.js";

const router = express.Router();

router.get("/data", authMiddleware, async (req, res) => {
  try {
    const diary = await Diary.find({ userId: req.userId }).sort({ date: -1 });

    const memories = await Chat.find({ userId: req.userId, from: "soul" })
      .sort({ createdAt: -1 })
      .limit(10);

    const moods = await MoodEntry.find({ userId: req.userId });
    const streak = await Streak.findOne({ userId: req.userId });

    res.json({
      diary,
      memories,
      moods,
      streak
    });
  } catch (err) {
    res.status(500).json({ msg: "Dashboard error", error: err });
  }
});

export default router;
