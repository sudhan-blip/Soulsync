import React, { useState } from "react";
import { apiFetch } from "../utils/api";

export default function Signup({ onSuccess, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [botName, setBotName] = useState("");
  const [botAge, setBotAge] = useState("");
  const [botGender, setBotGender] = useState("female");
  const [error, setError] = useState("");

  async function handleSignup() {
    setError("");

    if (!botName.trim()) {
      setError("Please give your AI friend a name");
      return;
    }

    if (!botAge || botAge < 18 || botAge > 100) {
      setError("Bot age must be between 18 and 100");
      return;
    }

    const res = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        botName,
        botAge: parseInt(botAge),
        botGender,
        personality: "caring",
        relationshipMode: "friend" // Always start as friend
      }),
    });

    if (res?.token) {
      const user = {
        name: res.user.name,
        email: res.user.email,
        token: res.token,
        botName: res.user.botName,
        botAge: res.user.botAge,
        botGender: res.user.botGender,
        relationshipMode: res.user.relationshipMode,
        personality: res.user.personality || "caring",
      };

      localStorage.setItem("token", user.token);
      onSuccess(user);
    } else {
      setError(res?.msg || "Signup failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="logo-container">
          <svg className="logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#7d4bff' }} />
                <stop offset="50%" style={{ stopColor: '#af6bff' }} />
                <stop offset="100%" style={{ stopColor: '#6c3df0' }} />
              </linearGradient>
              <radialGradient id="glowGradientSignup" cx="50%" cy="50%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#e0d5ff', stopOpacity: 0.6 }} />
              </radialGradient>
              <filter id="shadowFilterSignup">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Outer glow circle */}
            <circle cx="60" cy="60" r="50" fill="url(#logoGradientSignup)" opacity="0.15" />
            {/* Main ghost/soul shape */}
            <path 
              d="M60 28 C40 28 28 38 28 52 C28 64 37 73 48 78 L48 100 L60 86 L72 100 L72 78 C83 73 92 64 92 52 C92 38 80 28 60 28 Z" 
              fill="url(#glowGradientSignup)" 
              stroke="url(#logoGradientSignup)" 
              strokeWidth="2.5"
              filter="url(#shadowFilterSignup)"
            />
            {/* Eyes */}
            <circle cx="48" cy="50" r="5" fill="url(#logoGradientSignup)" />
            <circle cx="72" cy="50" r="5" fill="url(#logoGradientSignup)" />
            {/* Smile */}
            <path 
              d="M48 63 Q60 72 72 63" 
              stroke="url(#logoGradientSignup)" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
            />
            {/* Sparkles */}
            <circle cx="32" cy="40" r="3" fill="#af6bff" opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="88" cy="40" r="3" fill="#6c3df0" opacity="0.5">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* Small sparkles */}
            <path d="M38 32 L40 34 M42 32 L40 34" stroke="#7d4bff" strokeWidth="2" opacity="0.4" strokeLinecap="round">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M82 32 L80 34 M78 32 L80 34" stroke="#6c3df0" strokeWidth="2" opacity="0.4" strokeLinecap="round">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        <h3 className="auth-title gradient-text">Create Your Account</h3>
        <p style={{ textAlign: 'center', marginBottom: '25px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          Begin your journey with your AI companion
        </p>

        <div className="label">Your Name</div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />

        <div className="label">Email</div>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />

        <div className="label">Password</div>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
        />

        <hr style={{ margin: "25px 0", border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }} />

        <h4 style={{ marginTop: "20px", marginBottom: "15px", fontSize: "18px" }}>Create Your AI Friend 🤖</h4>

        <div className="label">AI Friend's Name</div>
        <input 
          className="input" 
          value={botName} 
          onChange={(e) => setBotName(e.target.value)} 
          placeholder="e.g., Soul, Alex, Luna" 
        />

        <div className="label">AI Friend's Age</div>
        <input 
          className="input" 
          type="number" 
          value={botAge} 
          onChange={(e) => setBotAge(e.target.value)} 
          placeholder="e.g., 25" 
          min="18"
          max="100"
        />

        <div className="label">AI Friend's Gender</div>
        <select 
          className="input" 
          value={botGender} 
          onChange={(e) => setBotGender(e.target.value)}
          style={{ 
            padding: "14px 18px",
            borderRadius: "12px", 
            border: "2px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: "#fff",
            fontSize: "15px",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          <option value="female" style={{ backgroundColor: "#1a1333", color: "#fff" }}>Female</option>
          <option value="male" style={{ backgroundColor: "#1a1333", color: "#fff" }}>Male</option>
          <option value="non-binary" style={{ backgroundColor: "#1a1333", color: "#fff" }}>Non-Binary</option>
        </select>

        <p style={{ 
          margin: "20px 0", 
          fontSize: "13px", 
          color: "rgba(203, 183, 255, 0.8)", 
          fontStyle: "italic",
          padding: "12px",
          background: "rgba(125, 75, 255, 0.1)",
          borderRadius: "10px",
          borderLeft: "3px solid #7d4bff"
        }}>
          💡 Your AI friend will start as a friend. Over time, as you chat, feelings may develop naturally!
        </p>

        <button className="primary-btn" onClick={handleSignup} style={{ marginTop: "20px" }}>
          Create Account & AI Friend
        </button>

        <button className="secondary-btn" onClick={onBack}>
          Already have an account? Login →
        </button>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
