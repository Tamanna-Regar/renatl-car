import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    const userExists = existingUsers.some(u => u.email === formData.email);
    if (userExists) {
      setError('Email is already registered!');
      return;
    }

    // Yahan password field add kar di hai taaki login ke waqt match ho sake
    const newUser = {
      id: Date.now(),
      name: formData.name,
       username: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password, 
      role: 'user' // 'user' role rakha hai taaki ProtectedRoute match ho jaye
    };

    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    alert('Registration successful!');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '380px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#111827' }}>Create Your Account</h2>
        
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '4px' }}>Full Name</label>
            <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '4px' }}>Phone Number</label>
            <input type="tel" name="phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '4px' }}>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '4px' }}>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} required />
          </div>

          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Register</button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '15px', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}