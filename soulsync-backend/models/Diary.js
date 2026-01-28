import mongoose from "mongoose";

const diarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  type: {
    type: String,
    enum: ["daily", "weekly", "monthly", "memory"],
    default: "daily"
  },
  summary: {
    type: String,
    required: true
  },
  keyPoints: [String], // Important topics discussed
  emotions: [String], // Emotional states (happy, sad, excited, etc.)
  memories: [String], // Important things to remember
  weekNumber: Number, // For weekly summaries
  monthNumber: Number, // For monthly summaries
  conversationCount: Number, // Number of messages in this period
  lastUpdated: Date
}, { timestamps: true });

export default mongoose.model("Diary", diarySchema);
