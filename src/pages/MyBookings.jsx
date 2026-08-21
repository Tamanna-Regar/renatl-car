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
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentIdentifier = (loggedInUser.email || loggedInUser.name || '').trim().toLowerCase();

    const savedCars = localStorage.getItem('rentEasyCarsList');
    const savedBikes = localStorage.getItem('rentEasyBikesList');

    const currentCars = savedCars ? JSON.parse(savedCars) : carsList;
    const currentBikes = savedBikes ? JSON.parse(savedBikes) : bikesList;

    // Filter booked cars and match with current user
    const bookedCars = currentCars
      .filter((item) => {
        if (!item.isBooked) return false;
        const bookingUser = (item.bookingDetails?.userEmail || item.bookingDetails?.userName || '').trim().toLowerCase();
        return currentIdentifier === 'admin@ridehub.com' || currentIdentifier === 'admin' || !bookingUser || bookingUser === currentIdentifier;
      })
      .map((item) => ({
        ...item,
        vehicleType: 'car',
        bookingDetails: {
          ...item.bookingDetails,
          status: item.bookingDetails?.status || 'pending',
          image: item.bookingDetails?.image || item.image || FALLBACK_IMAGE,
        },
      }));

    // Filter booked bikes and match with current user
    const bookedBikes = currentBikes
      .filter((item) => {
        if (!item.isBooked) return false;
        const bookingUser = (item.bookingDetails?.userEmail || item.bookingDetails?.userName || '').trim().toLowerCase();
        return currentIdentifier === 'admin@ridehub.com' || currentIdentifier === 'admin' || !bookingUser || bookingUser === currentIdentifier;
      })
      .map((item) => ({
        ...item,
        vehicleType: 'bike',
        bookingDetails: {
          ...item.bookingDetails,
          status: item.bookingDetails?.status || 'pending',
          image: item.bookingDetails?.image || item.image || FALLBACK_IMAGE,
        },
      }));

    setBookedItems([...bookedCars, ...bookedBikes]);
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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rentEasyCarsUpdated', handleStorageChange);
      window.removeEventListener('rentEasyBikesUpdated', handleStorageChange);
    };
  }, []);

  // =========================
  // CANCEL BOOKING
  // =========================
  const handleCancelBooking = (id, type) => {
    const listKey = type === 'bike' ? 'rentEasyBikesList' : 'rentEasyCarsList';
    const defaultList = type === 'bike' ? bikesList : carsList;

    const savedData = localStorage.getItem(listKey);
    const currentList = savedData ? JSON.parse(savedData) : defaultList;

    const updatedList = currentList.map((item) => {
      if (String(item.id) === String(id)) {
        return {
          ...item,
          isBooked: false,
          bookingDetails: null,
        };
      }
      return item;
    });

    localStorage.setItem(listKey, JSON.stringify(updatedList));
    
    // Dispatch event so other components or tabs sync up
    window.dispatchEvent(
      new Event(type === 'bike' ? 'rentEasyBikesUpdated' : 'rentEasyCarsUpdated')
    );

    loadBookings();
    alert('Booking Cancelled Successfully!');
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
    if (currentStatus === 'confirmed') return '✓ Confirmed by Admin';
    if (currentStatus === 'rejected') return '✕ Rejected by Admin';
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
          const status = booking.status || 'pending';
          const vehicleImage = booking.image || item.image || item.img || item.photo || FALLBACK_IMAGE;

          return (
            <div key={`${type}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1.2rem', marginBottom: '1.2rem', borderRadius: '12px', boxShadow: '0 3px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
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
                      Total Paid: <strong>Rs {booking.totalAmount}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Booking Status</span>
                <span style={{ padding: '6px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', ...getStatusStyle(status) }}>
                  {getStatusText(status)}
                </span>

                {status !== 'cancelled' && status !== 'rejected' && (
                  <button
                    onClick={() => handleCancelBooking(item.id, type)}
                    style={{ padding: '0.6rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '5px' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}