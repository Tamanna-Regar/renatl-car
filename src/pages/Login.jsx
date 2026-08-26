import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Car } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const loginEmail = username.trim().toLowerCase();
    const loginPassword = password.trim();

    try {
      // ==========================================
      // ADMIN LOGIN
      // ==========================================
      if (
        loginEmail === 'admin' ||
        loginEmail === 'admin@ridehub.com'
      ) {
        const response = await fetch(
          'http://127.0.0.1:8000/api/admin/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username.trim(),
              password: loginPassword,
            }),
          }
        );

        const data = await response.json();

        console.log('ADMIN LOGIN RESPONSE:', data);

        if (!response.ok) {
          throw new Error(
            data.detail ||
              'Invalid admin username or password'
          );
        }

        // Save admin login
        localStorage.setItem(
          'isLoggedIn',
          'true'
        );

        localStorage.setItem(
          'role',
          'admin'
        );

        localStorage.setItem(
          'user',
          JSON.stringify({
            name: 'Admin User',
            email: username.trim(),
            role: 'admin',
          })
        );

        if (rememberMe) {
          localStorage.setItem(
            'rememberMe',
            'true'
          );
        } else {
          localStorage.removeItem(
            'rememberMe'
          );
        }

        window.dispatchEvent(
          new Event('storage')
        );

        setLoading(false);

        navigate('/admin');

        return;
      }

      // ==========================================
      // EXISTING USER LOGIN FROM MONGODB
      // ==========================================

      const response = await fetch(
        'http://127.0.0.1:8000/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        }
      );

      const data = await response.json();

      console.log('USER LOGIN RESPONSE:', data);

      // ==========================================
      // LOGIN FAILED
      // ==========================================
      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Invalid email or password'
        );
      }

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================
      if (data.success) {
        const loggedInUser = {
          ...data.user,
          role: 'user',
        };

        // Save login session
        localStorage.setItem(
          'isLoggedIn',
          'true'
        );

        localStorage.setItem(
          'role',
          'user'
        );

        localStorage.setItem(
          'user',
          JSON.stringify(loggedInUser)
        );

        // Remember Me
        if (rememberMe) {
          localStorage.setItem(
            'rememberMe',
            'true'
          );
        } else {
          localStorage.removeItem(
            'rememberMe'
          );
        }

        // Update other components
        window.dispatchEvent(
          new Event('storage')
        );

        setLoading(false);

        // Existing user goes to home
        navigate('/');

        return;
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error(
        'LOGIN ERROR:',
        error
      );

      setLoading(false);

      setError(
        error.message ||
          'Please enter a valid email and password.'
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily:
          'system-ui, sans-serif',
      }}
    >
      {/* LEFT: Branding */}

      <div
        style={{
          flex: '1 1 45%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          background:
            'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            boxShadow:
              '0 8px 24px rgba(59,130,246,0.35)',
          }}
        >
          <Car
            size={44}
            color="#fff"
            strokeWidth={2.2}
          />
        </div>

        <h1
          style={{
            color: '#fff',
            fontSize: '2.4rem',
            fontWeight: '800',
            margin: '0 0 0.75rem 0',
            textAlign: 'center',
          }}
        >
          RideHub
        </h1>

        <p
          style={{
            color: '#93c5fd',
            fontSize: '1.15rem',
            margin:
              '0 0 1.5rem 0',
          }}
        >
          Car &amp; Bike Rental Platform
        </p>

        <div
          style={{
            width: '60px',
            height: '2px',
            background: '#334155',
            marginBottom: '1.5rem',
          }}
        />

        <p
          style={{
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '380px',
            lineHeight: '1.6',
            fontSize: '0.95rem',
          }}
        >
          Book cars and bikes in minutes,
          track your bookings, and manage
          your rentals — all from one place.
        </p>
      </div>

      {/* RIGHT: Login Form */}

      <div
        style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
          }}
        >
          <h2
            style={{
              color: '#fff',
              fontSize: '2rem',
              fontWeight: '800',
              margin: '0 0 6px 0',
            }}
          >
            Welcome Back!
          </h2>

          <p
            style={{
              color: '#93c5fd',
              marginBottom: '2rem',
            }}
          >
            Please sign in to continue
          </p>

          <form onSubmit={handleLogin}>
            {/* Username / Email */}

            <div
              style={{
                marginBottom: '1.3rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                }}
              >
                Username or Email
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <User
                  size={18}
                  color="#64748b"
                  style={{
                    position:
                      'absolute',
                    left: '14px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                  }}
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  required
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding:
                      '0.85rem 1rem 0.85rem 2.6rem',
                    background: '#1e293b',
                    border:
                      '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    boxSizing:
                      'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}

            <div
              style={{
                marginBottom: '1rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Lock
                  size={18}
                  color="#64748b"
                  style={{
                    position:
                      'absolute',
                    left: '14px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                  }}
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding:
                      '0.85rem 1rem 0.85rem 2.6rem',
                    background: '#1e293b',
                    border:
                      '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    boxSizing:
                      'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Remember me + Forgot password */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#cbd5e1',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor:
                      '#3b82f6',
                  }}
                />

                Remember me
              </label>

              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
                style={{
                  color: '#93c5fd',
                  fontSize: '0.9rem',
                  textDecoration:
                    'none',
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Error */}

            {error && (
              <p
                style={{
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginBottom:
                    '1rem',
                }}
              >
                {error}
              </p>
            )}

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                opacity: loading
                  ? 0.7
                  : 1,
                marginBottom: '1rem',
              }}
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </button>

            {/* Quick Demo Login Buttons */}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              {/* Fill Admin */}

              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border:
                    '1px solid #334155',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Fill Admin
              </button>

              {/* Register */}

              <button
                type="button"
                onClick={() =>
                  navigate('/register')
                }
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border:
                    '1px solid #334155',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                New User? Register
              </button>
            </div>
          </form>

          <p
            style={{
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.8rem',
              marginTop: '2.5rem',
            }}
          >
            © 2026 RideHub — Car &amp;
            Bike Rentals
          </p>
        </div>
      </div>
    </div>
  );
}