import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import "./Navbar.css";

const navMap = [
  { icon: "home", label: "Home", path: ROUTES.HOME },
  { icon: "assignment", label: "Orders", path: ROUTES.ORDERS },
  { icon: "chat", label: "Chat", path: ROUTES.CHAT },
  { icon: "person", label: "Profile", path: ROUTES.PROFILE },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      {navMap.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={`navbar-item ${
            pathname === item.path ? "navbar-item-active" : ""
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="navbar-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
