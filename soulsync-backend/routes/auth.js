import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, botName, botAge, botGender, relationshipMode } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      botName: botName || "Soul",
      botAge: botAge || 25,
      botGender: botGender || "female",
      relationshipMode: relationshipMode || "friend",
      personality: "caring"
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ 
      msg: "Signup successful", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        botName: user.botName,
        botAge: user.botAge,
        botGender: user.botGender,
        relationshipMode: user.relationshipMode,
        personality: user.personality
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        language: user.language,
        botName: user.botName,
        botAge: user.botAge,
        botGender: user.botGender,
        relationshipMode: user.relationshipMode,
        personality: user.personality
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Update profile route
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, age, language, botName, botAge, botGender } = req.body;
    
    const userId = req.user.id;
    
    // Check if email is being changed and if it's already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ msg: "Email already in use by another account" });
      }
    }
    
    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (age !== undefined) updateFields.age = age;
    if (language !== undefined) updateFields.language = language;
    if (botName !== undefined) updateFields.botName = botName;
    if (botAge !== undefined) updateFields.botAge = botAge;
    if (botGender !== undefined) updateFields.botGender = botGender;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({
      msg: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        language: updatedUser.language,
        botName: updatedUser.botName,
        botAge: updatedUser.botAge,
        botGender: updatedUser.botGender,
        relationshipMode: updatedUser.relationshipMode,
        personality: updatedUser.personality
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error updating profile", error: err.message });
  }
});

export default router;
