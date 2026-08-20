import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carsList } from './Cars';
import { bikesList } from './Bikes';

export default function Booking() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // 1. Sidhe import ki gayi list ko default maanein
    const defaultList = type === 'car' ? carsList : bikesList;
    const listKey = type === 'car' ? 'rentEasyCarsList' : 'rentEasyBikesList';

    // 2. LocalStorage se sirf booked status sync karein
    const savedData = localStorage.getItem(listKey);
    let currentList = defaultList;

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          currentList = defaultList.map(item => {
            const bookedItem = parsed.find(p => String(p.id) === String(item.id));
            return bookedItem ? { 
              ...item, 
              isBooked: bookedItem.isBooked, 
              bookingDetails: bookedItem.bookingDetails 
            } : item;
          });
        }
      } catch (e) {
        console.error("Error parsing localStorage", e);
      }
    }

    // 3. Exact ID match karein
    const found = currentList.find((i) => String(i.id) === String(id));
    setItem(found || null);
  }, [type, id]);

  // Total Amount Calculation
  useEffect(() => {
    if (startDate && endDate && item) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        const priceNumber = parseInt(String(item.price).replace(/[^0-9]/g, '')) || 0;
        setTotalAmount(diffDays * priceNumber);
      } else {
        setTotalAmount(0);
      }
    }
  }, [startDate, endDate, item]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert('Please select both Start Date and End Date!');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('End Date cannot be earlier than Start Date!');
      return;
    }

    // Node.js Backend ko data bhejne ke liye API request
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          itemType: type, // 'car' ya 'bike'
          startDate: startDate,
          endDate: endDate,
          totalAmount: totalAmount,
        }),
      });

      if (!response.ok) {
        console.warn('Backend server connected nahi hai ya error diya, par local booking save ki ja rahi hai.');
      }
    } catch (error) {
      console.error('Node.js backend connection error:', error);
    }

    // Local state/storage update (Frontend ko chalane ke liye)
    const listKey = type === 'car' ? 'rentEasyCarsList' : 'rentEasyBikesList';
    const defaultList = type === 'car' ? carsList : bikesList;

    const savedData = localStorage.getItem(listKey);
    const currentParsed = savedData ? JSON.parse(savedData) : [];

    const updatedList = defaultList.map((i) => {
      const existing = currentParsed.find(p => String(p.id) === String(i.id));
      if (String(i.id) === String(id)) {
        return { 
          ...i, 
          isBooked: true,
          bookingDetails: { startDate, endDate, totalAmount } 
        };
      }
      return existing ? existing : { ...i, isBooked: false };
    });

    localStorage.setItem(listKey, JSON.stringify(updatedList));
    alert(`Booking Confirmed Successfully! Total: Rs ${totalAmount}`);
    
    navigate('/my-bookings');
  };

  if (!item) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>
        <h2>Item not found!</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Complete Your Booking</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img 
          src={item.image} 
          alt={item.name} 
          style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '6px' }} 
        />
        <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.5rem', color: '#333' }}>{item.name}</h3>
        <p style={{ color: '#28a745', fontSize: '1.2rem', fontWeight: 'bold' }}>{item.price}</p>
        
        {item.specs && (
          <p style={{ color: '#666', fontSize: '0.95rem', margin: '5px 0' }}>
            Model: {item.specs.model} | Fuel: {item.specs.fuel} | Transmission: {item.specs.transmission}
          </p>
        )}
      </div>

      {item.isBooked ? (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>
          This item is already booked and cannot be rented.
        </div>
      ) : (
        <form onSubmit={handleConfirmBooking}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Start Date:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>End Date:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          {totalAmount > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '10px', background: '#e9ecef', borderRadius: '4px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
              Total Amount: <span style={{ color: '#28a745' }}>Rs {totalAmount}</span>
            </div>
          )}

          <button 
            type="submit"
            style={{ width: '100%', padding: '0.8rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Confirm & Rent Now
          </button>
        </form>
      )}
    </div>
  );
}