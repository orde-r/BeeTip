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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const didRegister = await register(email, password);
    setIsSubmitting(false);

    if (didRegister) {
      navigate(ROUTES.HOME);
      return;
    }

    setError("Registration failed. Check the email or try logging in.");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header-container">
        <p className="auth-form-logo logo">BeeTip</p>
        <p className="auth-form-desc">Create an account to request and deliver orders.</p>
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
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </label>

      {error && <p className="auth-form-error">{error}</p>}

      <button type="submit" className="primary-btn auth-form-btn" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Register"}
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
