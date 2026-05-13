import { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

type AuthMode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [displayedMode, setDisplayedMode] = useState<AuthMode>("login");
  const isRegister = mode === "register";
  const isAnimating = mode !== displayedMode;

  useEffect(() => {
    if (mode === displayedMode) return;
    const timer = setTimeout(() => setDisplayedMode(mode), 350);
    return () => clearTimeout(timer);
  }, [mode, displayedMode]);

  return (
    <section className={`auth ${isRegister ? "auth-register" : ""}`}>
      <div
        className={`auth-form-panel ${
          isAnimating ? "auth-form-panel-fading" : ""
        }`}
      >
        {displayedMode === "register" ? (
          <Register onSwitch={() => setMode("login")} />
        ) : (
          <Login onSwitch={() => setMode("register")} />
        )}
      </div>
    </section>
  );
}
