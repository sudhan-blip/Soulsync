import express from "express";
import Memory from "../models/Memory.js";
import Diary from "../models/Diary.js";
import Chat from "../models/Chat.js";
import authMiddleware from "../utils/authMiddleware.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Save a memory
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { title, content, type = "fact", tags = [], importance = 5 } = req.body;
    
    if (!content) return res.status(400).json({ msg: "Content required" });

    const mem = await Memory.create({
      userId: req.userId,
      title: title || content.substring(0, 50),
      content,
      type,
      tags,
      importance,
      firstMentioned: new Date(),
      lastMentioned: new Date()
    });

    res.json({ msg: "Memory saved", mem });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Get all memories
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const mems = await Memory.find({ userId: req.userId })
      .sort({ importance: -1, lastMentioned: -1 })
      .limit(200);
    res.json({ mems });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Get important memories
router.get("/important", authMiddleware, async (req, res) => {
  try {
    const memories = await Memory.find({
      userId: req.userId,
      importance: { $gte: 7 }
    }).sort({ lastMentioned: -1, importance: -1 }).limit(20);

    res.json({ memories });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Get memories by tag
router.get("/tag/:tag", authMiddleware, async (req, res) => {
  try {
    const { tag } = req.params;
    const memories = await Memory.find({
      userId: req.userId,
      tags: tag
    }).sort({ lastMentioned: -1 });

    res.json({ memories });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Search memories
router.get("/search/:query", authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;

    const memories = await Memory.find({
      userId: req.userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [query] } }
      ]
    }).sort({ importance: -1, lastMentioned: -1 });

    res.json({ memories });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Get daily summary
router.get("/daily/:date", authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;

    const diary = await Diary.findOne({
      userId: req.userId,
      date: date,
      type: "daily"
    });

    res.json(diary || { msg: "No summary for this date" });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Get memories by date range
router.get("/range/:startDate/:endDate", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diaries = await Diary.find({
      userId: req.userId,
      createdAt: {
        $gte: start,
        $lte: end
      }
    }).sort({ createdAt: -1 });

    res.json({ diaries });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Generate daily summary
router.post("/generate-daily", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    const existing = await Diary.findOne({
      userId: req.userId,
      date: dateStr,
      type: "daily"
    });

    if (existing) {
      return res.json(existing);
    }

    const chats = await Chat.find({
      userId: req.userId,
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (chats.length === 0) {
      return res.json({ msg: "No conversations today" });
    }

    const conversationText = chats
      .map(c => `${c.from === "user" ? "You" : "Bot"}: ${c.message}`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a memory expert. Summarize this conversation. Return JSON with: summary (1-2 sentences), keyPoints (array of 3-5 items), emotions (array), memories (array of important things to remember)`
        },
        {
          role: "user",
          content: conversationText
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    let summary = {};
    try {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      summary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, keyPoints: [], emotions: [], memories: [] };
    } catch (e) {
      summary = {
        summary: response.choices[0].message.content,
        keyPoints: [],
        emotions: [],
        memories: []
      };
    }

    const diary = await Diary.create({
      userId: req.userId,
      date: dateStr,
      type: "daily",
      summary: summary.summary || "Had a conversation",
      keyPoints: summary.keyPoints || [],
      emotions: summary.emotions || [],
      memories: summary.memories || [],
      conversationCount: chats.length
    });

    res.json(diary);
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Delete memory
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const mem = await Memory.findOneAndDelete({ _id: id, userId: req.userId });
    if (!mem) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Deleted", mem });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

export default router;
