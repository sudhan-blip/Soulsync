import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,

    // User Profile Information
    age: {
      type: Number,
      default: null
    },
    language: {
      type: String,
      default: "English"
    },

    // AI Bot Configuration
    botName: {
      type: String,
      default: "Soul"
    },
    botAge: {
      type: Number,
      default: 25
    },
    botGender: {
      type: String,
      enum: ["male", "female", "non-binary"],
      default: "female"
    },
    relationshipMode: {
      type: String,
      enum: ["friend", "girlfriend", "boyfriend"],
      default: "friend"
    },

    // Relationship Evolution - tracks how feelings develop over time
    relationshipEvolutionStage: {
      type: Number,
      default: 0,
      // 0 = just a friend, 1 = close friend, 2 = romantic feelings emerging, 3 = in love / girlfriend/boyfriend
      min: 0,
      max: 3
    },
    
    // Track romantic indicators for evolution
    romanticIndicators: {
      type: Number,
      default: 0, // Counts romantic patterns detected
    },
    
    lastRelationshipShift: {
      type: Date,
      default: null // When relationship last changed stages
    },

    // Personality mode
    personality: {
      type: String,
      enum: ["caring", "playful", "romantic", "deep"],
      default: "caring"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
