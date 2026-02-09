import React from "react";
import HomeScreen from "./components/HomeScreen";
import "./index.css";
import FlipBook from "./components/FlipBook";
import AuthSandbox from "./auth";

const SHOW_AUTH_SANDBOX = true;

export default function App() {
  return (
    <>
      <HomeScreen title="Your Space to Create">
        <FlipBook />
      </HomeScreen>
      {SHOW_AUTH_SANDBOX && <AuthSandbox initial="create-profile" />}
    </>
  );
}
