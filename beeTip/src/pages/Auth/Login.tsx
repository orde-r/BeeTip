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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const didLogin = await login(email, password);
    setIsSubmitting(false);

    if (didLogin) {
      navigate(ROUTES.HOME);
      return;
    }

    setError("Invalid email or password");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header-container">
        <p className="auth-form-logo logo">BeeTip</p>
        <p className="auth-form-desc">Order campus errands and pay securely.</p>
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
          placeholder="Password"
          required
        />
      </label>

      {error && <p className="auth-form-error">{error}</p>}

      <button type="submit" className="primary-btn auth-form-btn" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
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
