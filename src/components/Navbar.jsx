import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    
    if (loggedIn && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: '#2d3748', color: '#fff', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🚗 RideHub</h2>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Home</Link>
        <Link to="/cars" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Cars</Link>
        <Link to="/bikes" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Bikes</Link>
        <Link to="/my-bookings" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>My Bookings</Link>
        
        {isLoggedIn && userData ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/profile" style={{ background: '#4c51bf', padding: '0.6rem 1rem', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: '600' }}>👤 Profile</Link>
            <button 
              onClick={handleLogout}
              style={{ background: '#ef4444', padding: '0.6rem 1.2rem', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <Link to="/login" style={{ background: '#3182ce', padding: '0.6rem 1rem', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
            <Link to="/register" style={{ background: '#059669', padding: '0.6rem 1rem', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}