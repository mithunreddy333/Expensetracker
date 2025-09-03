import React from 'react';
import './Header.css';

const Header = ({ isMenuOpen, toggleMenu }) => {
  return (
    <div className="header">
      <div className="header-content">
        <h1>Expense Tracker</h1>
        <button className={`menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default Header;
