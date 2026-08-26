import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNo: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Password check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // REGISTER USER IN MONGODB
      // ==========================================

      const response = await fetch(
        'http://127.0.0.1:8000/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            licenseNo: formData.licenseNo.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log('REGISTER RESPONSE:', data);

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed'
        );
      }

      // ==========================================
      // REGISTRATION SUCCESS
      // ==========================================

      alert('Registration successful! Please login.');

      setLoading(false);

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseNo: '',
        password: '',
        confirmPassword: '',
      });

      // Go to login
      navigate('/login');

    } catch (error) {
      console.error(
        'REGISTER ERROR:',
        error
      );

      setLoading(false);

      setError(
        error.message ||
          'Unable to register. Please try again.'
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '30px',
          borderRadius: '10px',
          boxShadow:
            '0 4px 12px rgba(0,0,0,0.1)',
          width: '380px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#111827',
          }}
        >
          Create Your Account
        </h2>

        {error && (
          <p
            style={{
              color: '#ef4444',
              fontSize: '0.85rem',
              textAlign: 'center',
              marginBottom: '15px',
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Full Name */}
          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#374151',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border:
                  '1px solid #d1d5db',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#374151',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border:
                  '1px solid #d1d5db',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#374151',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border:
                  '1px solid #d1d5db',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Driving License */}
          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#374151',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Driving License Number
            </label>

            <input
              type="text"
              name="licenseNo"
              placeholder="Enter your driving license number"
              value={formData.licenseNo}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border:
                  '1px solid #d1d5db',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#374151',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border:
                  '1px solid #d1d5db',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: '#374151',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border:
                  '1px solid #d1d5db',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Registering...'
              : 'Register'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            marginTop: '15px',
            color: '#6b7280',
          }}
        >
          Already have an account?{' '}

          <Link
            to="/login"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}