import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DamageReport() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const booking = JSON.parse(localStorage.getItem('allBookings') || '[]').find(
        (item) => String(item.bookingId || item._id) === String(bookingId)
      ) || JSON.parse(localStorage.getItem('userBookings') || '[]').find(
        (item) => String(item.bookingId || item._id) === String(bookingId)
      ) || {};

      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/damage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          vehicle_name: booking.vehicleName || booking.vehicle_name || 'Vehicle',
          user_email: user.email || booking.userEmail || 'guest@gmail.com',
          report_type: 'post_ride',
          description,
          damage_spots: [],
          photo_url: photoUrl || null,
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => navigate('/my-bookings'), 2000);
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.detail || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting damage report:', error);
      alert('Error connecting to server.');
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center', background: '#1e293b', padding: '40px', borderRadius: '12px' }}>
          <h2 style={{ color: '#22c55e', marginBottom: '10px' }}>Report Submitted Successfully!</h2>
          <p style={{ color: '#94a3b8' }}>Our team will review your report.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px', color: '#fff', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '20px' }}>⚠️ Report Vehicle Damage</h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '25px' }}>
          Please describe any damage you noticed on the vehicle for booking <b>#{bookingId}</b>. You can upload an image URL for reference.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>Description of Damage</label>
            <textarea 
              rows="4" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Scrape on the left bumper..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>Photo URL (Optional)</label>
            <input 
              type="url" 
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/damage.jpg"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/my-bookings')}
              style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
