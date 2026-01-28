import React, { useState } from "react";
import { apiFetch } from "../utils/api";

export default function Login({ onLoginSuccess, onSignupClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
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
        personality: res.user.personality || "caring"
      };

      localStorage.setItem("token", user.token);
      onLoginSuccess(user);
    } else {
      setError(res?.msg || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="logo-container">
          <svg className="logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#7d4bff' }} />
                <stop offset="50%" style={{ stopColor: '#af6bff' }} />
                <stop offset="100%" style={{ stopColor: '#6c3df0' }} />
              </linearGradient>
              <radialGradient id="glowGradient" cx="50%" cy="50%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#e0d5ff', stopOpacity: 0.6 }} />
              </radialGradient>
              <filter id="shadowFilter">
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
            <circle cx="60" cy="60" r="50" fill="url(#logoGradient)" opacity="0.15" />
            {/* Main ghost/soul shape */}
            <path 
              d="M60 28 C40 28 28 38 28 52 C28 64 37 73 48 78 L48 100 L60 86 L72 100 L72 78 C83 73 92 64 92 52 C92 38 80 28 60 28 Z" 
              fill="url(#glowGradient)" 
              stroke="url(#logoGradient)" 
              strokeWidth="2.5"
              filter="url(#shadowFilter)"
            />
            {/* Eyes */}
            <circle cx="48" cy="50" r="5" fill="url(#logoGradient)" />
            <circle cx="72" cy="50" r="5" fill="url(#logoGradient)" />
            {/* Smile */}
            <path 
              d="M48 63 Q60 72 72 63" 
              stroke="url(#logoGradient)" 
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

        <h2 className="auth-title gradient-text">Welcome Back</h2>
        <p className="auth-subtitle">Continue your journey with your AI companion</p>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Your AI friend that grows with you 💜
        </p>

        <div className="label">Email</div>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <div className="label">Password</div>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button className="primary-btn" onClick={handleLogin}>
          Login
        </button>

        {error && <div className="error">{error}</div>}

        <p className="switch-link" onClick={onSignupClick}>
          Don't have an account? Create one →
        </p>
      </div>
    </div>
  );
}
