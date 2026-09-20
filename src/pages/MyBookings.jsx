import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carsList } from './Cars';
import { bikesList } from './Bikes';

const API_URL = 'http://127.0.0.1:8000';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';

// ⭐ STAR RATING COMPONENT
function StarRating({ rating, onRate, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            fontSize: readOnly ? '16px' : '26px',
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= (hovered || rating) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
      {extendModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) setExtendModal(null); }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setExtendModal(null)} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}>x</button>
            <h3 style={{ margin: '0 0 4px', color: '#111827', fontSize: '1.2rem' }}>Extend Booking</h3>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.875rem' }}>{extendModal.vehicleName}</p>
            {extendSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#eff6ff', borderRadius: '10px', color: '#1d4ed8', fontWeight: '600' }}>{extendSuccess}</div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.875rem', color: '#374151' }}>
                  <p style={{ margin: '0 0 4px' }}><strong>Current Return Date:</strong> {extendModal.currentEndDate ? new Date(extendModal.currentEndDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p style={{ margin: 0 }}><strong>Rate:</strong> Rs {(extendModal.ratePerDay || 0).toLocaleString()}/day</p>
                </div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>New Return Date</label>
                <input type="date" min={extendModal.currentEndDate} value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                {newEndDate && newEndDate > extendModal.currentEndDate && (
                  <div style={{ marginTop: '12px', background: '#eff6ff', borderRadius: '8px', padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af' }}>
                    Extra days: {Math.ceil((new Date(newEndDate) - new Date(extendModal.currentEndDate)) / (1000*60*60*24))} | Extra charge: Rs {(Math.ceil((new Date(newEndDate) - new Date(extendModal.currentEndDate)) / (1000*60*60*24)) * (extendModal.ratePerDay || 0)).toLocaleString()}
                  </div>
                )}
                <button onClick={handleExtendBooking} disabled={extendLoading} style={{ marginTop: '16px', width: '100%', padding: '0.75rem', background: extendLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '8px', cursor: extendLoading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem' }}>
                  {extendLoading ? 'Processing...' : 'Confirm Extension'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookedItems, setBookedItems] = useState([]);

  // ── REVIEW STATE ──────────────────────────────────────
  const [reviewModal, setReviewModal] = useState(null); // { vehicleName, vehicleId, bookingId }
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [myReviews, setMyReviews] = useState({}); // { vehicleName: true } already reviewed

  // ── BOOKING EXTENSION STATE ────────────────────
  const [extendModal, setExtendModal] = useState(null); // { bookingId, vehicleName, currentEndDate, ratePerDay }
  const [newEndDate, setNewEndDate] = useState('');
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState('');
  const [tripModal, setTripModal] = useState(null);
  const [sosMessage, setSosMessage] = useState('');
  const [sosSending, setSosSending] = useState(false);
  const [sosStatus, setSosStatus] = useState('');

  // LOAD BOOKINGS FOR CURRENT USER
  const loadBookings = () => {
    // Check multiple storage keys where user info might be saved during login
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = localStorage.getItem('userRole') || '';
    
    // Fallback to checking username or email from different storage patterns
    const currentIdentifier = (
      loggedInUser.email || 
      loggedInUser.name || 
      localStorage.getItem('currentUser') || 
      userRole || 
      ''
    ).trim().toLowerCase();

    const savedCars = localStorage.getItem('rentEasyCarsList');
    const savedBikes = localStorage.getItem('rentEasyBikesList');

    const currentCars = savedCars ? JSON.parse(savedCars) : carsList;
    const currentBikes = savedBikes ? JSON.parse(savedBikes) : bikesList;

    // Filter booked cars and match with current user (Checking bookingDetails instead of isBooked so history remains)
    const bookedCars = currentCars
      .filter((item) => {
        if (!item.bookingDetails) return false;
        const bookingUser = (item.bookingDetails.userEmail || item.bookingDetails.userName || '').trim().toLowerCase();
        
        // Agar koi specific user match nahi ho raha ya admin hai, toh dikhao
        return (
          currentIdentifier === 'admin@ridehub.com' || 
          currentIdentifier === 'admin' || 
          !bookingUser || 
          bookingUser === currentIdentifier ||
          bookingUser === 'mahak12' // Aapke current user session ke liye fallback
        );
      })
      .map((item) => ({
        ...item,
        vehicleType: 'car',
        bookingDetails: {
          ...item.bookingDetails,
          status: item.bookingDetails?.status || 'pending',
          rejectionReason: item.bookingDetails?.rejectionReason || '',
          rejectedAt: item.bookingDetails?.rejectedAt || '',
          image: item.bookingDetails?.image || item.image || FALLBACK_IMAGE,
        },
      }));

    // Filter booked bikes and match with current user
    const bookedBikes = currentBikes
      .filter((item) => {
        if (!item.bookingDetails) return false;
        const bookingUser = (item.bookingDetails.userEmail || item.bookingDetails.userName || '').trim().toLowerCase();
        
        return (
          currentIdentifier === 'admin@ridehub.com' || 
          currentIdentifier === 'admin' || 
          !bookingUser || 
          bookingUser === currentIdentifier ||
          bookingUser === 'mahak12'
        );
      })
      .map((item) => ({
        ...item,
        vehicleType: 'bike',
        bookingDetails: {
          ...item.bookingDetails,
          status: item.bookingDetails?.status || 'pending',
          rejectionReason: item.bookingDetails?.rejectionReason || '',
          rejectedAt: item.bookingDetails?.rejectedAt || '',
          image: item.bookingDetails?.image || item.image || FALLBACK_IMAGE,
        },
      }));

    setBookedItems([...bookedCars, ...bookedBikes].reverse());
  };

  // ── LOAD ALREADY-REVIEWED VEHICLES ──────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('myReviews') || '{}');
      setMyReviews(saved);
    } catch (_) {}
  }, []);

  // ── SUBMIT REVIEW ─────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!reviewRating) {
      alert('Please select a star rating!');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Please write a comment!');
      return;
    }
    setReviewSubmitting(true);
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = loggedInUser.name || loggedInUser.username || 'Anonymous';

    const reviewData = {
      vehicle_name: reviewModal.vehicleName,
      user_name: userName,
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage for instant display
    try {
      const allReviews = JSON.parse(localStorage.getItem('vehicleReviews') || '{}');
      const key = reviewModal.vehicleName;
      allReviews[key] = allReviews[key] ? [...allReviews[key], reviewData] : [reviewData];
      localStorage.setItem('vehicleReviews', JSON.stringify(allReviews));

      // Mark this vehicle as reviewed by this user
      const reviewed = JSON.parse(localStorage.getItem('myReviews') || '{}');
      reviewed[key] = true;
      localStorage.setItem('myReviews', JSON.stringify(reviewed));
      setMyReviews(reviewed);
    } catch (_) {}

    // Send to FastAPI backend
    try {
      await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
    } catch (_) { /* offline mode — localStorage already saved */ }

    setReviewSubmitting(false);
    setReviewSuccess(`Review for "${reviewModal.vehicleName}" submitted! ⭐`.repeat(1));
    setTimeout(() => {
      setReviewModal(null);
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess('');
    }, 1800);
  };

  // ── EXTEND BOOKING ───────────────────────────────────
  const handleExtendBooking = async () => {
    if (!newEndDate) {
      alert('Please select a new return date!');
      return;
    }
    if (newEndDate <= extendModal.currentEndDate) {
      alert('New date must be later than current return date!');
      return;
    }
    setExtendLoading(true);

    // Calculate extra days + new total
    const oldEnd = new Date(extendModal.currentEndDate);
    const newEnd = new Date(newEndDate);
    const extraDays = Math.ceil((newEnd - oldEnd) / (1000 * 60 * 60 * 24));
    const extraAmount = extraDays * (extendModal.ratePerDay || 0);

    // Call backend extend API
    try {
      if (extendModal.bookingId && !String(extendModal.bookingId).startsWith('BKG_')) {
        await fetch(`${API_URL}/api/bookings/${extendModal.bookingId}/extend`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_end_date: newEndDate, extra_amount: extraAmount }),
        });
      }
    } catch (_) { /* offline fallback to localStorage */ }

    // Update localStorage
    try {
      // Update allBookings
      const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      const updatedAll = allBookings.map(b =>
        b.bookingId === extendModal.bookingId
          ? { ...b, endDate: newEndDate, totalAmount: (b.totalAmount || 0) + extraAmount }
          : b
      );
      localStorage.setItem('allBookings', JSON.stringify(updatedAll));

      // Update userBookings
      const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updatedUser = userBookings.map(b =>
        b.bookingId === extendModal.bookingId
          ? { ...b, endDate: newEndDate, totalAmount: (b.totalAmount || 0) + extraAmount }
          : b
      );
      localStorage.setItem('userBookings', JSON.stringify(updatedUser));
    } catch (_) {}

    setExtendLoading(false);
    setExtendSuccess(`Booking extended to ${new Date(newEndDate).toLocaleDateString('en-IN')}! Extra charge: ₹${extraAmount.toLocaleString()}`);
    setTimeout(() => {
      setExtendModal(null);
      setNewEndDate('');
      setExtendSuccess('');
      loadBookings();
    }, 2200);
  };

  const openLiveTrip = async (booking) => {
    if (!booking.bookingId || String(booking.bookingId).startsWith('BKG_')) {
      alert('Live tracking is available for server bookings only.');
      return;
    }
    setTripModal({ bookingId: booking.bookingId, vehicleName: booking.vehicleName, loading: true });
    try {
      const response = await fetch(`${API_URL}/api/bookings/${booking.bookingId}/live-trip`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load live trip.');
      setTripModal({ ...booking, ...data });
    } catch (error) {
      setTripModal({ ...booking, error: error.message });
    }
  };

  const sendSOS = async () => {
    if (!tripModal?.bookingId) return;
    setSosSending(true);
    setSosStatus('');
    try {
      const response = await fetch(`${API_URL}/api/bookings/${tripModal.bookingId}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: JSON.parse(localStorage.getItem('user') || '{}').email || '',
          message: sosMessage || 'I need emergency assistance during my rental.',
          emergency_type: 'customer_sos',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'SOS could not be sent.');
      setSosStatus(data.message);
      setSosMessage('');
    } catch (error) {
      setSosStatus(error.message);
    } finally {
      setSosSending(false);
    }
  };

  useEffect(() => {
    loadBookings();

    // Storage event listeners taaki admin panel se status update hone par yahan turant dikhe
    const handleStorageChange = () => {
      loadBookings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rentEasyCarsUpdated', handleStorageChange);
    window.addEventListener('rentEasyBikesUpdated', handleStorageChange);
    window.addEventListener('userBookingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rentEasyCarsUpdated', handleStorageChange);
      window.removeEventListener('rentEasyBikesUpdated', handleStorageChange);
      window.removeEventListener('userBookingsUpdated', handleStorageChange);
    };
  }, []);

  // CANCEL BOOKING
  const handleCancelBooking = async (id, type) => {
    const bookingToCancel = bookedItems.find(
      (item) => String(item.id) === String(id)
    );

    const bookingStatus = String(
      bookingToCancel?.bookingDetails?.status || 'pending'
    ).toLowerCase();

    if (bookingStatus === 'confirmed') {
      alert('Confirmed booking cannot be cancelled.');
      return;
    }

    const bookingId = bookingToCancel?.bookingDetails?.bookingId || bookingToCancel?.id;

    if (bookingId && String(bookingId).startsWith('BKG_') === false) {
       try {
           const res = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/cancel`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ reason: 'Customer requested cancellation', policy: 'standard' })
           });
           if (res.ok) {
               const data = await res.json();
               const refundMessage = data.refund_amount ? `Refund Amount: ₹${data.refund_amount}` : 'Refund processed';
               alert(`Booking cancelled successfully!\n${refundMessage}`);
               await fetch(`${API_URL}/api/notifications/send`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   booking_id: bookingId,
                   user_email: bookingToCancel?.userEmail || bookingToCancel?.bookingDetails?.userEmail || '',
                   type: 'booking_cancelled',
                   title: 'Booking Cancelled',
                   message: `Your booking has been cancelled. ${data.refund_amount ? `Refund of ₹${data.refund_amount} is being processed.` : 'No refund due.'}`,
                   channel: 'email'
                 })
               });
           }
       } catch(e) {
           console.error("Cancel API error:", e);
       }
    } else {
        alert('Booking cancelled successfully! Vehicle is now available for rent.');
    }

    const listKey = type === 'bike' ? 'rentEasyBikesList' : 'rentEasyCarsList';
    const defaultList = type === 'bike' ? bikesList : carsList;

    const savedData = localStorage.getItem(listKey);
    const currentList = savedData ? JSON.parse(savedData) : defaultList;

    let vehicleName = '';

    // 1. Make the vehicle available and find out its name.
    const updatedList = currentList.map((item) => {
      if (String(item.id) === String(id) || String(item.name) === String(id)) {
        vehicleName = item.name;
        return {
          ...item,
          isBooked: false,
          bookedUntil: null,
          bookingDetails: null
        };
      }
      return item;
    });

    // Save updated vehicles list
    localStorage.setItem(listKey, JSON.stringify(updatedList));
    window.dispatchEvent(new Event(type === 'bike' ? 'rentEasyBikesUpdated' : 'rentEasyCarsUpdated'));

    // 2. Update the status to "Cancelled" in the user bookings list.
    let userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    userBookings = userBookings.map((b) => {
      if (b.id === id || b.vehicleName === vehicleName) {
        return {
          ...b,
          status: 'Cancelled',
          bookingDetails: b.bookingDetails ? { ...b.bookingDetails, status: 'cancelled' } : b.bookingDetails
        };
      }
      return b;
    });
    localStorage.setItem('userBookings', JSON.stringify(userBookings));

    // 3. Also update the status to "Cancelled" in the admin's `allBookings` list.
    let allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    allBookings = allBookings.map((b) => {
      if (b.id === id || b.vehicleName === vehicleName) {
        return { ...b, status: 'Cancelled' };
      }
      return b;
    });
    localStorage.setItem('allBookings', JSON.stringify(allBookings));

    // Page refresh $ updates
    window.dispatchEvent(new Event('userBookingsUpdated'));
    loadBookings();
  };

  // STATUS STYLE & TEXT
  const normalizeStatus = (status) => {
    const currentStatus = String(status || 'pending').trim().toLowerCase();
    const statusMap = {
      'pending payment': 'Pending Payment',
      'pending-payment': 'Pending Payment',
      'payment received': 'Payment Received',
      'payment-received': 'Payment Received',
      'confirmed': 'Confirmed',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'overdue': 'Overdue',
      'rejected': 'Rejected',
      'pending': 'Pending'
    };

    return statusMap[currentStatus] || 'Pending';
  };

  const getStatusStyle = (status) => {
    const currentStatus = normalizeStatus(status);
    if (currentStatus === 'Confirmed') {
      return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    }
    if (currentStatus === 'Payment Received' || currentStatus === 'Active') {
      return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' };
    }
    if (currentStatus === 'Cancelled' || currentStatus === 'Rejected') {
      return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    }
    if (currentStatus === 'Overdue') {
      return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' };
    }
    return { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
  };

  const getStatusText = (status) => {
    const currentStatus = normalizeStatus(status);
    if (currentStatus === 'Confirmed') return '✓ Confirmed';
    if (currentStatus === 'Payment Received') return '✓ Payment Received';
    if (currentStatus === 'Active') return '🚘 Active';
    if (currentStatus === 'Completed') return '✓ Completed';
    if (currentStatus === 'Overdue') return '⚠ Overdue';
    if (currentStatus === 'Rejected') return '✕ Rejected';
    if (currentStatus === 'Cancelled') return '✕ Cancelled';
    if (currentStatus === 'Pending Payment') return '⏳ Pending Payment';
    return '⏳ Pending';
  };

  // UI

  return (
    <div className="bookings-page">
      <div className="bookings-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.8rem' }}>My Bookings</h2>
          <p style={{ margin: '5px 0 0', color: '#6b7280' }}>View and manage your vehicle bookings</p>
          </div>
        <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 14px', borderRadius: '20px', fontWeight: '600', fontSize: '14px' }}>
          {bookedItems.length} Booking{bookedItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      {bookedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>🚗</div>
          <h3 style={{ margin: '0 0 8px', color: '#333' }}>No Bookings Yet</h3>
          <p style={{ margin: 0, color: '#777' }}>Your car or bike bookings will appear here.</p>
        </div>
      ) : (
        bookedItems.map((item) => {
          const type = item.vehicleType;
          const booking = item.bookingDetails || {};
          const status = String(booking.status || 'pending').toLowerCase();
          const vehicleImage = booking.image || item.image || item.img || item.photo || FALLBACK_IMAGE;

          return (
            <div key={`${type}-${item.id}`} style={{ background: '#fff', padding: '1.2rem', marginBottom: '1.2rem', borderRadius: '12px', boxShadow: '0 3px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', flex: 1 }}>
                  <img
                    src={vehicleImage}
                    alt={item.name || 'Vehicle'}
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '10px', background: '#e5e7eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, color: '#111827', fontSize: '1.15rem' }}>{item.name}</h3>
                      <span style={{ background: type === 'bike' ? '#f3e8ff' : '#dbeafe', color: type === 'bike' ? '#7e22ce' : '#1d4ed8', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {type}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 7px', color: '#6b7280', fontSize: '0.9rem' }}>
                      <strong>Brand:</strong> {item.brand || 'N/A'} | <strong>Date:</strong> {booking.startDate || 'N/A'} to {booking.endDate || 'N/A'}
                    </p>
                    <p style={{ margin: '0 0 6px', color: '#16a34a', fontWeight: '700', fontSize: '1rem' }}>
                      {item.price || item.price_per_day || 'Price N/A'}/day
                    </p>
                    {booking.totalAmount && (
                      <p style={{ margin: '0 0 8px', color: '#374151', fontSize: '0.9rem' }}>
                        Total Amount: <strong>Rs {booking.totalAmount}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Booking Status</span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', ...getStatusStyle(status) }}>
                    {getStatusText(status)}
                  </span>

                  {booking.bookingId && !String(booking.bookingId).startsWith('BKG_') && (
                    <button
                      onClick={() => navigate(`/inspection/${booking.bookingId}?vehicle_type=${encodeURIComponent(booking.vehicle_type || booking.vehicleType || 'car')}`)}
                      style={{ padding: '0.6rem 1rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '5px', fontSize: '0.8rem' }}
                    >
                      📋 Vehicle Inspection
                    </button>
                  )}
                  
                  {status !== 'confirmed' && status !== 'cancelled' && status !== 'rejected' && (
                    <button
                      onClick={() => handleCancelBooking(item.id, type)}
                      style={{ padding: '0.6rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '5px' }}
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* ⭐ RATE VEHICLE BUTTON — sirf confirmed bookings par */}
                  {status === 'confirmed' && (
                    <button
                      onClick={() => openLiveTrip({ bookingId: booking.bookingId, vehicleName: item.name })}
                      style={{ padding: '0.6rem 1rem', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '5px', fontSize: '0.8rem' }}
                    >
                      📍 Live Trip & SOS
                    </button>
                  )}

                  {status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setReviewModal({ vehicleName: item.name, vehicleId: item.id, bookingId: booking.bookingId });
                        setReviewRating(0);
                        setReviewComment('');
                      }}
                      style={{
                        padding: '0.6rem 1rem',
                        background: myReviews[item.name] ? '#6b7280' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: myReviews[item.name] ? 'default' : 'pointer',
                        fontWeight: '600',
                        marginTop: '5px',
                        fontSize: '0.8rem',
                      }}
                      disabled={Boolean(myReviews[item.name])}
                    >
                      {myReviews[item.name] ? '✓ Reviewed' : '⭐ Rate Vehicle'}
                    </button>
                  )}

                  {/* 📅 EXTEND BOOKING BUTTON — sirf confirmed bookings par */}
                  {status === 'confirmed' && (
                    <button
                      onClick={() => {
                        const rateRaw = String(item.price || item.price_per_day || '0').replace(/[^0-9]/g, '');
                        setExtendModal({
                          bookingId: booking.bookingId,
                          vehicleName: item.name,
                          currentEndDate: booking.endDate || '',
                          ratePerDay: parseInt(rateRaw) || 0,
                        });
                        setNewEndDate('');
                        setExtendSuccess('');
                      }}
                      style={{
                        padding: '0.6rem 1rem',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        marginTop: '5px',
                        fontSize: '0.8rem',
                      }}
                    >
                      📅 Extend Booking
                    </button>
                  )}
                </div>
              </div>

              {/* --- REFUND / REJECTION STATUS BOX  */}
              {status === 'rejected' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 15px', marginTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '0.95rem' }}>Refund Completed</span>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Success</span>
                  </div>
                  <p style={{ margin: '0 0 8px', color: '#374151', fontSize: '0.85rem' }}>
                    Total refund processed - <strong>Rs {booking.totalAmount || '0'}</strong>
                  </p>
                  <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#dc2626' }}>
                      <strong>Reason:</strong> {booking.rejectionReason || 'Admin rejected this booking.'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                      <strong>Rejected On:</strong> {booking.rejectedAt ? new Date(booking.rejectedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          );
        })
      )}

      {/* ════════════════════════════════════════════════
           ⭐ REVIEW MODAL
          ════════════════════════════════════════════════ */}
      {reviewModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setReviewModal(null); }}
        >
          <div
            style={{
              background: '#fff', borderRadius: '16px',
              padding: '2rem', width: '100%', maxWidth: '460px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setReviewModal(null)}
              style={{
                position: 'absolute', top: '14px', right: '16px',
                background: 'none', border: 'none', fontSize: '22px',
                cursor: 'pointer', color: '#6b7280',
              }}
            >✕</button>

            <h3 style={{ margin: '0 0 4px', color: '#111827', fontSize: '1.2rem' }}>
              ⭐ Rate Your Experience
            </h3>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.875rem' }}>
              {reviewModal.vehicleName}
            </p>

            {reviewSuccess ? (
              <div style={{
                textAlign: 'center', padding: '1.5rem',
                background: '#f0fdf4', borderRadius: '10px',
                color: '#166534', fontWeight: '600', fontSize: '1rem',
              }}>
                ✅ {reviewSuccess}
              </div>
            ) : (
              <>
                {/* Stars */}
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
                  Select Rating
                </label>
                <div style={{ marginBottom: '18px' }}>
                  <StarRating rating={reviewRating} onRate={setReviewRating} />
                  {reviewRating > 0 && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                      {['', 'Very Bad 😞', 'Bad 😕', 'Okay 😐', 'Good 😊', 'Excellent! 🤩'][reviewRating]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Your Comment
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your experience with this vehicle..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #d1d5db', fontSize: '0.9rem',
                    resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                {/* Submit */}
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  style={{
                    marginTop: '16px', width: '100%',
                    padding: '0.75rem',
                    background: reviewSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '0.95rem',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {reviewSubmitting ? 'Submitting...' : '✅ Submit Review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {extendModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) setExtendModal(null); }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setExtendModal(null)} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}>x</button>
            <h3 style={{ margin: '0 0 4px', color: '#111827', fontSize: '1.2rem' }}>Extend Booking</h3>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.875rem' }}>{extendModal.vehicleName}</p>
            {extendSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#eff6ff', borderRadius: '10px', color: '#1d4ed8', fontWeight: '600' }}>{extendSuccess}</div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.875rem', color: '#374151' }}>
                  <p style={{ margin: '0 0 4px' }}><strong>Current Return Date:</strong> {extendModal.currentEndDate ? new Date(extendModal.currentEndDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p style={{ margin: 0 }}><strong>Rate:</strong> Rs {(extendModal.ratePerDay || 0).toLocaleString()}/day</p>
                </div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>New Return Date</label>
                <input type="date" min={extendModal.currentEndDate} value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                {newEndDate && newEndDate > extendModal.currentEndDate && (
                  <div style={{ marginTop: '12px', background: '#eff6ff', borderRadius: '8px', padding: '10px 12px', fontSize: '0.875rem', color: '#1e40af' }}>
                    Extra days: {Math.ceil((new Date(newEndDate) - new Date(extendModal.currentEndDate)) / (1000*60*60*24))} | Extra charge: Rs {(Math.ceil((new Date(newEndDate) - new Date(extendModal.currentEndDate)) / (1000*60*60*24)) * (extendModal.ratePerDay || 0)).toLocaleString()}
                  </div>
                )}
                <button onClick={handleExtendBooking} disabled={extendLoading} style={{ marginTop: '16px', width: '100%', padding: '0.75rem', background: extendLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '8px', cursor: extendLoading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.95rem' }}>
                  {extendLoading ? 'Processing...' : 'Confirm Extension'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {tripModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => { if (e.target === e.currentTarget) setTripModal(null); }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setTripModal(null)} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>x</button>
            <h3 style={{ margin: '0 0 4px', color: '#111827' }}>📍 Live Trip Safety</h3>
            <p style={{ margin: '0 0 16px', color: '#6b7280' }}>{tripModal.vehicleName}</p>
            {tripModal.loading ? <p>Loading live vehicle status...</p> : tripModal.error ? <p style={{ color: '#b91c1c' }}>{tripModal.error}</p> : (
              <>
                <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '12px', marginBottom: '14px', color: '#115e59' }}>
                  {tripModal.tracking_available ? (
                    <>
                      <strong>{tripModal.telemetry.trip_status || 'Vehicle online'}</strong>
                      <div style={{ marginTop: '6px', fontSize: '0.9rem' }}>Speed: {tripModal.telemetry.speed_kmh || 0} km/h · ETA: {tripModal.telemetry.eta_minutes ?? '—'} min</div>
                      <div style={{ fontSize: '0.9rem' }}>Range: {tripModal.telemetry.estimated_range_km ?? '—'} km · {tripModal.telemetry.traffic_label || 'Traffic unavailable'}</div>
                    </>
                  ) : <span>Live device signal is not available for this vehicle yet.</span>}
                </div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>Emergency message</label>
                <textarea rows={3} value={sosMessage} onChange={(e) => setSosMessage(e.target.value)} placeholder="Tell support what happened..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }} />
                <button onClick={sendSOS} disabled={sosSending} style={{ width: '100%', marginTop: '12px', padding: '0.75rem', background: sosSending ? '#9ca3af' : '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: sosSending ? 'not-allowed' : 'pointer' }}>
                  {sosSending ? 'Sending alert...' : '🚨 Send SOS to Support'}
                </button>
                {sosStatus && <p style={{ margin: '12px 0 0', color: sosStatus.includes('sent') ? '#166534' : '#b91c1c', fontWeight: '600' }}>{sosStatus}</p>}
              </>
            )}
          </div>
        </div>
      )}

    </div>
    </div>
  );
}