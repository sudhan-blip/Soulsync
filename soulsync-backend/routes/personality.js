import express from "express";
import authMiddleware from "../utils/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Change personality mode
router.post("/set", authMiddleware, async (req, res) => {
  try {
    const { mode } = req.body;

    const allowed = ["caring", "playful", "romantic", "deep"];

    if (!allowed.includes(mode)) {
      return res.status(400).json({ msg: "Invalid personality mode" });
    }

    await User.findByIdAndUpdate(req.userId, { personality: mode });

    res.json({ msg: "Personality updated", mode });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Change relationship mode
router.post("/relationship", authMiddleware, async (req, res) => {
  try {
    const { mode } = req.body;

    const allowed = ["friend", "girlfriend", "boyfriend"];

    if (!allowed.includes(mode)) {
      return res.status(400).json({ msg: "Invalid relationship mode" });
    }

    await User.findByIdAndUpdate(req.userId, { relationshipMode: mode });

    res.json({ msg: "Relationship mode updated", mode });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

export default router;
