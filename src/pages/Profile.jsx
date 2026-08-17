import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem('user');
    const photo = localStorage.getItem('userPhoto');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      setFormData(parsedUser);
      if (photo) {
        setProfilePhoto(photo);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target.result);
        localStorage.setItem('userPhoto', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 400, 400);
      const photoData = canvasRef.current.toDataURL('image/jpeg');
      setProfilePhoto(photoData);
      localStorage.setItem('userPhoto', photoData);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('user', JSON.stringify(formData));
    setUserData(formData);
    setIsEditing(false);
  };

  const deletePhoto = () => {
    if (window.confirm('Are you sure you want to delete your profile photo?')) {
      setProfilePhoto(null);
      localStorage.removeItem('userPhoto');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userPhoto');
    navigate('/');
  };

  if (!userData) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#f5f7fb', minHeight: '85vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1f2937', margin: 0 }}>My Profile</h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0.5rem 0 0' }}>Manage your account information & profile photo</p>
        </div>

        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* Avatar Section */}
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    border: '5px solid #fff',
                    objectFit: 'cover',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    border: '5px solid #fff',
                  }}
                >
                  👤
                </div>
              )}
            </div>

            {/* Photo Options - Always Visible */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.7rem 1.2rem',
                  background: '#fff',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📤 Upload Photo
              </button>
              <button
                onClick={showCamera ? stopCamera : startCamera}
                style={{
                  padding: '0.7rem 1.2rem',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📷 {showCamera ? 'Close Camera' : 'Take Photo'}
              </button>
            </div>

            {/* Save and Delete Options - Show when photo exists */}
            {profilePhoto && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    alert('✓ Photo saved successfully!');
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ✓ Save Photo
                </button>
                <button
                  onClick={deletePhoto}
                  style={{
                    padding: '0.6rem 1rem',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🗑️ Delete Photo
                </button>
              </div>
            )}

            {showCamera && (
              <div style={{ margin: '1.5rem 0', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                <p style={{ color: '#fff', marginTop: 0, marginBottom: '1rem', fontWeight: '500' }}>📸 Camera is Ready - Position yourself and capture!</p>
                <video
                  ref={videoRef}
                  style={{ width: '100%', maxWidth: '400px', height: 'auto', borderRadius: '8px', background: '#000', display: 'block', margin: '0 auto' }}
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} width="400" height="400" />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={capturePhoto}
                    style={{
                      padding: '0.8rem 1.5rem',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ✓ Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    style={{
                      padding: '0.8rem 1.5rem',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />

            <h2 style={{ color: '#fff', margin: '1rem 0 0.3rem' }}>{formData.name || formData.email?.split('@')[0] || 'User'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{formData.email}</p>
          </div>

          {/* Profile Info */}
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              {/* Basic Info Card */}
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#111827', marginTop: 0, marginBottom: '1rem' }}>📋 Basic Information</h3>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.95rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.95rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Name</span>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '1rem', color: '#111827', fontWeight: '600' }}>{formData.name || 'Not set'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Email</span>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '1rem', color: '#111827', fontWeight: '600' }}>{formData.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Stats Card */}
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#111827', marginTop: 0, marginBottom: '1rem' }}>📊 Account Stats</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Total Bookings</span>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: '#667eea', fontWeight: '700' }}>3</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Member Since</span>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '1rem', color: '#111827' }}>
                      {formData.registeredAt ? new Date(formData.registeredAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(userData);
                      stopCamera();
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    ✕ Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    ✎ Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    🚪 Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}