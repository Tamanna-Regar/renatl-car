import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Simulate login (store in localStorage)
    setTimeout(() => {
      try {
        const userData = {
          email,
          name: email.split('@')[0],
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        setLoading(false);
        navigate('/');
      } catch (err) {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        background: '#edf2f7',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: '18px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          width: '100%',
          maxWidth: '440px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2
          style={{
            margin: '0 0 1.8rem',
            color: '#111827',
            fontSize: '2rem',
            textAlign: 'center',
            fontWeight: '700',
          }}
        >
          Login to Your Account
        </h2>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.2rem',
              fontSize: '0.95rem',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: '600', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '1rem',
                boxSizing: 'border-box',
                background: '#f9fafb',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: '600', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '1rem',
                boxSizing: 'border-box',
                background: '#f9fafb',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '700',
            }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}