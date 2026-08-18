import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    navigate("/login");
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#1e3c72',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    marginLeft: '1.5rem',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'color 0.2s',
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textDecoration: 'none' }}>
          🚗 RideHub
        </Link>
      </div>
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/cars" style={linkStyle}>Cars</Link>
        <Link to="/bikes" style={linkStyle}>Bikes</Link>
        <Link to="/my-bookings" style={linkStyle}>My Bookings</Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/admin" style={linkStyle}>Admin Dashboard</Link>
            <button 
              onClick={handleLogout} 
              style={{ marginLeft: '1.5rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ ...linkStyle, background: '#10b981', padding: '0.5rem 1rem', borderRadius: '4px' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}