import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["fact", "preference", "event", "emotion", "conversation"],
      default: "fact"
    },
    title: String,
    content: String,
    context: String, // Additional context about this memory
    importance: {
      type: Number,
      default: 5, // 1-10 scale
      min: 1,
      max: 10
    },
    tags: [String], // Tags for easy retrieval (e.g., "work", "family", "hobby")
    firstMentioned: Date, // When this memory was first mentioned
    lastMentioned: Date, // Last time AI referenced this
    frequency: {
      type: Number,
      default: 1 // How often user mentions this
    },
    related: [String] // Related memory IDs
  },
  { timestamps: true }
);

export default mongoose.model("Memory", MemorySchema);
