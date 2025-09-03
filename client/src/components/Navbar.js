import React from 'react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>ExpenseTracker</h1>
        </div>
        <div className="navbar-menu">
          {user ? (
            <>
              <span className="welcome-text">Welcome, {user.name}</span>
              <button className="nav-btn logout-btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="nav-btn">Login</a>
              <a href="/register" className="nav-btn register-btn">Register</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
