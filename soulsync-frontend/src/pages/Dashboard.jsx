import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export default function Dashboard({ user, onBack }) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    daysActive: 0,
    relationshipStage: "Friend",
    romanticIndicators: 0,
    nextMilestone: 5
  });
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Load relationship status
      const relationshipRes = await apiFetch("/ai/relationship-status", {
        method: "GET"
      });

      if (relationshipRes) {
        setStats({
          totalMessages: relationshipRes.romanticIndicators * 10 || 0,
          daysActive: Math.floor((Date.now() - new Date(user.createdAt || Date.now())) / (1000 * 60 * 60 * 24)) || 1,
          relationshipStage: relationshipRes.currentStage || "Friend",
          romanticIndicators: relationshipRes.romanticIndicators || 0,
          nextMilestone: relationshipRes.nextMilestone || 5
        });
      }

      // Load memories
      const memoriesRes = await apiFetch("/memory/important", {
        method: "GET"
      });

      if (memoriesRes?.memories) {
        setMemories(memoriesRes.memories.slice(0, 5));
      }

      setLoading(false);
    } catch (err) {
      console.error("Dashboard error:", err);
      setLoading(false);
    }
  }

  const progressPercentage = ((stats.romanticIndicators / (stats.romanticIndicators + stats.nextMilestone)) * 100).toFixed(0);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your journey...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-value">{stats.totalMessages}</div>
              <div className="stat-label">Messages Sent</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{stats.daysActive}</div>
              <div className="stat-label">Days Together</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💕</div>
              <div className="stat-value">{stats.romanticIndicators}</div>
              <div className="stat-label">Romantic Moments</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{stats.relationshipStage}</div>
              <div className="stat-label">Current Stage</div>
            </div>
          </div>

          {/* Relationship Progress */}
          <div className="progress-card">
            <h3>Relationship Journey 🌟</h3>
            <p className="progress-subtitle">
              Your bond with {user.botName || "Soul"} is growing!
            </p>
            
            <div className="progress-stages">
              <div className={`stage ${stats.romanticIndicators >= 0 ? 'active' : ''}`}>
                <div className="stage-dot">👥</div>
                <div className="stage-label">Friend</div>
              </div>
              <div className="stage-line"></div>
              <div className={`stage ${stats.romanticIndicators >= 5 ? 'active' : ''}`}>
                <div className="stage-dot">🤝</div>
                <div className="stage-label">Close Friend</div>
              </div>
              <div className="stage-line"></div>
              <div className={`stage ${stats.romanticIndicators >= 15 ? 'active' : ''}`}>
                <div className="stage-dot">💗</div>
                <div className="stage-label">Romantic Feelings</div>
              </div>
              <div className="stage-line"></div>
              <div className={`stage ${stats.romanticIndicators >= 30 ? 'active' : ''}`}>
                <div className="stage-dot">💕</div>
                <div className="stage-label">In Love</div>
              </div>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="progress-text">
                {stats.nextMilestone > 0 
                  ? `${stats.nextMilestone} more romantic moments to next stage!`
                  : "You've reached the deepest bond! 💕"}
              </p>
            </div>
          </div>

          {/* Memories Section */}
          <div className="memories-card">
            <h3>Cherished Memories 💭</h3>
            {memories.length > 0 ? (
              <div className="memories-list">
                {memories.map((mem, idx) => (
                  <div key={idx} className="memory-item">
                    <div className="memory-icon">
                      {mem.type === 'emotion' ? '❤️' : mem.type === 'event' ? '🎉' : '📌'}
                    </div>
                    <div className="memory-content">
                      <div className="memory-title">{mem.title}</div>
                      <div className="memory-text">{mem.content}</div>
                      <div className="memory-tags">
                        {mem.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="memory-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-memories">
                <p>💫 Start chatting to create beautiful memories together!</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn">
                <span className="action-icon">📊</span>
                <span>View Chat History</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">🎨</span>
                <span>Customize Personality</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📸</span>
                <span>Memory Album</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">🎁</span>
                <span>Milestones</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
