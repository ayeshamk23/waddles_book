import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { forgotPassword } from "../authApi";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword({ navigate }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const validate = () => {
    const next = {};
    if (!email) next.email = "Email is required";
    else if (!emailRegex.test(email)) next.email = "Something went wrong. Please try again";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setBanner(null);
    try {
      await forgotPassword({ email });
      setBanner({
        type: "success",
        text: "Check your email for a reset link.",
      });
    } catch (err) {
      setBanner({ type: "error", text: "Something went wrong. Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Forgot password" subtitle="We will send you a reset link">
      {banner && (
        <div className={`auth-banner ${banner.type === "error" ? "error" : ""}`}>
          {banner.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
        />
        <AuthButton type="submit" disabled={loading} block>
          {loading ? "Sending..." : "Send reset link"}
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
