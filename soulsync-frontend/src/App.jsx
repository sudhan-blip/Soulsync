import React, { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

export default function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // logout
  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setShowProfile(false);
  }

  // update user data
  function handleUpdateUser(updatedUser) {
    setUser(updatedUser);
  }

  // If no user → show login/signup
  if (!user) {
    return showSignup ? (
      <Signup onSuccess={setUser} onBack={() => setShowSignup(false)} />
    ) : (
      <Login
        onLoginSuccess={setUser}
        onSignupClick={() => setShowSignup(true)}
      />
    );
  }

  // Show profile if requested
  if (showProfile) {
    return <Profile user={user} onBack={() => setShowProfile(false)} onUpdate={handleUpdateUser} />;
  }

  // Logged in → show chat
  return <Chat user={user} onLogout={handleLogout} onProfile={() => setShowProfile(true)} />;
}
