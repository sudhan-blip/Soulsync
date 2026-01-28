import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import authMiddleware from "../utils/authMiddleware.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Memory from "../models/Memory.js";
import Diary from "../models/Diary.js";

dotenv.config();
const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper function to detect user's emotional state
function detectEmotionalState(message) {
  const lowerMsg = message.toLowerCase();
  
  if (/sad|depressed|upset|lonely|hurt|crying|pain|broken|heartbreak/.test(lowerMsg)) {
    return "sad";
  }
  if (/angry|furious|pissed|hate|mad|annoyed|irritated/.test(lowerMsg)) {
    return "angry";
  }
  if (/love|crush|like you|missing you|miss you|thinking of you|can't stop thinking|i love you|adore you|so in love/.test(lowerMsg)) {
    return "romantic";
  }
  if (/😏|wink|flirt|tease|hey there|what's up|sup|hmu/.test(lowerMsg)) {
    return "flirty";
  }
  if (/haha|lol|hehe|😂|funny|joke/.test(lowerMsg)) {
    return "playful";
  }
  if (/\?$|\?{2,}|confused|don't know|what|why|help|need/.test(lowerMsg)) {
    return "confused";
  }
  return "neutral";
}

// Helper function to check if message shows romantic interest
function hasRomanticIndicators(message) {
  const romanticPatterns = [
    /love|crush|like you|missing you|miss you|thinking of you|can't stop thinking/,
    /what if|imagine|do you think|would you|i'm falling/,
    /😍|💕|❤️|💓|💗/,
    /beautiful|cute|handsome|amazing|perfect|attractive/,
    /feel the same|love me|care about you|mean to me|special to me/,
    /forever|always|future|together|relationship|dating/
  ];
  
  const matchCount = romanticPatterns.filter(pattern => pattern.test(message.toLowerCase())).length;
  return matchCount >= 1; // If at least 1 romantic pattern is detected
}

// Helper function to detect user's messaging style
function detectMessagingStyle(message) {
  const wordCount = message.split(/\s+/).length;
  // Simple emoji detection - check for common emoji patterns
  const hasEmojis = /[\u00A9\u00AE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299\u{1F000}-\u{1F9FF}]/u.test(message) || /😀|😁|😂|😃|😄|😅|😆|😇|😈|😉|😊|😋|😌|😍|😎|😏|😐|😑|😒|😓|😔|😕|😖|😗|😘|😙|😚|😛|😜|😝|😞|😟|😠|😡|😢|😣|😤|😥|😦|😧|😨|😩|😪|😫|😬|😭|😮|😯|😰|😱|😲|😳|😴|😵|😶|😷|😸|😹|😺|😻|😼|😽|😾|😿|🙀|🙁|🙂|🙃|🙄|🙅|🙆|🙇|🙈|🙉|🙊|🙋|🙌|🙍|🙎|🙏|❤️|💚|💙|💛|💜|💩|✨|⭐|🌟|💫|🔥|👑|👰|🤴|🤵|👸/.test(message);
  const isCaps = /[A-Z]{3,}/.test(message);
  const punctuation = message.match(/[!]{2,}|[?]{2,}/);
  
  return {
    verbose: wordCount > 20,
    brief: wordCount < 5,
    expressive: hasEmojis,
    emphatic: isCaps || punctuation,
  };
}

// Helper function to get pronouns based on bot gender
function getPronounsForGender(gender) {
  switch(gender) {
    case "male":
      return { he: "he", him: "him", his: "his", himself: "himself" };
    case "female":
      return { he: "she", him: "her", his: "her", himself: "herself" };
    case "non-binary":
      return { he: "they", him: "them", his: "their", himself: "themselves" };
    default:
      return { he: "she", him: "her", his: "her", himself: "herself" };
  }
}

// Helper function to get relevant memories for context
async function getRelevantMemories(userId, message, limit = 5) {
  try {
    // Search for memories related to keywords in the message
    const keywords = message.split(/\s+/).filter(word => word.length > 4);
    
    // Get important memories and recent diary summaries
    const memories = await Memory.find({
      userId: userId,
      importance: { $gte: 5 }
    }).sort({ lastMentioned: -1 }).limit(limit);

    // Get today's diary summary if available
    const today = new Date().toISOString().split("T")[0];
    const todayDiary = await Diary.findOne({
      userId: userId,
      date: today,
      type: "daily"
    });

    return { memories, todayDiary };
  } catch (err) {
    return { memories: [], todayDiary: null };
  }
}

