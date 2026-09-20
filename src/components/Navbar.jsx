import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('role') || '';
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userData.name || userData.email || 'User';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [isDarkTheme, setIsDarkTheme] = React.useState(() => {
    const saved = localStorage.getItem('appTheme');
    return saved !== 'light'; // default dark
  });

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    document.body.className = newTheme ? 'dark-theme' : 'light-theme';
  };

  React.useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
      <div className="site-nav-brand">
        <Link to="/">
          <div className="site-nav-logo">🚗</div>
          <h2 className="site-nav-title">RIDE EASY</h2>
        </Link>
      </div>

      <div className="site-nav-links">
        <Link to="/cars">Cars</Link>
        <Link to="/bikes">Bikes</Link>
        
        {isLoggedIn ? (
          <>
            <button className="site-nav-theme" onClick={toggleTheme} title="Toggle Theme">
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
            <Link to="/wallet">Wallet</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/profile">Profile</Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="site-nav-user">Admin Dashboard</Link>
            )}
            <span className="site-nav-user">Hi, {userName}</span>
            <button className="site-nav-action site-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="site-nav-action site-nav-login">Login</Link>
            <Link to="/register" className="site-nav-action site-nav-register">Register</Link>
          </>
        )}
      </div>
      </div>
    </nav>
  );
}