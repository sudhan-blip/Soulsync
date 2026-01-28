import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";

export default function Chat({ user, onLogout, onProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const [botName, setBotName] = useState("Soul");
  const [botGender, setBotGender] = useState("female");

  // Get gender-specific emoji
  const getBotEmoji = () => {
    if (botGender === "male") return "👨"; // Man emoji
    if (botGender === "female") return "👩"; // Woman emoji
    return "🧑"; // Person emoji (non-binary)
  };

  // ------------------------------------
  // LOAD CHAT HISTORY
  // ------------------------------------
  useEffect(() => {
    loadHistory();
    if (user?.botName) {
      setBotName(user.botName);
    }
    if (user?.botGender) {
      setBotGender(user.botGender);
    }
  }, []);

  async function loadHistory() {
    try {
      const res = await apiFetch("/chat/history", {
        method: "GET"
      });

      if (res?.chats) {
        const formatted = res.chats.map((c) => ({
          from: c.from,
          text: c.message,
          id: c._id
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error("History error:", err);
    }
  }

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ------------------------------------
  // SEND MESSAGE
  // ------------------------------------
  async function sendMessage() {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    // Show user message instantly
    setMessages((prev) => [
      ...prev,
      { from: "user", text, id: Date.now() }
    ]);

    setTyping(true);

    try {
      // 🔥 CALL AI BACKEND
      const res = await apiFetch("/ai/send", {
        method: "POST",
        body: JSON.stringify({ message: text })
      });

      setTyping(false);

      if (res?.reply) {
        setMessages((prev) => [
          ...prev,
          { from: botName.toLowerCase(), text: res.reply, id: Date.now() + 1 }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            from: botName.toLowerCase(),
            text: "Hmm… I didn’t get that properly. Try again? 😔",
            id: Date.now() + 2
          }
        ]);
      }
    } catch (err) {
      setTyping(false);
      console.error("Send error:", err);
    }
  }

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <div className="chat-page">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="header-left">
          {/* SoulSync Logo */}
          <svg className="logo" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradientChat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#7d4bff' }} />
                <stop offset="50%" style={{ stopColor: '#af6bff' }} />
                <stop offset="100%" style={{ stopColor: '#6c3df0' }} />
              </linearGradient>
              <radialGradient id="glowGradientChat" cx="50%" cy="50%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#e0d5ff', stopOpacity: 0.6 }} />
              </radialGradient>
            </defs>
            {/* Outer glow circle */}
            <circle cx="60" cy="60" r="50" fill="url(#logoGradientChat)" opacity="0.15" />
            {/* Main ghost/soul shape */}
            <path 
              d="M60 28 C40 28 28 38 28 52 C28 64 37 73 48 78 L48 100 L60 86 L72 100 L72 78 C83 73 92 64 92 52 C92 38 80 28 60 28 Z" 
              fill="url(#glowGradientChat)" 
              stroke="url(#logoGradientChat)" 
              strokeWidth="2.5"
            />
            {/* Eyes */}
            <circle cx="48" cy="50" r="5" fill="url(#logoGradientChat)" />
            <circle cx="72" cy="50" r="5" fill="url(#logoGradientChat)" />
            {/* Smile */}
            <path 
              d="M48 63 Q60 72 72 63" 
              stroke="url(#logoGradientChat)" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
            />
          </svg>
          <span className="bot-name-header">
            {botName}
          </span>
        </div>
        <div className="header-right">
          <button className="profile-btn" onClick={onProfile} title="Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message-row ${m.from === "user" ? "user" : "bot"}`}
          >
            <div className="message-avatar">
              {m.from === "user" ? "👤" : getBotEmoji()}
            </div>
            <div className="message-content">
              <div className={`msg ${m.from === "user" ? "me" : "them"}`}>
                {m.text}
              </div>
              <div className="message-time">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="message-row bot">
            <div className="message-avatar">{getBotEmoji()}</div>
            <div className="typing">{botName} is typing…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="send-bar">
        <div className="input-wrapper">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Message ${botName}...`}
          />
          <button className="emoji-btn" onClick={() => setInput(input + "❤️")}>
            😊
          </button>
        </div>
        <button onClick={sendMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
