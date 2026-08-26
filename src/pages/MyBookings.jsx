import React, { useState, useEffect } from 'react';
import { carsList } from './Cars';
import { bikesList } from './Bikes';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';

export default function MyBookings() {
  const [bookedItems, setBookedItems] = useState([]);

  // =========================
  // LOAD BOOKINGS FOR CURRENT USER
  // =========================
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

  // =========================
  // CANCEL BOOKING
  // =========================
  const handleCancelBooking = (id, type) => {
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

    const listKey = type === 'bike' ? 'rentEasyBikesList' : 'rentEasyCarsList';
    const defaultList = type === 'bike' ? bikesList : carsList;

    const savedData = localStorage.getItem(listKey);
    const currentList = savedData ? JSON.parse(savedData) : defaultList;

    let vehicleName = '';

    // 1. Vehicle ko available karein aur uska naam pata karein
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

    // 2. User bookings list me status 'Cancelled' update karein
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

    // 3. Admin wali allBookings list me bhi status 'Cancelled' update karein
    let allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    allBookings = allBookings.map((b) => {
      if (b.id === id || b.vehicleName === vehicleName) {
        return { ...b, status: 'Cancelled' };
      }
      return b;
    });
    localStorage.setItem('allBookings', JSON.stringify(allBookings));

    // Page refresh ya state update trigger karein
    window.dispatchEvent(new Event('userBookingsUpdated'));
    loadBookings();
    alert('Booking cancelled successfully! Vehicle is now available for rent.');
  };

  // =========================
  // STATUS STYLE & TEXT
  // =========================
  const getStatusStyle = (status) => {
    const currentStatus = String(status || 'pending').toLowerCase();
    if (currentStatus === 'confirmed') {
      return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    }
    if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
      return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    }
    return { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
  };

  const getStatusText = (status) => {
    const currentStatus = String(status || 'pending').toLowerCase();
    if (currentStatus === 'confirmed') return '✓ Confirmed ';
    if (currentStatus === 'rejected') return '✕ Rejected ';
    if (currentStatus === 'cancelled') return '✕ Cancelled';
    return '⏳ Pending';
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
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
                  
                  {status !== 'confirmed' && status !== 'cancelled' && status !== 'rejected' && (
                    <button
                      onClick={() => handleCancelBooking(item.id, type)}
                      style={{ padding: '0.6rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '5px' }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* --- REFUND / REJECTION STATUS BOX (Jaise Flipkart Order Details mein dikhta hai) --- */}
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
    </div>
  );
}