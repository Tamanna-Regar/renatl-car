import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Bike,
  CalendarCheck,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Placeholder stats
  // Baad mein GET /api/bookings/ se real data laga sakte ho
  const myBookings = 5;
  const completed = 4;
  const pending = 1;
  const cancelled = 0;

  const completionRate =
    myBookings > 0
      ? ((completed / myBookings) * 100).toFixed(0)
      : 0;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sidebarItem = (
    icon,
    label,
    active = false,
    onClick
  ) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '8px',
        color: active ? '#fff' : '#94a3b8',
        background: active ? '#3b82f6' : 'transparent',
        fontWeight: active ? '600' : '500',
        fontSize: '0.9rem',
        cursor: 'pointer',
        marginBottom: '4px',
      }}
    >
      {icon}
      {label}
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          background: '#111827',
          padding: '1.5rem 1rem',
          borderRight: '1px solid #1e293b',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '2rem',
            padding: '0 6px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Car size={20} color="#fff" />
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.85rem',
              }}
            >
              RIDEHUB
            </p>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '0.7rem',
              }}
            >
              My Account
            </p>
          </div>
        </div>

        {/* Sidebar Items */}
        {sidebarItem(
          <LayoutDashboard size={18} />,
          'My Dashboard',
          true
        )}

        {sidebarItem(
          <CalendarCheck size={18} />,
          'My Bookings',
          false,
          () => navigate('/my-bookings')
        )}

        {sidebarItem(
          <Car size={18} />,
          'Browse Cars',
          false,
          () => navigate('/cars')
        )}

        {sidebarItem(
          <Bike size={18} />,
          'Browse Bikes',
          false,
          () => navigate('/bikes')
        )}

        {sidebarItem(
          <Settings size={18} />,
          'Settings'
        )}

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            color: '#f87171',
            fontWeight: '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginTop: '2rem',
          }}
        >
          <LogOut size={18} />
          Logout
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1
            style={{
              color: '#fff',
              margin: 0,
              fontSize: '1.5rem',
            }}
          >
            My Dashboard
          </h1>

          {/* User Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.8rem',
              }}
            >
              {(user.name || 'U')
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                {user.name || 'User'}
              </p>

              <p
                style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '0.75rem',
                }}
              >
                {user.email || 'Customer'}
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.2rem',
            marginBottom: '2rem',
          }}
        >
          {[
            {
              label: 'My Bookings',
              value: myBookings,
              sub: 'All Time',
              color: '#3b82f6',
            },
            {
              label: 'Completed',
              value: completed,
              sub: `${completionRate}%`,
              color: '#22c55e',
            },
            {
              label: 'Pending',
              value: pending,
              sub: 'Upcoming',
              color: '#f59e0b',
            },
            {
              label: 'Cancelled',
              value: cancelled,
              sub: '0%',
              color: '#ef4444',
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.2rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                }}
              >
                {card.label}
              </p>

              <p
                style={{
                  margin: '8px 0 4px 0',
                  color: '#fff',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                }}
              >
                {card.value}
              </p>

              <p
                style={{
                  margin: 0,
                  color: card.color,
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h3
            style={{
              color: '#fff',
              margin: '0 0 0.5rem 0',
            }}
          >
            Quick Links
          </h3>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              margin: 0,
            }}
          >
            Head over to{' '}
            <strong style={{ color: '#93c5fd' }}>
              My Bookings
            </strong>{' '}
            to see the full history, or browse{' '}
            <strong style={{ color: '#93c5fd' }}>
              Cars
            </strong>{' '}
            /{' '}
            <strong style={{ color: '#93c5fd' }}>
              Bikes
            </strong>{' '}
            to book something new.
          </p>
        </div>
      </div>
    </div>
  );
}