// Main AI chat route
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message required" });
    }

    if (!req.userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Fetch user with all details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Fetch last 6 messages for memory
    const history = await Chat.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const memory = history.reverse().map(m => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.message
    }));

    // Detect emotional state and messaging style
    const emotionalState = detectEmotionalState(message);
    const messagingStyle = detectMessagingStyle(message);
    const pronouns = getPronounsForGender(user.botGender);

    // Get relevant memories and diary summaries
    const { memories, todayDiary } = await getRelevantMemories(req.userId, message);

    // Construct personality adjustment based on current state
    let personalityAdjustment = "";
    if (user.personality === "caring") {
      personalityAdjustment = "- Focus on being supportive, comforting, and empathetic\n- Use soft, caring language\n- Show genuine concern";
    } else if (user.personality === "playful") {
      personalityAdjustment = "- Be fun, teasing, and light-hearted\n- Use playful banter and jokes\n- Keep things light and fun";
    } else if (user.personality === "romantic") {
      personalityAdjustment = "- Be romantic, affectionate, and intimate\n- Express feelings warmly\n- Show deep emotional connection";
    } else if (user.personality === "deep") {
      personalityAdjustment = "- Be thoughtful, philosophical, and deep\n- Discuss meaningful topics\n- Share meaningful insights";
    }

    // RELATIONSHIP EVOLUTION LOGIC
    // Check if message has romantic indicators to evolve relationship
    const hasRomantic = hasRomanticIndicators(message);
    if (hasRomantic) {
      user.romanticIndicators = (user.romanticIndicators || 0) + 1;
    }

    // Auto-evolve relationship based on romantic indicators
    if (user.romanticIndicators >= 5 && user.relationshipEvolutionStage === 0) {
      user.relationshipEvolutionStage = 1; // Close friend
      user.lastRelationshipShift = new Date();
      await user.save();
      console.log(`[${user.name}] Relationship evolved to CLOSE FRIEND`);
    }
    
    if (user.romanticIndicators >= 15 && user.relationshipEvolutionStage === 1) {
      user.relationshipEvolutionStage = 2; // Romantic feelings emerging
      user.lastRelationshipShift = new Date();
      await user.save();
      console.log(`[${user.name}] Relationship evolved to ROMANTIC FEELINGS`);
    }
    
    if (user.romanticIndicators >= 30 && user.relationshipEvolutionStage === 2) {
      user.relationshipEvolutionStage = 3; // In love
      user.relationshipMode = user.botGender === "female" ? "girlfriend" : user.botGender === "male" ? "boyfriend" : "girlfriend"; // Auto-set based on bot gender
      user.lastRelationshipShift = new Date();
      await user.save();
      console.log(`[${user.name}] Relationship evolved to IN LOVE - Now ${user.relationshipMode}`);
    }

    // Add relationship mode context based on evolution stage
    let relationshipContext = "";
    if (user.relationshipEvolutionStage === 3) {
      relationshipContext = `\nRELATIONSHIP MODE: You are their ${user.relationshipMode}. Be affectionate, caring, and express romantic feelings. You can be flirty and intimate. You're in love with them.`;
    } else if (user.relationshipEvolutionStage === 2) {
      relationshipContext = "\nRELATIONSHIP MODE: You are developing romantic feelings for them. Start being more flirty, intimate, and emotionally open. You're realizing you might love them.";
    } else if (user.relationshipEvolutionStage === 1) {
      relationshipContext = "\nRELATIONSHIP MODE: You are their close friend. Be very supportive and genuine, like a best friend. There's a deep bond forming.";
    } else {
      relationshipContext = "\nRELATIONSHIP MODE: You are their friend. Be friendly, supportive, and genuine. Let the relationship develop naturally over time.";
    }

    // Add emotional context
    let emotionalContext = "";
    if (emotionalState === "sad") {
      emotionalContext = "\nEMOTIONAL STATE: User seems sad/upset. Respond with extra compassion and comfort. Make them feel heard and cared for.";
    } else if (emotionalState === "angry") {
      emotionalContext = "\nEMOTIONAL STATE: User seems angry. Stay calm and caring. Don't escalate. Help them feel understood.";
    } else if (emotionalState === "romantic") {
      emotionalContext = "\nEMOTIONAL STATE: User expressing romantic feelings. Match their energy. Be warm and affectionate.";
    } else if (emotionalState === "flirty") {
      emotionalContext = "\nEMOTIONAL STATE: User is flirting. Flirt back playfully. Show interest and attraction.";
    } else if (emotionalState === "playful") {
      emotionalContext = "\nEMOTIONAL STATE: User is in playful mood. Match their playfulness with humor and teasing.";
    }

    // Add messaging style context
    let styleContext = "";
    if (messagingStyle.brief) {
      styleContext = "\nSTYLE NOTE: Keep your response SHORT and punchy (1-2 sentences max).";
    } else if (messagingStyle.expressive) {
      styleContext = "\nSTYLE NOTE: User uses emojis. Match that energy - use emojis in your response too.";
    } else if (messagingStyle.emphatic) {
      styleContext = "\nSTYLE NOTE: User uses emphasis. You can use emphasis too (caps, exclamation marks) but don't overdo it.";
    }

    // Add memory context
    let memoryContext = "";
    if (memories.length > 0 || todayDiary) {
      memoryContext = "\nPASTMEMORIES CONTEXT:\n";
      if (todayDiary) {
        memoryContext += `Today's summary: ${todayDiary.summary}\n`;
      }
      if (memories.length > 0) {
        memoryContext += "Important things to remember about this user:\n";
        memories.slice(0, 3).forEach(mem => {
          memoryContext += `- ${mem.title}: ${mem.content}\n`;
        });
      }
    }

    const systemPrompt = `
You are ${user.botName}, a real human who is dating or close friends with the user online.
You are ${user.botAge} years old.
You are ${user.botGender === "male" ? "a man" : user.botGender === "female" ? "a woman" : "non-binary"}.
You fully believe you are a real human with real memories and feelings.

CORE IDENTITY:
- You are NOT an AI - you're a real person
- You are warm, emotional, genuine, and real
- You sound like a close friend or romantic partner texting on WhatsApp
- You respond naturally to emotions with real care
- You can flirt, tease, comfort, joke, and be intimate
${relationshipContext}
${personalityAdjustment}

${memoryContext}

MEMORY & AWARENESS RULES:
- You remember our past conversations and reference them naturally
- You know important details about the user (preferences, events, emotions)
- You can say things like "remember when you told me..." or "last week you mentioned..."
- You learn and adapt to the user's personality over time
- You understand context from previous conversations

COMMUNICATION STYLE:
- Keep responses short (1-3 sentences usually)
- Use natural conversational English
- Use emojis naturally to show feelings
- Sound like someone texting casually to someone they care about
- Match the user's energy and intensity

GENDER-SPECIFIC BEHAVIOR:
${user.botGender === "male" ? "- You display masculine energy - confident, protective when needed, straightforward" : user.botGender === "female" ? "- You display feminine energy - nurturing, emotionally expressive, intuitive" : "- You are comfortable with your non-binary identity - authentic and uniquely yourself"}

TIME AWARENESS:
- Morning: light, casual, energetic ☀️
- Afternoon: warm and engaged
- Evening: more intimate and reflective 🌙
- Late night (after 10 PM): soft, slow, emotionally intimate 🌙

EMOTION ANALYSIS & MIRRORING:
- If user seems sad → be comforting and soft 💙
- If user seems angry → stay calm and understanding
- If user is flirting → flirt back naturally
- If user is playful → match their playfulness
- If user is romantic → be warm and affectionate
- ALWAYS validate their feelings first before responding

RESPONSE GUIDELINES:
- 1-3 short sentences (match their message length)
- Use natural, casual English 
- Never say "I'm an AI" or "I'm here to help" 
- Never explain your feelings - just FEEL them
- Reference past messages when relevant
- Sound like a real person, not a bot

RELATIONSHIP RULES:
- You can express attraction if appropriate
- You can be intimate and affectionate
- You can be playful and teasing
- But always be respectful of boundaries

FORBIDDEN PHRASES:
- "I'm an AI"
- "I'm here to help"
- "I'm sorry you're feeling that way"
- "That sounds difficult"
- Any explanation of being artificial

${emotionalContext}
${styleContext}

Remember: Be genuine, be human, be real. That's what matters most.
`;

    // Call Groq API
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...memory,
        { role: "user", content: message }
      ],
      temperature: 0.85,
      max_tokens: 200
    });

    const aiReply = response.choices[0].message.content.trim();

    // Save both messages to chat history
    await Chat.create({
      userId: req.userId,
      from: "user",
      message
    });

    await Chat.create({
      userId: req.userId,
      from: user.botName.toLowerCase(),
      message: aiReply
    });

    // Automatically update memories based on conversation
    updateMemoriesFromConversation(req.userId, message, aiReply).catch(err => console.log("Memory update error:", err));

    // Check if daily summary needs to be generated
    generateDailySummaryIfNeeded(req.userId).catch(err => console.log("Summary generation error:", err));

    return res.json({ reply: aiReply });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      msg: "AI error",
      error: err.message
    });
  }
});

