import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  // =========================
  // LOAD PROFILE + BOOKINGS
  // =========================
  const loadProfile = () => {
    const storedUser = readJSON('user', {});

    setUser(storedUser);

    setFormData({
      name: storedUser?.name || storedUser?.fullName || '',
      email: storedUser?.email || '',
      phone: storedUser?.phone || '',
      address: storedUser?.address || '',
    });

    const allBookings = readJSON('allBookings', []);
    const userBookings = readJSON('userBookings', []);

    const currentIdentifier = String(
      storedUser?.email ||
        storedUser?.name ||
        localStorage.getItem('currentUser') ||
        ''
    )
      .trim()
      .toLowerCase();

    const combinedBookings = [...userBookings, ...allBookings];

    // Remove duplicate bookings
    const uniqueBookings = combinedBookings.filter(
      (booking, index, array) => {
        const bookingKey = booking?.id
          ? `id-${booking.id}`
          : `${booking?.vehicleName || 'vehicle'}-${booking?.startDate || ''}-${booking?.endDate || ''}-${booking?.userEmail || ''}`;

        return (
          array.findIndex((item) => {
            const itemKey = item?.id
              ? `id-${item.id}`
              : `${item?.vehicleName || 'vehicle'}-${item?.startDate || ''}-${item?.endDate || ''}-${item?.userEmail || ''}`;

            return itemKey === bookingKey;
          }) === index
        );
      }
    );

    const filteredBookings = uniqueBookings.filter((booking) => {
      if (!currentIdentifier) return true;

      const bookingUser = String(
        booking?.userEmail ||
          booking?.email ||
          booking?.userName ||
          ''
      )
        .trim()
        .toLowerCase();

      return !bookingUser || bookingUser === currentIdentifier;
    });

    setBookings(filteredBookings);
  };

  useEffect(() => {
    loadProfile();

    const refreshProfile = () => {
      loadProfile();
    };

    window.addEventListener('storage', refreshProfile);
    window.addEventListener('userBookingsUpdated', refreshProfile);
    window.addEventListener('rentEasyCarsUpdated', refreshProfile);
    window.addEventListener('rentEasyBikesUpdated', refreshProfile);
    window.addEventListener('profileUpdated', refreshProfile);

    return () => {
      window.removeEventListener('storage', refreshProfile);
      window.removeEventListener('userBookingsUpdated', refreshProfile);
      window.removeEventListener('rentEasyCarsUpdated', refreshProfile);
      window.removeEventListener('rentEasyBikesUpdated', refreshProfile);
      window.removeEventListener('profileUpdated', refreshProfile);
    };
  }, []);

  // =========================
  // BOOKING STATS
  // =========================
  const bookingStats = useMemo(() => {
    const total = bookings.length;

    const confirmed = bookings.filter(
      (booking) =>
        String(
          booking?.status ||
            booking?.bookingDetails?.status ||
            ''
        ).toLowerCase() === 'confirmed'
    ).length;

    const pending = bookings.filter(
      (booking) =>
        String(
          booking?.status ||
            booking?.bookingDetails?.status ||
            ''
        ).toLowerCase() === 'pending'
    ).length;

    const cancelled = bookings.filter((booking) =>
      ['cancelled', 'rejected'].includes(
        String(
          booking?.status ||
            booking?.bookingDetails?.status ||
            ''
        ).toLowerCase()
      )
    ).length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
    };
  }, [bookings]);

  // =========================
  // PROFILE INITIALS
  // =========================
  const initials = useMemo(() => {
    const name = formData.name || 'Ride Easy User';

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [formData.name]);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage('');
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSaveProfile = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      name: formData.name.trim(),
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setMessage('Profile updated successfully.');

    window.dispatchEvent(
      new Event('profileUpdated')
    );
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');

    navigate('/login');
  };

  // =========================
  // BOOKING HELPERS
  // =========================
  const getBookingStatus = (booking) =>
    String(
      booking?.status ||
        booking?.bookingDetails?.status ||
        'Pending'
    );

  const getVehicleType = (booking) => {
    const type = String(
      booking?.vehicleType ||
        booking?.type ||
        booking?.bookingDetails?.vehicleType ||
        ''
    ).toLowerCase();

    return type === 'bike' ? 'Bike' : 'Car';
  };

  const getBookingImage = (booking) =>
    booking?.bookingDetails?.image ||
    booking?.image ||
    booking?.img ||
    booking?.photo ||
    FALLBACK_IMAGE;

  const getStatusStyle = (status) => {
    const currentStatus = String(
      status || 'Pending'
    ).toLowerCase();

    if (currentStatus === 'confirmed') {
      return {
        background: '#dcfce7',
        color: '#166534',
      };
    }

    if (
      currentStatus === 'cancelled' ||
      currentStatus === 'rejected'
    ) {
      return {
        background: '#fee2e2',
        color: '#991b1b',
      };
    }

    return {
      background: '#fef3c7',
      color: '#92400e',
    };
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f7fb',
        padding: '30px 20px',
        fontFamily: 'Arial, sans-serif',
        color: '#111827',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* =========================
            HEADER
        ========================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '25px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: '800',
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                margin: '6px 0 0',
                color: '#6b7280',
              }}
            >
              Manage your Ride Easy account
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <Link
              to="/my-bookings"
              style={{
                textDecoration: 'none',
                background: '#2563eb',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '700',
              }}
            >
              My Bookings
            </Link>
          </div>
        </div>

        {/* =========================
            MAIN GRID
        ========================== */}
        <div
          className="profile-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '290px 1fr',
            gap: '22px',
          }}
        >
          {/* =========================
              PROFILE CARD
          ========================== */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '25px',
              boxShadow:
                '0 4px 18px rgba(0,0,0,0.08)',
              height: 'fit-content',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '95px',
                height: '95px',
                borderRadius: '50%',
                margin: '0 auto 15px',
                background:
                  'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: '800',
              }}
            >
              {initials}
            </div>

            <h2
              style={{
                margin: '0 0 5px',
                fontSize: '1.35rem',
              }}
            >
              {formData.name || 'Ride Easy User'}
            </h2>

            <p
              style={{
                margin: 0,
                color: '#6b7280',
                wordBreak: 'break-word',
              }}
            >
              {formData.email || 'No email available'}
            </p>

            {/* BOOKING STATS */}
            <div
              style={{
                marginTop: '22px',
                display: 'grid',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: '#eff6ff',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                >
                  Total Bookings
                </div>

                <strong
                  style={{
                    display: 'block',
                    color: '#2563eb',
                    fontSize: '24px',
                    marginTop: '3px',
                  }}
                >
                  {bookingStats.total}
                </strong>
              </div>

              <div
                style={{
                  background: '#ecfdf5',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                >
                  Confirmed
                </div>

                <strong
                  style={{
                    display: 'block',
                    color: '#15803d',
                    fontSize: '24px',
                    marginTop: '3px',
                  }}
                >
                  {bookingStats.confirmed}
                </strong>
              </div>

              <div
                style={{
                  background: '#fff7ed',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                >
                  Pending
                </div>

                <strong
                  style={{
                    display: 'block',
                    color: '#c2410c',
                    fontSize: '24px',
                    marginTop: '3px',
                  }}
                >
                  {bookingStats.pending}
                </strong>
              </div>

              <div
                style={{
                  background: '#fef2f2',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                >
                  Cancelled / Rejected
                </div>

                <strong
                  style={{
                    display: 'block',
                    color: '#dc2626',
                    fontSize: '24px',
                    marginTop: '3px',
                  }}
                >
                  {bookingStats.cancelled}
                </strong>
              </div>
            </div>
          </div>

          {/* =========================
              RIGHT SIDE
          ========================== */}
          <div
            style={{
              display: 'grid',
              gap: '22px',
            }}
          >
            {/* PERSONAL INFORMATION */}
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '25px',
                boxShadow:
                  '0 4px 18px rgba(0,0,0,0.08)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 20px',
                  fontSize: '1.3rem',
                }}
              >
                Personal Information
              </h2>

              <form onSubmit={handleSaveProfile}>
                <div
                  className="profile-form-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '7px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                      }}
                    >
                      Full Name
                    </label>

                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 12px',
                        border:
                          '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '7px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                      }}
                    >
                      Email
                    </label>

                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 12px',
                        border:
                          '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '7px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                      }}
                    >
                      Phone Number
                    </label>

                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 12px',
                        border:
                          '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '7px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                      }}
                    >
                      Address
                    </label>

                    <input
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 12px',
                        border:
                          '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '18px',
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  {message && (
                    <span
                      style={{
                        color: '#15803d',
                        fontWeight: '700',
                      }}
                    >
                      {message}
                    </span>
                  )}

                  <button
                    type="submit"
                    style={{
                      marginLeft: 'auto',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '11px 20px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>

            {/* RECENT BOOKINGS */}
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '25px',
                boxShadow:
                  '0 4px 18px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.3rem',
                  }}
                >
                  Recent Bookings
                </h2>

                <Link
                  to="/my-bookings"
                  style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                  }}
                >
                  View All
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '35px',
                    color: '#6b7280',
                  }}
                >
                  <div
                    style={{
                      fontSize: '40px',
                      marginBottom: '10px',
                    }}
                  >
                    🚗🏍️
                  </div>

                  <strong
                    style={{
                      color: '#374151',
                    }}
                  >
                    No bookings found
                  </strong>

                  <p
                    style={{
                      marginTop: '7px',
                    }}
                  >
                    Your car or bike bookings
                    will appear here.
                  </p>
                </div>
              ) : (
                bookings
                  .slice(0, 5)
                  .map((booking, index) => {
                    const status =
                      getBookingStatus(
                        booking
                      );

                    const type =
                      getVehicleType(
                        booking
                      );

                    const image =
                      getBookingImage(
                        booking
                      );

                    return (
                      <div
                        key={
                          booking?.id ||
                          `${booking?.vehicleName || 'vehicle'}-${index}`
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '13px',
                          border:
                            '1px solid #e5e7eb',
                          borderRadius: '10px',
                          padding: '12px',
                          marginBottom: '10px',
                        }}
                      >
                        <img
                          src={image}
                          alt={
                            booking?.vehicleName ||
                            'Vehicle'
                          }
                          onError={(event) => {
                            event.currentTarget.onerror =
                              null;
                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                          style={{
                            width: '85px',
                            height: '62px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            background: '#f3f4f6',
                            flexShrink: 0,
                          }}
                        />

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <strong>
                              {booking?.vehicleName ||
                                'Vehicle'}
                            </strong>

                            <span
                              style={{
                                padding:
                                  '3px 8px',
                                borderRadius:
                                  '10px',
                                background:
                                  type === 'Bike'
                                    ? '#f3e8ff'
                                    : '#dbeafe',
                                color:
                                  type === 'Bike'
                                    ? '#7e22ce'
                                    : '#1d4ed8',
                                fontSize:
                                  '10px',
                                fontWeight:
                                  '800',
                              }}
                            >
                              {type}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: '5px',
                              color: '#6b7280',
                              fontSize:
                                '0.8rem',
                            }}
                          >
                            {booking?.startDate ||
                              'N/A'}{' '}
                            to{' '}
                            {booking?.endDate ||
                              'N/A'}
                          </div>
                        </div>

                        <span
                          style={{
                            padding:
                              '6px 10px',
                            borderRadius:
                              '999px',
                            fontSize:
                              '0.72rem',
                            fontWeight:
                              '800',
                            whiteSpace:
                              'nowrap',
                            ...getStatusStyle(
                              status
                            ),
                          }}
                        >
                          {status}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: '22px',
            background: '#111827',
            color: '#fff',
            borderRadius: '14px',
            padding: '18px',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}
        >
          Ride Easy • Car & Bike Rental
        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>
        {`
          @media (max-width: 850px) {
            .profile-main-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 620px) {
            .profile-form-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}