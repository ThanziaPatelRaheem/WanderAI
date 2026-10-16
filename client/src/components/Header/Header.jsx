import React from "react";
import "./Header.css";
import { Link, NavLink } from "react-router-dom";
import { LuCompass } from "react-icons/lu";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">
            <LuCompass />
          </span>
          <span className="header__brand-name">
            Wander<span className="header__brand-accent">AI</span>
          </span>
        </Link>
        <nav className="header-navigation">
          <ul className="header__nav-list"></ul>
        </nav>
        <div className="header__actions">
          <Link to="/login" className="header__primary-link">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
