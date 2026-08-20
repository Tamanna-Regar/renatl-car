import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    rentedCars: 0,
    totalBikes: 0,
    availableBikes: 0,
    rentedBikes: 0,
    utilizationRate: '0%'
  });

  const [bookings, setBookings] = useState([]);
  
  // Vehicles Fleet State
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ name: '', type: 'Car', numberPlate: '', pricePerDay: '', status: 'Available' });
  const [showAddModal, setShowAddModal] = useState(false);

  // Extensions State
  const [extensions, setExtensions] = useState([
    { id: 1, userEmail: 'Tamanna123@gmail.com', vehicleName: 'Hybrid Bike', requestedDays: '2 Days', status: 'Pending' }
  ]);

  // Registered Users State
  const [users, setUsers] = useState([]);

  // Driver Verification State
  const [verifications, setVerifications] = useState([
    { id: 1, driverName: 'Deepanshu', licenseNo: 'RJ2720230001234', docStatus: 'Pending Review' }
  ]);

  useEffect(() => {
    // 1. Fetch Bookings from localStorage
    const localBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    
    // 2. Fetch Actual Cars and Bikes lists from user storage
    const savedBikes = JSON.parse(localStorage.getItem('rentEasyBikesList') || '[]');
    const savedCars = JSON.parse(localStorage.getItem('rentEasyCarsList') || '[]');
    const fleetVehicles = JSON.parse(localStorage.getItem('fleetVehicles') || '[]');

    // Combine all vehicles to show in fleet tab
    const allCombinedFleet = [...fleetVehicles, ...savedCars, ...savedBikes];
    setVehicles(allCombinedFleet);
    
    let combinedBookings = [...localBookings];

    // Auto-extract bookings if marked booked in lists
    [...savedBikes, ...savedCars].forEach(item => {
      if (item.isBooked && item.bookingDetails) {
        const exists = combinedBookings.some(b => b.vehicleName === item.name);
        if (!exists) {
          combinedBookings.push({
            userEmail: 'user@gmail.com',
            vehicleName: item.name,
            startDate: item.bookingDetails.startDate,
            endDate: item.bookingDetails.endDate,
            status: item.bookingDetails.status || 'Pending'
          });
        }
      }
    });

    setBookings(combinedBookings);

    // 3. Calculate exact Total Cars, Rented Cars, and Available Cars
    const totalCarsCount = savedCars.length;
    const totalBikesCount = savedBikeListCount => savedBikes.length;

    // Rented count (jiski booking confirmed hai ya item isBooked true hai)
    const rentedCarsCount = savedCars.filter(car => car.isBooked || combinedBookings.some(b => b.vehicleName === car.name && b.status === 'Confirmed')).length;
    const rentedBikesCount = savedBikes.filter(bike => bike.isBooked || combinedBookings.some(b => b.vehicleName === bike.name && b.status === 'Confirmed')).length;

    const availableCarsCount = Math.max(0, totalCarsCount - rentedCarsCount);
    const availableBikesCount = Math.max(0, savedBikes.length - rentedBikesCount);

    const totalCount = totalCarsCount + savedBikes.length;
    const totalRented = rentedCarsCount + rentedBikesCount;
    const utilRate = totalCount > 0 ? ((totalRented / totalCount) * 100).toFixed(2) + '%' : '0%';

    setStats({
      totalCars: totalCarsCount,
      availableCars: availableCarsCount,
      rentedCars: rentedCarsCount,
      totalBikes: savedBikes.length,
      availableBikes: availableBikesCount,
      rentedBikes: rentedBikesCount,
      utilizationRate: utilRate
    });

    // 4. Fetch Users
    const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setUsers(localUsers);
  }, [activeTab]);

  const handleStatusChange = (index, newStatus) => {
    const updatedBookings = [...bookings];
    updatedBookings[index].status = newStatus;
    setBookings(updatedBookings);
    localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.numberPlate || !newVehicle.pricePerDay) return;
    const updatedVehicles = [...vehicles, { ...newVehicle, id: Date.now() }];
    setVehicles(updatedVehicles);
    localStorage.setItem('fleetVehicles', JSON.stringify(updatedVehicles));
    
    // Save to respective lists as well
    if (newVehicle.type.toLowerCase() === 'car') {
      const currentCars = JSON.parse(localStorage.getItem('rentEasyCarsList') || '[]');
      currentCars.push({ ...newVehicle, id: Date.now() });
      localStorage.setItem('rentEasyCarsList', JSON.stringify(currentCars));
    } else {
      const currentBikes = JSON.parse(localStorage.getItem('rentEasyBikesList') || '[]');
      currentBikes.push({ ...newVehicle, id: Date.now() });
      localStorage.setItem('rentEasyBikesList', JSON.stringify(currentBikes));
    }

    setNewVehicle({ name: '', type: 'Car', numberPlate: '', pricePerDay: '', status: 'Available' });
    setShowAddModal(false);
  };

  const handleDeleteVehicle = (id) => {
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    setVehicles(updatedVehicles);
    localStorage.setItem('fleetVehicles', JSON.stringify(updatedVehicles));
  };

  const handleExtensionAction = (id, status) => {
    setExtensions(extensions.map(ext => ext.id === id ? { ...ext, status } : ext));
  };

  const handleVerificationAction = (id, docStatus) => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, docStatus } : v));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const totalBookingsCount = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending' || !b.status).length;
  const rejectedCount = bookings.filter(b => b.status === 'Rejected').length;

  const todayStr = '2026-08-20';
  const overdueBookings = bookings.filter(b => b.status === 'Confirmed' && b.endDate && b.endDate < todayStr);

  const navBtnStyle = (isActive) => ({
    background: isActive ? '#2563eb' : 'transparent',
    color: isActive ? '#fff' : '#94a3b8',
    border: 'none',
    padding: '10px 12px',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'block',
    width: '100%',
    marginBottom: '5px',
    fontSize: '0.85rem',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ display: 'flex', width: '100vw', minWidth: '100vw', height: '100vh', background: '#090d16', color: '#94a3b8', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box', position: 'fixed', top: 0, left: 0 }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', background: '#0e1424', borderRight: '1px solid #1e293b', padding: '15px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, height: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#2563eb', padding: '8px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>🚗</div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', margin: 0 }}>RIDE EASY</h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Car & Bike Rental</span>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>CORE MANAGEMENT</div>
          <button onClick={() => setActiveTab('dashboard')} style={navBtnStyle(activeTab === 'dashboard')}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('vehicles')} style={navBtnStyle(activeTab === 'vehicles')}>🚙 Vehicles Fleet</button>
          <button onClick={() => setActiveTab('bookings')} style={navBtnStyle(activeTab === 'bookings')}>📋 Bookings List</button>
          <button onClick={() => setActiveTab('extensions')} style={navBtnStyle(activeTab === 'extensions')}>🔑 Extensions</button>

          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', margin: '18px 0 8px 0', letterSpacing: '0.5px' }}>REPORTS & INSIGHTS</div>
          <button onClick={() => setActiveTab('revenue')} style={navBtnStyle(activeTab === 'revenue')}>📈 Revenue Analytics</button>
          <button onClick={() => setActiveTab('overdue')} style={navBtnStyle(activeTab === 'overdue')}>⚠️ Overdue Tracker</button>

          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', margin: '18px 0 8px 0', letterSpacing: '0.5px' }}>USER MANAGEMENT</div>
          <button onClick={() => setActiveTab('users')} style={navBtnStyle(activeTab === 'users')}>👥 Registered Users</button>
          <button onClick={() => setActiveTab('verification')} style={navBtnStyle(activeTab === 'verification')}>🛡️ Driver Verification</button>
        </div>

        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '8px 10px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '25px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 5px 0' }}>
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'bookings' ? 'Bookings List' : activeTab === 'vehicles' ? 'Vehicles Fleet' : activeTab === 'extensions' ? 'Rental Extensions' : activeTab === 'revenue' ? 'Revenue Analytics' : activeTab === 'overdue' ? 'Overdue Tracker' : activeTab === 'users' ? 'Registered Users' : 'Driver Verification'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Manage active rentals, fleet health, and pending requests</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#2563eb', color: '#fff', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>T</div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>Tamanna</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Inventory Status Bar: Total Cars, Rent par kitni gayi, aur kitni bachi hai */}
            <div style={{ background: '#1e293b', padding: '18px 20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '10px' }}>📦 Live Fleet Availability (Cars & Bikes Status)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>🚗 Cars Fleet</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Cars: <b>{stats.totalCars}</b></div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Rented Out: <b>{stats.rentedCars}</b></div>
                  <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold', marginTop: '3px' }}>Available to Book: {stats.availableCars}</div>
                </div>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>🏍️ Bikes Fleet</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Bikes: <b>{stats.totalBikes}</b></div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Rented Out: <b>{stats.rentedBikes}</b></div>
                  <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold', marginTop: '3px' }}>Available to Book: {stats.availableBikes} </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: '#111827', padding: '15px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Total Bookings</div>
                <div style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{totalBookingsCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>All Time</div>
              </div>
              <div style={{ background: '#111827', padding: '15px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Confirmed</div>
                <div style={{ fontSize: '1.6rem', color: '#22c55e', fontWeight: 'bold', marginBottom: '4px' }}>{confirmedCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#22c55e' }}>Active Rentals</div>
              </div>
              <div style={{ background: '#111827', padding: '15px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Pending Requests</div>
                <div style={{ fontSize: '1.6rem', color: '#eab308', fontWeight: 'bold', marginBottom: '4px' }}>{pendingCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#eab308' }}>Needs Action</div>
              </div>
              <div style={{ background: '#111827', padding: '15px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Rejected</div>
                <div style={{ fontSize: '1.6rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '4px' }}>{rejectedCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#ef4444' }}>Cancelled</div>
              </div>
              <div style={{ background: '#111827', padding: '15px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Utilization Rate</div>
                <div style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{stats.utilizationRate}</div>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>Overall</div>
              </div>
            </div>

            <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '15px' }}>Recent Bookings Summary</h3>
              {bookings.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>No recent bookings found.</p>
              ) : (
                bookings.map((b, idx) => (
                  <div key={idx} style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{b.vehicleName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{b.userEmail} • From {b.startDate} to {b.endDate}</div>
                    </div>
                    <span style={{ 
                      background: b.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.2)' : b.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)', 
                      color: b.status === 'Confirmed' ? '#22c55e' : b.status === 'Rejected' ? '#ef4444' : '#eab308', 
                      fontSize: '0.7rem', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' 
                    }}>
                      {b.status || 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. VEHICLES FLEET TAB */}
        {activeTab === 'vehicles' && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Fleet Management</h3>
              <button 
                onClick={() => setShowAddModal(!showAddModal)}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
              >
                {showAddModal ? 'Cancel' : '+ Add Vehicle'}
              </button>
            </div>

            {showAddModal && (
              <form onSubmit={handleAddVehicle} style={{ background: '#1f2937', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Vehicle Name</label>
                  <input type="text" placeholder="e.g. Sports Bike" value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} style={{ width: '100%', padding: '7px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Type</label>
                  <select value={newVehicle.type} onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})} style={{ width: '100%', padding: '7px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Number Plate</label>
                  <input type="text" placeholder="e.g. RJ-27-XX-0000" value={newVehicle.numberPlate} onChange={(e) => setNewVehicle({...newVehicle, numberPlate: e.target.value})} style={{ width: '100%', padding: '7px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Price Per Day</label>
                  <input type="text" placeholder="e.g. ₹1500" value={newVehicle.pricePerDay} onChange={(e) => setNewVehicle({...newVehicle, pricePerDay: e.target.value})} style={{ width: '100%', padding: '7px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }} required />
                </div>
                <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', height: '35px' }}>Save Vehicle</button>
              </form>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '12px' }}>Vehicle Name</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Number Plate</th>
                    <th style={{ padding: '12px' }}>Price/Day</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No vehicles added in fleet yet.</td></tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #1f2937', color: '#e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{v.name}</td>
                        <td style={{ padding: '12px' }}>{v.type}</td>
                        <td style={{ padding: '12px' }}>{v.numberPlate || 'RJ-27-XX-0000'}</td>
                        <td style={{ padding: '12px' }}>{v.pricePerDay || '₹1000'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: v.status === 'Available' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: v.status === 'Available' ? '#22c55e' : '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {v.status || 'Available'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteVehicle(v.id)} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. BOOKINGS LIST TAB */}
        {activeTab === 'bookings' && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>All User Bookings</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '12px' }}>User Email</th>
                    <th style={{ padding: '12px' }}>Vehicle Name</th>
                    <th style={{ padding: '12px' }}>From Date</th>
                    <th style={{ padding: '12px' }}>To Date</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No bookings found.</td></tr>
                  ) : (
                    bookings.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #1f2937', color: '#e2e8f0' }}>
                        <td style={{ padding: '12px' }}>{item.userEmail}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{item.vehicleName}</td>
                        <td style={{ padding: '12px' }}>{item.startDate}</td>
                        <td style={{ padding: '12px' }}>{item.endDate}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: item.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.2)' : item.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: item.status === 'Confirmed' ? '#22c55e' : item.status === 'Rejected' ? '#ef4444' : '#eab308', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {item.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleStatusChange(index, 'Confirmed')} style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Confirm</button>
                            <button onClick={() => handleStatusChange(index, 'Rejected')} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. EXTENSIONS TAB */}
        {activeTab === 'extensions' && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Rental Period Extensions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '12px' }}>User Email</th>
                    <th style={{ padding: '12px' }}>Vehicle Name</th>
                    <th style={{ padding: '12px' }}>Requested Extension</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {extensions.map((ext) => (
                    <tr key={ext.id} style={{ borderBottom: '1px solid #1f2937', color: '#e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{ext.userEmail}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{ext.vehicleName}</td>
                      <td style={{ padding: '12px' }}>{ext.requestedDays}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: ext.status === 'Approved' ? 'rgba(34, 197, 94, 0.2)' : ext.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: ext.status === 'Approved' ? '#22c55e' : ext.status === 'Rejected' ? '#ef4444' : '#eab308', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {ext.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleExtensionAction(ext.id, 'Approved')} style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Approve</button>
                          <button onClick={() => handleExtensionAction(ext.id, 'Rejected')} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. REVENUE ANALYTICS TAB */}
        {activeTab === 'revenue' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Total Earnings (All Time)</div>
                <div style={{ fontSize: '1.8rem', color: '#22c55e', fontWeight: 'bold' }}>₹12,500</div>
              </div>
              <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>This Month Revenue</div>
                <div style={{ fontSize: '1.8rem', color: '#38bdf8', fontWeight: 'bold' }}>₹4,500</div>
              </div>
              <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Pending Payments</div>
                <div style={{ fontSize: '1.8rem', color: '#eab308', fontWeight: 'bold' }}>₹0</div>
              </div>
            </div>
            <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '10px' }}>Financial Performance Overview</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Detailed transaction graphs and logs will appear here based on completed rental payments.</p>
            </div>
          </div>
        )}

        {/* 6. OVERDUE TRACKER TAB */}
        {activeTab === 'overdue' && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>⚠️ Overdue Rentals Tracker</h3>
            {overdueBookings.length === 0 ? (
              <p style={{ color: '#22c55e', fontSize: '0.9rem', background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '6px', margin: 0 }}>
                🎉 Great news! There are currently no overdue vehicle returns. All rentals are on schedule.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>User Email</th>
                      <th style={{ padding: '12px' }}>Vehicle Name</th>
                      <th style={{ padding: '12px' }}>Due Date</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Action / Call</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueBookings.map((item, index) => {
                      const matchedUser = users.find(u => u.email === item.userEmail);
                      const phoneNo = matchedUser ? matchedUser.phone : null;
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #1f2937', color: '#e2e8f0' }}>
                          <td style={{ padding: '12px' }}>{item.userEmail}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{item.vehicleName}</td>
                          <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>{item.endDate} (Overdue)</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                              Late Return
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {phoneNo ? (
                              <a href={`tel:${phoneNo}`} style={{ padding: '5px 12px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>
                                📞 Call {phoneNo}
                              </a>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No Phone Found</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. REGISTERED USERS TAB */}
        {activeTab === 'users' && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Registered Platform Users</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Phone Number</th>
                    <th style={{ padding: '12px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No registered users found.</td></tr>
                  ) : (
                    users.map((u, index) => (
                      <tr key={u.id || index} style={{ borderBottom: '1px solid #1f2937', color: '#e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{u.name || u.fullName}</td>
                        <td style={{ padding: '12px' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>{u.phone || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {u.role || 'Customer'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. DRIVER VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Driver License & ID Verification</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#94a3b8' }}>
                    <th style={{ padding: '12px' }}>Driver Name</th>
                    <th style={{ padding: '12px' }}>License No</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #1f2937', color: '#e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{v.driverName}</td>
                      <td style={{ padding: '12px' }}>{v.licenseNo}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: v.docStatus === 'Verified' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: v.docStatus === 'Verified' ? '#22c55e' : '#eab308', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {v.docStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleVerificationAction(v.id, 'Verified')} style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Verify</button>
                          <button onClick={() => handleVerificationAction(v.id, 'Rejected')} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}