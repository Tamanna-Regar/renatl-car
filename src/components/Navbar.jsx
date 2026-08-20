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

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 40px', 
      backgroundColor: '#0e1424', 
      borderBottom: '1px solid #1f2937',
      color: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563eb', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>🚗</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '0.5px' }}>RIDE EASY</h2>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/cars" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Cars</Link>
        <Link to="/bikes" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Bikes</Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/my-bookings" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>My Bookings</Link>
            <Link to="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Profile</Link>
            {userRole === 'admin' && (
              <Link to="/admin" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>Admin Dashboard</Link>
            )}
            <span style={{ color: '#38bdf8', fontSize: '0.9rem', marginLeft: '10px' }}>Hi, {userName}</span>
            <button 
              onClick={handleLogout} 
              style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ padding: '6px 14px', background: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}>Login</Link>
            <Link to="/register" style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}