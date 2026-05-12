import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { ROUTES } from "../../constants/routes";

interface LoginProps {
  onSwitch: () => void;
}

export default function Login({ onSwitch }: LoginProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (login(email, password)) {
      navigate(ROUTES.HOME);
      return;
    }

    setError("Invalid email or password");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header-container">
        <p className="auth-form-logo logo">BeeTip</p>
        <p className="auth-form-desc">Lorem ipsum dolor sit amet.</p>
      </div>

      <label className="form-input-container">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@binus.ac.id"
          required
        />
      </label>

      <label className="form-input-container">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </label>

      {error && <p className="auth-form-error">{error}</p>}

      <button type="submit" className="primary-btn auth-form-btn">
        Login
      </button>

      <div className="auth-form-switch">
        <p>Don't have an account?</p>
        <button type="button" className="auth-form-link" onClick={onSwitch}>
          Register
        </button>
      </div>
    </form>
  );
}
