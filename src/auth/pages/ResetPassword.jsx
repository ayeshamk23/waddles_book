import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { resetPassword } from "../authApi";

export default function ResetPassword({ navigate, token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const validate = () => {
    const next = {};
    if (!password || password.length < 6) {
      next.password = "Password is too weak";
    }
    if (confirm !== password) {
      next.confirm = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setBanner(null);
    try {
      await resetPassword({ token, password });
      setBanner({ type: "success", text: "Password reset. Redirecting to login..." });
      setTimeout(() => navigate("login"), 800);
    } catch (err) {
      if (err.status === 401) {
        setBanner({ type: "error", text: "Session expired. Please log in again" });
      } else {
        setBanner({ type: "error", text: "Something went wrong. Please try again" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset password" subtitle="Choose a new password">
      {banner && (
        <div className={`auth-banner ${banner.type === "error" ? "error" : ""}`}>
          {banner.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••"
          error={errors.password}
        />
        <AuthInput
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="••••••"
          error={errors.confirm}
        />
        <AuthButton type="submit" disabled={loading} block>
          {loading ? "Resetting..." : "Reset password"}
        </AuthButton>
      </form>
      <div className="auth-links">
        <span className="auth-link" onClick={() => navigate("login")}
          >Back to login</span
        >
      </div>
    </AuthCard>
  );
}
