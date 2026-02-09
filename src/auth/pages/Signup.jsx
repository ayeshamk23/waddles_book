import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import PasswordStrength from "../components/PasswordStrength";
import { register } from "../authApi";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export default function Signup({ navigate }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const validate = () => {
    const next = {};
    if (!username || !usernameRegex.test(username)) {
      next.username = "Something went wrong. Please try again";
    }
    if (!email || !emailRegex.test(email)) next.email = "Something went wrong. Please try again";
    if (!password || password.length < 6) next.password = "Password is too weak";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match";
    if (!terms) next.terms = "Something went wrong. Please try again";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setBanner(null);
    try {
      const response = await register({ fullName, username, email, password });
      if (response.status === 201) {
        setBanner({ type: "success", text: "Account created successfully." });
        // setTimeout(() => navigate("dashboard"), 700);
        setTimeout(() => navigate("create-profile"), 700);

      }
    } catch (err) {
      if (err.status === 409) {
        setBanner({ type: "error", text: "This email is already registered" });
      } else if (err.status === 400) {
        setBanner({ type: "error", text: "Something went wrong. Please try again" });
      } else {
        setBanner({ type: "error", text: "Something went wrong. Please try again" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Start your new diary">
      {banner && (
        <div className={`auth-banner ${banner.type === "error" ? "error" : ""}`}>
          {banner.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Full name"
          value={fullName}
          onChange={setFullName}
          placeholder="Your name"
        />
        <AuthInput
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="username"
          error={errors.username}
        />
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••"
          error={errors.password}
        />
        <AuthInput
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••"
          error={errors.confirmPassword}
        />
        <PasswordStrength password={password} />
        <label className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
          <span>I agree to the Terms of Service</span>
        </label>
        {errors.terms && <span className="auth-input-help">{errors.terms}</span>}
        <AuthButton type="submit" disabled={loading} block>
          {loading ? "Creating..." : "Create account"}
        </AuthButton>
      </form>
      <div className="auth-links">
        <span className="auth-link" onClick={() => navigate("login")}
          >Already have an account?</span
        >
      </div>
    </AuthCard>
  );
}
