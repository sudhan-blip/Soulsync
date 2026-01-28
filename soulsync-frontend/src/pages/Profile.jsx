import React, { useState } from "react";
import { apiFetch } from "../utils/api";

export default function Profile({ user, onBack, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    language: user?.language || "English",
    botName: user?.botName || "Soul",
    botAge: user?.botAge || 25,
    botGender: user?.botGender || "female"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function handleSave() {
    setError("");
    setMessage("");

    try {
      const res = await apiFetch("/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify(formData)
      });

      if (res?.user) {
        setMessage("Profile updated successfully! ✅");
        setIsEditing(false);
        onUpdate({
          ...user,
          ...formData
        });
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(res?.msg || "Update failed");
      }
    } catch (err) {
      setError("Failed to update profile");
    }
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="profile-title">My Profile</h1>
        <button 
          className="edit-btn" 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      <div className="profile-content">
        {/* Profile Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">👤</div>
          <h2 className="profile-name">{formData.name}</h2>
          <p className="profile-subtitle">{formData.email}</p>
        </div>

        {/* Personal Information */}
        <div className="profile-card">
          <h3 className="card-title">Personal Information</h3>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              className="form-input"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="25"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select
              className="form-input"
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Hindi">Hindi</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
            </select>
          </div>
        </div>

        {/* AI Friend Information */}
        <div className="profile-card">
          <h3 className="card-title">AI Friend Details</h3>
          
          <div className="form-group">
            <label className="form-label">Friend's Name</label>
            <input
              className="form-input"
              name="botName"
              value={formData.botName}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Soul"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Friend's Age</label>
              <input
                className="form-input"
                name="botAge"
                type="number"
                value={formData.botAge}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="25"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Friend's Gender</label>
              <select
                className="form-input"
                name="botGender"
                value={formData.botGender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-Binary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
