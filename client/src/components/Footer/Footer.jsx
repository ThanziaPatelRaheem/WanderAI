import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <p className="footer__copyright">
        ©{currentYear} WanderAI. Designed & Developed by Thanzia Patel Raheem
      </p>
    </footer>
  );
};

export default Footer;
