import PlaceholderImage from "../../assets/images/TBAADS_circle_white.png";

import "./MockImg.css";

export default function MockImage() {
  return (
    <div className="mock-img-container">
      <img src={PlaceholderImage} alt="img" />
    </div>
  );
}
