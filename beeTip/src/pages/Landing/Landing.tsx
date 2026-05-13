import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import "./Landing.css";

export default function Landing() {
  return (
    <section className="landing">
      <p className="landing-logo logo">BeeTip</p>
      <p className="landing-desc">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Alias error
        quo iusto facere vero blanditiis voluptas quos aut distinctio esse!
      </p>
      <Link to={ROUTES.AUTH}>
        <button className="primary-btn">Login</button>
      </Link>
    </section>
  );
}
