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
                alignItems: 'center',
                background: '#fff',
                borderRadius: '16px',
                padding: '1.5rem 2rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                border: '1px solid #e5e7eb',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {booking.type}
                </div>
                <h3 style={{ margin: '0.35rem 0', fontSize: '1.5rem', color: '#111827' }}>{booking.vehicle}</h3>
                <div style={{ color: '#4b5563', fontSize: '0.98rem' }}>
                  Date: <strong>{booking.date}</strong> • Duration: <strong>{booking.days}</strong>
                </div>
              </div>

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