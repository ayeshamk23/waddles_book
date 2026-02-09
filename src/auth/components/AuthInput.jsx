import React from "react";

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div className="auth-input-group">
      <label className="auth-input-label">{label}</label>
      <input
        className={`auth-input${error ? " error" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <span className="auth-input-help">{error}</span>}
    </div>
  );
}
