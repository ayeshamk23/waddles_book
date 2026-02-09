import React, { useRef } from "react";

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputsRef = useRef([]);

  const handleChange = (index, digit) => {
    const next = value.split("");
    next[index] = digit.replace(/\D/g, "").slice(-1);
    const nextValue = next.join("");
    onChange(nextValue);
    if (digit && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !value[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-group">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          className="otp-input"
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          maxLength={1}
        />
      ))}
    </div>
  );
}
