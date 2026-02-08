import React from "react";
import HomeScreen from "./components/HomeScreen";
import "./index.css";
import FlipBook from "./components/FlipBook";

export default function App() {
  return (
    <HomeScreen title="Your Space to Create">
      <FlipBook />
    </HomeScreen>
  );
}
