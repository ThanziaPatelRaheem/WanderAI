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
          <ul className="header__nav-list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive
                    ? "header__nav-link header__nav-link--active"
                    : "header__nav-link"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/features"
                className={({ isActive }) =>
                  isActive
                    ? "header__nav-link header__nav-link--active"
                    : "header__nav-link"
                }
              >
                Features
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "header__nav-link header__nav-link--active"
                    : "header__nav-link"
                }
              >
                Login
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="header__actions">
          <Link to="/features" className="header-secondary-link">
            Explore
          </Link>
          <Link className="header__primary-link">Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
