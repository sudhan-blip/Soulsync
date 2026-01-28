import express from "express";
import authMiddleware from "../utils/authMiddleware.js";
import Chat from "../models/Chat.js";

const router = express.Router();

router.post("/save-image", authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    const chat = await Chat.create({
      userId: req.userId,
      from: "user",
      image
    });

    res.json({ msg: "Image saved", chat });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

export default router;
