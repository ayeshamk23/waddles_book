import React from "react";
import AuthCard from "../components/AuthCard";

export default function DashboardPlaceholder({ navigate }) {
  return (
    <AuthCard title="Logged in" subtitle="Dashboard placeholder">
      <div className="auth-center">
        <p>You're logged in. Replace this with your real dashboard.</p>
        <button className="auth-ghost" onClick={() => navigate("login")}>Back to login</button>
      </div>
    </AuthCard>
  );
}
