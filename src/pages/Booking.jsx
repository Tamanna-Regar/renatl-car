import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { bikesList } from './Bikes';
import { carsList } from './Cars';

export default function Booking() {
  const { type, id } = useParams();
  const list = type === 'car' ? carsList : bikesList;
  const vehicle = list.find((v) => v.id === Number(id));

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [error, setError] = useState('');

  if (!vehicle) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Vehicle not found</h2></div>;
  }

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    setError('');
    setBookingConfirmed(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', margin: '0 0 6px 0' }}>Book Your Vehicle</h2>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
        Fill the form below to book your perfect ride
      </p>

      <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Selected Vehicle</h3>

        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 350px', maxWidth: '450px' }}>
            <img
              src={vehicle.image}
              alt={vehicle.name}
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '10px', background: '#fff' }}
            />
          </div>

          <div style={{ flex: '1 1 350px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.6rem' }}>{vehicle.name}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem 1.5rem' }}>
              {Object.entries(vehicle.specs).map(([key, value]) => (
                <div key={key} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '14px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', color: '#111827' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '2rem', marginTop: '1.5rem', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>

        {bookingConfirmed ? (
          /* SUCCESS MESSAGE */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ color: '#16a34a', margin: '0 0 8px 0' }}>Booking Confirmed!</h3>
            <p style={{ color: '#4b5563', margin: '0 0 4px 0' }}>
              {vehicle.name} booked from <strong>{startDate}</strong> to <strong>{endDate}</strong>.
            </p>
            <p style={{ color: '#4b5563', margin: '0 0 16px 0' }}>Total: <strong>{vehicle.price}</strong></p>
            <button
              onClick={() => setBookingConfirmed(false)}
              style={{ padding: '0.6rem 1.2rem', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Book Another
            </button>
          </div>
        ) : (
          /* BOOKING FORM */
          <>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#555' }}>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#555' }}>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>

            {startDate && endDate && (
              <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                Duration: <strong>
                  {Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))} day(s)
                </strong>
              </p>
            )}

            {error && (
              <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>
            )}

            <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>{vehicle.price}</p>

            <button
              style={{ width: '100%', padding: '0.9rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
              onClick={handleConfirm}
            >
              Confirm Booking & Pay
            </button>
          </>
        )}
      </div>
    </div>
  );
}