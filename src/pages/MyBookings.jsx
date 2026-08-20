import React, { useState, useEffect } from 'react';
import { carsList } from './Cars';
import { bikesList } from './Bikes';

export default function MyBookings() {
  const [bookedItems, setBookedItems] = useState([]);

  const loadBookings = () => {
    // Cars aur Bikes ka data localStorage ya default list se nikalna
    const savedCars = localStorage.getItem('rentEasyCarsList');
    const savedBikes = localStorage.getItem('rentEasyBikesList');

    const currentCars = savedCars ? JSON.parse(savedCars) : carsList;
    const currentBikes = savedBikes ? JSON.parse(savedBikes) : bikesList;

    // Jin items ki booking ho chuki hai unhe filter karna
    const bookedCars = currentCars.filter(item => item.isBooked);
    const bookedBikes = currentBikes.filter(item => item.isBooked);

    setBookedItems([...bookedCars, ...bookedBikes]);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = (id, type) => {
    let listKey = type === 'bike' ? 'rentEasyBikesList' : 'rentEasyCarsList';
    let defaultList = type === 'bike' ? bikesList : carsList;

    const savedData = localStorage.getItem(listKey);
    const currentList = savedData ? JSON.parse(savedData) : defaultList;

    const updatedList = currentList.map((item) => {
      if (String(item.id) === String(id)) {
        return { ...item, isBooked: false, bookingDetails: null };
      }
      return item;
    });

    localStorage.setItem(listKey, JSON.stringify(updatedList));
    loadBookings(); // List ko turant refresh karne ke liye
    alert('Booking Cancelled Successfully!');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>My Bookings History</h2>

      {bookedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>No active bookings found.</p>
        </div>
      ) : (
        bookedItems.map((item) => {
          // Check karo ki item car hai ya bike (aapki list ke hisaab se type determine karne ke liye)
          const isBike = bikesList.some(b => String(b.id) === String(item.id));
          const itemType = isBike ? 'bike' : 'car';

          return (
            <div 
              key={item.id} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{item.name}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>
                    Brand: {item.brand || 'N/A'} | Date: {item.bookingDetails ? `${item.bookingDetails.startDate} to ${item.bookingDetails.endDate}` : 'N/A'}
                  </p>
                  <p style={{ margin: 0, color: '#28a745', fontWeight: 'bold' }}>{item.price}</p>
                  {item.bookingDetails && item.bookingDetails.totalAmount && (
                    <p style={{ margin: '3px 0 0 0', color: '#333', fontSize: '0.9rem' }}>
                      Total Paid: <strong>Rs {item.bookingDetails.totalAmount}</strong>
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleCancelBooking(item.id, itemType)}
                style={{ padding: '0.6rem 1.2rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel Booking
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}