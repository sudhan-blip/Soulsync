import express from "express";
import Diary from "../models/Diary.js";
import authMiddleware from "../utils/authMiddleware.js";
import Groq from "groq-sdk";
import dayjs from "dayjs";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate AI summary for a day
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { date } = req.body;

    const diary = await Diary.findOne({ userId: req.userId, date });
    if (!diary) return res.status(400).json({ msg: "No diary found" });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
Write a short emotional summary of the user's day.
Use 2–3 sentences maximum.
Be warm, caring, human-like, supportive.
Use sweet emojis like 🤍✨☺️
`
        },
        { role: "user", content: diary.rawLogs }
      ],
      max_tokens: 80,
      temperature: 0.7
    });

    const summary = response.choices[0].message.content.trim();

    // Save summary
    diary.summary = summary;
    await diary.save();

    res.json({ summary });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Get diary by date
router.get("/:date", authMiddleware, async (req, res) => {
  const diary = await Diary.findOne({
    userId: req.userId,
    date: req.params.date
  });

  res.json({ diary });
});

export default router;
