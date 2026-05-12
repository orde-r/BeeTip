import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { ROUTES } from "../../constants/routes";

interface RegisterProps {
  onSwitch: () => void;
}

export default function Register({ onSwitch }: RegisterProps) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (register(name, email, password)) {
      navigate(ROUTES.HOME);
      return;
    }

    setError("An account with this email already exists");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header-container">
        <p className="auth-form-logo logo">BeeTip</p>
        <p className="auth-form-desc">Lorem ipsum dolor sit amet.</p>
      </div>

      <label className="form-input-container">
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />
      </label>

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
          minLength={8}
          required
        />
      </label>

      {error && <p className="auth-form-error">{error}</p>}

      <button type="submit" className="primary-btn auth-form-btn">
        Register
      </button>

      <div className="auth-form-switch">
        <p>Already have an account?</p>
        <button type="button" className="auth-form-link" onClick={onSwitch}>
          Login
        </button>
      </div>
    </form>
  );
}
