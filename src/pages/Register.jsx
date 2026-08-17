import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Simulate registration (store in localStorage)
    setTimeout(() => {
      try {
        const userData = {
          name,
          email,
          registeredAt: new Date().toISOString(),
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        setLoading(false);
        navigate('/');
      } catch (err) {
        setError('Registration failed. Please try again.');
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
          Create Your Account
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
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: '600', color: '#374151' }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '700',
            }}
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}