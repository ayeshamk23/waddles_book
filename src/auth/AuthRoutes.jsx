import React, { useMemo, useState } from "react";
import AuthLayout from "./AuthLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Verify2FA from "./pages/Verify2FA";
import CreateProfile from "./pages/CreateProfile";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";

const ROUTES = {
  login: Login,
  signup: Signup,
  "forgot-password": ForgotPassword,
  "reset-password": ResetPassword,
  "verify-2fa": Verify2FA,
  "create-profile": CreateProfile,
  dashboard: DashboardPlaceholder,
};

export default function AuthRoutes({ initial = "login" }) {
  const [route, setRoute] = useState(initial);
  const [session, setSession] = useState({ tempToken: null, userId: null });

  const navigate = (next) => {
    if (ROUTES[next]) {
      setRoute(next);
    }
  };

  const Component = ROUTES[route] || Login;
  const footer =
    route === "login" || route === "signup" ? (
      <span>
        {route === "login" ? "By logging in you agree to our " : "By signing up you agree to our "}
        <a href="/terms" className="auth-link" target="_blank" rel="noreferrer">
          Terms
        </a>{" "}
        and have read our{" "}
        <a href="/privacy" className="auth-link" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        .
      </span>
    ) : null;
  const queryToken = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  return (
    <AuthLayout footer={footer}>
      <Component
        navigate={navigate}
        session={session}
        setSession={setSession}
        token={queryToken}
      />
    </AuthLayout>
  );
}
