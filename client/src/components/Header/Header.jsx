import "./Header.css";
import { Link } from "react-router-dom";
import { LuCompass, LuSparkles } from "react-icons/lu";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container header__inner">
        {/* WanderAI logo */}
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">
            <LuCompass />
          </span>

          <span className="header__brand-name">
            Wander<span className="header__brand-accent">AI</span>
          </span>
        </Link>

        {/* Header tagline */}
        <div className="header__tagline">
          <LuSparkles className="header__tagline-icon" />

          <span className="header__tagline-desktop">
            Your AI Travel Companion
          </span>

          <span className="header__tagline-mobile">AI Travel Planner</span>
        </div>

        {/* Login temporarily hidden until authentication is implemented */}
        {/*
        <div className="header__actions">
          <Link to="/login" className="header__primary-link">
            Login
          </Link>
        </div>
        */}
      </div>
    </header>
  );
};

export default Header;
