export default function MyBookings() {
  const bookings = [
    {
      id: 1,
      vehicle: 'BMW M5',
      type: 'Car',
      date: '2026-08-20',
      days: '3 days',
      status: 'Confirmed',
      amount: 'Rs6,00,000,00',
      color: '#22c55e',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
      specs: {
        model: 'M5 Competition',
        engine: '4.4L V8 Twin-Turbo',
        transmission: '8-Speed Automatic',
        fuelType: 'Petrol',
        seats: '5',
        mileage: '8-10 km/l',
      },
    },
    {
      id: 2,
      vehicle: 'Mountain Bike',
      type: 'Bike',
      date: '2026-08-24',
      days: '2 days',
      status: 'Pending',
      amount: 'Rs8,00,000,00',
      color: '#f59e0b',
      image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
      specs: {
        model: 'MTB Pro 21',
        frame: '17" Aluminum',
        weight: '13.5 kg',
        gears: '21 Speed',
        wheelSize: '29"',
        suspension: 'Front',
      },
    },
    {
      id: 3,
      vehicle: 'Mercedes-Benz E-Class',
      type: 'Car',
      date: '2026-08-28',
      days: '5 days',
      status: 'Completed',
      amount: 'Rs17,50,000,00',
      color: '#3b82f6',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400',
      specs: {
        model: 'E-Class E220d',
        engine: '2.0L Diesel',
        transmission: '9-Speed Automatic',
        fuelType: 'Diesel',
        seats: '5',
        mileage: '17-19 km/l',
      },
    },
  ];

  return (
    <div style={{ padding: '3rem 2rem', background: '#f5f7fb', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#1f2937' }}>My Bookings History</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '1.1rem' }}>
            Track your recent reservations and rental status.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: '#fff',
                borderRadius: '16px',
                padding: '1.5rem 2rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                border: '1px solid #e5e7eb',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              {/* Left: Photo + Info */}
              <div style={{ display: 'flex', gap: '1.2rem', flex: '1 1 320px' }}>
                <img
                  src={booking.image}
                  alt={booking.vehicle}
                  style={{
                    width: '140px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {booking.type}
                  </div>
                  <h3 style={{ margin: '0.35rem 0', fontSize: '1.4rem', color: '#111827' }}>{booking.vehicle}</h3>
                  <div style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    Date: <strong>{booking.date}</strong> • Duration: <strong>{booking.days}</strong>
                  </div>

                  {/* Specifications */}
                  <div
                    style={{
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '0.6rem 0.8rem',
                      fontSize: '0.82rem',
                      color: '#374151',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '2px 12px',
                    }}
                  >
                    {booking.specs.model && (
                      <div><strong>Model:</strong> {booking.specs.model}</div>
                    )}
                    {booking.specs.engine && (
                      <div><strong>Engine:</strong> {booking.specs.engine}</div>
                    )}
                    {booking.specs.transmission && (
                      <div><strong>Transmission:</strong> {booking.specs.transmission}</div>
                    )}
                    {booking.specs.fuelType && (
                      <div><strong>Fuel Type:</strong> {booking.specs.fuelType}</div>
                    )}
                    {booking.specs.seats && (
                      <div><strong>Seats:</strong> {booking.specs.seats}</div>
                    )}
                    {booking.specs.mileage && (
                      <div><strong>Mileage:</strong> {booking.specs.mileage}</div>
                    )}
                    {booking.specs.frame && (
                      <div><strong>Frame:</strong> {booking.specs.frame}</div>
                    )}
                    {booking.specs.weight && (
                      <div><strong>Weight:</strong> {booking.specs.weight}</div>
                    )}
                    {booking.specs.gears && (
                      <div><strong>Gears:</strong> {booking.specs.gears}</div>
                    )}
                    {booking.specs.wheelSize && (
                      <div><strong>Wheel Size:</strong> {booking.specs.wheelSize}</div>
                    )}
                    {booking.specs.suspension && (
                      <div><strong>Suspension:</strong> {booking.specs.suspension}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Status + Amount */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: `${booking.color}20`,
                    color: booking.color,
                    border: `1px solid ${booking.color}40`,
                    borderRadius: '999px',
                    padding: '0.55rem 1rem',
                    fontWeight: '700',
                    minWidth: '110px',
                    textAlign: 'center',
                  }}
                >
                  {booking.status}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total</div>
                  <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#111827' }}>{booking.amount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}