import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthButton from "../components/AuthButton";
import OtpInput from "../components/OtpInput";
import { verify2FA } from "../authApi";

export default function Verify2FA({ navigate, session }) {
  const [code, setCode] = useState("");
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    if (!/^\d{6}$/.test(code)) {
      setBanner({ type: "error", text: "Invalid verification code" });
      return;
    }
    setLoading(true);
    try {
      await verify2FA({
        user_id: session.userId,
        temp_token: session.tempToken,
        code,
      });
      setBanner({ type: "success", text: "Verified. Logging in..." });
      setTimeout(() => navigate("dashboard"), 700);
    } catch (err) {
      const message =
        err.message && String(err.message).toLowerCase().includes("expired")
          ? "Code expired. Try again"
          : "Invalid verification code";
      setBanner({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verify code" subtitle="Enter the 6-digit code">
      {banner && (
        <div className={`auth-banner ${banner.type === "error" ? "error" : ""}`}>
          {banner.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <OtpInput value={code} onChange={setCode} />
        <AuthButton type="submit" disabled={loading} block>
          {loading ? "Verifying..." : "Verify"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
