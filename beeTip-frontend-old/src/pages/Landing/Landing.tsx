import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import "./Landing.css";

export default function Landing() {
  return (
    <section className="landing">
      <p className="landing-logo logo">BeeTip</p>
      <p className="landing-desc">
        Campus proxy buying for BINUS students. Request an errand, chat with a
        kurir, pay through wallet balance, and complete delivery with a security
        code.
      </p>
      <Link to={ROUTES.AUTH}>
        <button className="primary-btn">Get Started</button>
      </Link>
    </section>
  );
}
