import React, { useState } from "react";
import Tooltip from "./Tooltip";
import "./MicToolButton.css";

export default function MicToolButton({ isActive, isListening, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="tool-icon-button-wrapper">
      {isHovered && <Tooltip text={isListening ? "Listening..." : "Mic"} />}
      <button
        type="button"
        className={`tool-icon-button mic-tool-button${isActive ? " active" : ""}${
          isListening ? " listening" : ""
        }`}
        onClick={onClick}
        aria-label="Mic"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="tool-icon-shadow" aria-hidden="true" />
        {isListening && (
          <>
            <span className="listening-ring ring-1" aria-hidden="true" />
            <span className="listening-ring ring-2" aria-hidden="true" />
            <span className="listening-ring ring-3" aria-hidden="true" />
          </>
        )}
        <span className="tool-icon-content">
          <img className="tool-icon-img mic-icon-img mic-svg" src="/assets/mic.png" alt="Mic" />
        </span>
      </button>
    </div>
  );
}