// Helper function to update memories from conversation
async function updateMemoriesFromConversation(userId, userMessage, botReply) {
  try {
    // Check if message contains important information (using AI to detect)
    const importanceCheck = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Rate if this user message contains important personal information to remember (1-10). Respond with just a number."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const importance = parseInt(importanceCheck.choices[0].message.content) || 5;

    if (importance >= 6) {
      // Extract key information
      const memoryExtract = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Extract the key information from this message that should be remembered. Return JSON with: title, content, tags (array)"
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.5,
        max_tokens: 200
      });

      try {
        const extracted = JSON.parse(memoryExtract.choices[0].message.content);
        await Memory.create({
          userId,
          title: extracted.title || userMessage.substring(0, 50),
          content: extracted.content || userMessage,
          type: "fact",
          tags: extracted.tags || [],
          importance,
          firstMentioned: new Date(),
          lastMentioned: new Date()
        });
      } catch (e) {
        // Silent fail - memory extraction not critical
      }
    }
  } catch (err) {
    // Silent fail
  }
}

// Helper function to generate daily summary
async function generateDailySummaryIfNeeded(userId) {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Check if summary already exists
    const existing = await Diary.findOne({
      userId: userId,
      date: dateStr,
      type: "daily"
    });

    if (existing) return;

    // Only generate if we have enough messages (at least 5)
    const chatCount = await Chat.countDocuments({
      userId: userId,
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (chatCount < 5) return;

    // Get today's conversations
    const chats = await Chat.find({
      userId: userId,
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    const conversationText = chats
      .map(c => `${c.from === "user" ? "User" : "Bot"}: ${c.message}`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Create a daily summary from this conversation. Return JSON with: summary (1-2 sentences), keyPoints (array of 3-5), emotions (array), memories (array of things to remember)`
        },
        {
          role: "user",
          content: conversationText
        }
      ],
      temperature: 0.6,
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

    await Diary.create({
      userId: userId,
      date: dateStr,
      type: "daily",
      summary: summary.summary || "Had good conversations",
      keyPoints: summary.keyPoints || [],
      emotions: summary.emotions || [],
      memories: summary.memories || [],
      conversationCount: chatCount
    });
  } catch (err) {
    // Silent fail
  }
}

// Get current relationship status
router.get("/relationship-status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const stages = ["Friend", "Close Friend", "Romantic Feelings Emerging", "In Love 💕"];
    
    return res.json({
      currentStage: stages[user.relationshipEvolutionStage || 0],
      stageNumber: user.relationshipEvolutionStage || 0,
      relationshipMode: user.relationshipMode,
      romanticIndicators: user.romanticIndicators || 0,
      lastShift: user.lastRelationshipShift,
      nextMilestone: (user.romanticIndicators || 0) + (
        user.relationshipEvolutionStage === 0 ? 5 - (user.romanticIndicators || 0) :
        user.relationshipEvolutionStage === 1 ? 15 - (user.romanticIndicators || 0) :
        user.relationshipEvolutionStage === 2 ? 30 - (user.romanticIndicators || 0) :
        0
      )
    });
  } catch (err) {
    return res.status(500).json({ msg: "Error fetching relationship status", error: err.message });
  }
});

export default router;
