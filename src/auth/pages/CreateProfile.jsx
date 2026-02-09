import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

export default function CreateProfile({ navigate }) {
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <AuthCard title="Create profile" subtitle="Personalize your space">
      <div className="auth-center">
        <div className="profile-avatar">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              style={{ width: "100%", height: "100%", borderRadius: "50%" }}
            />
          ) : (
            "Upload profile"
          )}
        </div>
        <label className="auth-link auth-upload-link">
          Upload
          <input type="file" accept="image/*" onChange={handleAvatar} hidden />
        </label>
      </div>
      <AuthInput
        label="Display name"
        value={displayName}
        onChange={setDisplayName}
        placeholder="Your name"
      />
      <AuthButton block onClick={() => navigate("dashboard")}>Continue</AuthButton>
    </AuthCard>
  );
}
