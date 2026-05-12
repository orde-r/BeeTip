import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import MockImage from "../../mockdata/MockImg/MockImg";
import "./Landing.css";

export default function Landing() {
  return (
    <section className="landing">
      <div className="landing-left">
        <p className="landing-logo logo">BeeTip</p>
        <p className="landing-desc">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Alias error
          quo iusto facere vero blanditiis voluptas quos aut distinctio esse!
        </p>
        <Link to={ROUTES.AUTH}>
          <button className="primary-btn">Login</button>
        </Link>
      </div>
      <div className="landing-right">
        <MockImage />
      </div>
    </section>
  );
}
