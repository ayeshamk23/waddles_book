import React from "react";

const getStrength = (password) => {
  if (!password) return { label: "", level: 0 };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 10) score += 1;

  if (score <= 2) return { label: "Weak", level: 1 };
  if (score <= 4) return { label: "Okay", level: 2 };
  return { label: "Strong", level: 3 };
};

export default function PasswordStrength({ password }) {
  const { label, level } = getStrength(password);
  return (
    <div className="password-strength">
      <div className="password-bars">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={`password-bar ${
              level >= index ? `active ${label.toLowerCase()}` : ""
            }`}
          />
        ))}
      </div>
      <span className="password-label">{label}</span>
    </div>
  );
}
