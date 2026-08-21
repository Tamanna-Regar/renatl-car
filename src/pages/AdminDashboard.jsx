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
  const [newVehicle, setNewVehicle] = useState({ name: '', type: 'Car', numberPlate: '', pricePerDay: '', fuelType: 'Petrol', status: 'Available', description: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit & View Modals State
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);

  // Extensions State
  const [extensions, setExtensions] = useState([
    { id: 1, userEmail: 'Tamanna123@gmail.com', vehicleName: 'Hybrid Bike', requestedDays: '2 Days', status: 'Pending' }
  ]);
    // Settings State
  const [settings, setSettings] = useState(() => {
    const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    return {
      adminName: 'Tamanna',
      companyName: 'Ride Easy',
      notificationsEnabled: true,
      darkTheme: true,
      maxExtensions: '2',
      currency: 'INR',
      notifNewBooking: true,
      notifReturnDue: true,
      notifOverdue: true,
      notifExtensionReq: true,
      notifVerification: true,
      notifCompleted: true,
      ...savedSettings
    };
  });

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [calendarFilters, setCalendarFilters] = useState({
    Confirmed: true,
    Pending: true,
    Rejected: true,
    Overdue: true
  });

  // One theme controls the complete admin frontend. Every page/tab uses these values.
  const theme = settings.darkTheme
    ? {
        pageBg: '#090d16',
        sidebarBg: '#0e1424',
        cardBg: '#111827',
        surface: '#1f2937',
        surfaceAlt: '#161e2e',
        inputBg: '#0f172a',
        border: '#1f2937',
        borderStrong: '#374151',
        divider: '#334155',
        textPrimary: '#ffffff',
        textSecondary: '#e2e8f0',
        textMuted: '#94a3b8',
        textSoft: '#64748b',
        inputText: '#ffffff',
        onAccent: '#ffffff'
      }
    : {
        pageBg: '#f8fafc',
        sidebarBg: '#ffffff',
        cardBg: '#ffffff',
        surface: '#f1f5f9',
        surfaceAlt: '#f8fafc',
        inputBg: '#ffffff',
        border: '#e2e8f0',
        borderStrong: '#cbd5e1',
        divider: '#cbd5e1',
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#475569',
        textSoft: '#64748b',
        inputText: '#0f172a',
        onAccent: '#ffffff'
      };

  // Registered Users State
  const [users, setUsers] = useState([]);

  // Driver Verification State
  const [verifications, setVerifications] = useState([
    { id: 1, driverName: 'Deepanshu', licenseNo: 'RJ2720230001234', docStatus: 'Pending Review' }
  ]);

  useEffect(() => {
    // 1. Fetch Bookings from localStorage
    const localBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    
    // 2. Fetch Actual Cars and Bikes lists from storage
    const savedBikes = JSON.parse(localStorage.getItem('rentEasyBikesList') || '[]');
    const savedCars = JSON.parse(localStorage.getItem('rentEasyCarsList') || '[]');
    const fleetVehicles = JSON.parse(localStorage.getItem('fleetVehicles') || '[]');

    const allCombinedFleet = [...fleetVehicles, ...savedCars, ...savedBikes];
    
    // Ensure every vehicle has a unique fallback ID if missing
    const uniqueFleet = allCombinedFleet.map((item, idx) => ({
      ...item,
      uniqueId: item.id || item._id || `veh-${idx}`
    }));

    setVehicles(uniqueFleet);
    
    let combinedBookings = [...localBookings];

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

    // 3. Automatic Count Calculation based on confirmed bookings
    const totalCarsCount = uniqueFleet.filter(v => v.type && v.type.toLowerCase() === 'car').length;
    const totalBikesCount = uniqueFleet.filter(v => v.type && v.type.toLowerCase() === 'bike').length;

    const rentedCarsCount = combinedBookings.filter(b => {
      const isCar = uniqueFleet.some(v => v.name === b.vehicleName && v.type && v.type.toLowerCase() === 'car');
      return isCar && b.status === 'Confirmed';
    }).length;

    const rentedBikesCount = combinedBookings.filter(b => {
      const isBike = uniqueFleet.some(v => v.name === b.vehicleName && v.type && v.type.toLowerCase() === 'bike');
      return isBike && b.status === 'Confirmed';
    }).length;

    const availableCarsCount = Math.max(0, totalCarsCount - rentedCarsCount);
    const availableBikesCount = Math.max(0, totalBikesCount - rentedBikesCount);

    const totalCount = totalCarsCount + totalBikesCount;
    const totalRented = rentedCarsCount + rentedBikesCount;
    const utilRate = totalCount > 0 ? ((totalRented / totalCount) * 100).toFixed(2) + '%' : '0%';

    setStats({
      totalCars: totalCarsCount,
      availableCars: availableCarsCount,
      rentedCars: rentedCarsCount,
      totalBikes: totalBikesCount,
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
    const targetBooking = updatedBookings[index];
    if (!targetBooking) return;

    const vehicleName = targetBooking.vehicleName;
    const formattedStatus = newStatus.toLowerCase(); // 'confirmed' or 'rejected'

    // 1. Bookings state aur local storage ko update karna
    updatedBookings[index].status = newStatus;
    setBookings(updatedBookings);
    localStorage.setItem('allBookings', JSON.stringify(updatedBookings));

    // 2. MAIN CHANGE: Cars list ko bina delete kiye update karna
    const savedCars = localStorage.getItem('rentEasyCarsList');
    if (savedCars) {
      let cars = JSON.parse(savedCars);
      let carUpdated = false;
      cars = cars.map((item) => {
        if (item.name === vehicleName && item.bookingDetails) {
          carUpdated = true;
          return {
            ...item,
            isBooked: true,
            bookingDetails: {
              ...item.bookingDetails,
              status: formattedStatus, // Yahan sirf status update ho raha hai
            },
          };
        }
        return item; // Baki cars waise hi return ho jayengi
      });
      if (carUpdated) {
        localStorage.setItem('rentEasyCarsList', JSON.stringify(cars));
        window.dispatchEvent(new Event('rentEasyCarsUpdated'));
      }
    }

    // 3. MAIN CHANGE: Bikes list ko bina delete kiye update karna
    const savedBikes = localStorage.getItem('rentEasyBikesList');
    if (savedBikes) {
      let bikes = JSON.parse(savedBikes);
      let bikeUpdated = false;
      bikes = bikes.map((item) => {
        if (item.name === vehicleName && item.bookingDetails) {
          bikeUpdated = true;
          return {
            ...item,
            isBooked: true,
            bookingDetails: {
              ...item.bookingDetails,
              status: formattedStatus, // Yahan sirf status update ho raha hai
            },
          };
        }
        return item; // Baki bikes waise hi return ho jayengi
      });
      if (bikeUpdated) {
        localStorage.setItem('rentEasyBikesList', JSON.stringify(bikes));
        window.dispatchEvent(new Event('rentEasyBikesUpdated'));
      }
    }
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.numberPlate || !newVehicle.pricePerDay) return;
    const vehicleWithId = { ...newVehicle, id: Date.now(), uniqueId: `veh-${Date.now()}` };
    const updatedVehicles = [...vehicles, vehicleWithId];
    setVehicles(updatedVehicles);
    localStorage.setItem('fleetVehicles', JSON.stringify(updatedVehicles));
    
    if (newVehicle.type.toLowerCase() === 'car') {
      const currentCars = JSON.parse(localStorage.getItem('rentEasyCarsList') || '[]');
      currentCars.push(vehicleWithId);
      localStorage.setItem('rentEasyCarsList', JSON.stringify(currentCars));
    } else {
      const currentBikes = JSON.parse(localStorage.getItem('rentEasyBikesList') || '[]');
      currentBikes.push(vehicleWithId);
      localStorage.setItem('rentEasyBikesList', JSON.stringify(currentBikes));
    }

    setNewVehicle({ name: '', type: 'Car', numberPlate: '', pricePerDay: '', fuelType: 'Petrol', status: 'Available', description: '' });
    setShowAddModal(false);
  };

  const handleUpdateVehicle = (e) => {
    e.preventDefault();
    const updatedVehicles = vehicles.map(v => (v.uniqueId === editingVehicle.uniqueId || v.id === editingVehicle.id) ? editingVehicle : v);
    setVehicles(updatedVehicles);
    localStorage.setItem('fleetVehicles', JSON.stringify(updatedVehicles));

    if (editingVehicle.type.toLowerCase() === 'car') {
      let currentCars = JSON.parse(localStorage.getItem('rentEasyCarsList') || '[]');
      currentCars = currentCars.map(c => (c.id === editingVehicle.id) ? editingVehicle : c);
      localStorage.setItem('rentEasyCarsList', JSON.stringify(currentCars));
    } else {
      let currentBikes = JSON.parse(localStorage.getItem('rentEasyBikesList') || '[]');
      currentBikes = currentBikes.map(b => (b.id === editingVehicle.id) ? editingVehicle : b);
      localStorage.setItem('rentEasyBikesList', JSON.stringify(currentBikes));
    }

    setEditingVehicle(null);
  };

  // Fixed Delete Function using unique identifiers and index safeguard
  const handleDeleteVehicle = (targetVehicle, targetIndex) => {
    const updatedVehicles = vehicles.filter((v, idx) => {
      if (targetVehicle.uniqueId) {
        return v.uniqueId !== targetVehicle.uniqueId;
      }
      return idx !== targetIndex;
    });

    setVehicles(updatedVehicles);
    localStorage.setItem('fleetVehicles', JSON.stringify(updatedVehicles));

    // Also remove from specific localstorage lists if present
    const targetName = targetVehicle.name;
    let savedCars = JSON.parse(localStorage.getItem('rentEasyCarsList') || '[]');
    savedCars = savedCars.filter(c => c.name !== targetName);
    localStorage.setItem('rentEasyCarsList', JSON.stringify(savedCars));

    let savedBikes = JSON.parse(localStorage.getItem('rentEasyBikesList') || '[]');
    savedBikes = savedBikes.filter(b => b.name !== targetName);
    localStorage.setItem('rentEasyBikesList', JSON.stringify(savedBikes));
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

  // Yahan handleSettingsChange function add kar diya gaya hai
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSettings((prev) => {
      const updated = { ...prev, [name]: newValue };
      localStorage.setItem('appSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const totalBookingsCount = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending' || !b.status).length;
  const rejectedCount = bookings.filter(b => b.status === 'Rejected').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueBookings = bookings.filter(b => b.status === 'Confirmed' && b.endDate && b.endDate < todayStr);
  

  const parseCalendarDate = (value) => {
    if (!value) return null;
    const match = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const sameCalendarDay = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const formatCalendarDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getBookingStatus = (booking) => {
    const status = booking.status || 'Pending';
    const end = parseCalendarDate(booking.endDate);
    if (status === 'Confirmed' && end && end < new Date(new Date().setHours(0, 0, 0, 0))) return 'Overdue';
    return status;
  };

  const visibleCalendarBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking);
    return calendarFilters[status] !== false;
  });

  const bookingFallsOnDate = (booking, date) => {
    const start = parseCalendarDate(booking.startDate);
    const end = parseCalendarDate(booking.endDate) || start;
    if (!start || !end) return false;
    return date >= start && date <= end;
  };

  const getMonthDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month - 1, previousMonthDays - i), outside: true });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: new Date(year, month, day), outside: false });
    }
    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({ date: new Date(year, month + 1, nextDay++), outside: true });
    }
    return cells;
  };

  const calendarMonthTitle = calendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const changeCalendarMonth = (amount) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + amount, 1));
  };

  const goToToday = () => setCalendarDate(new Date());

  const calendarStatusStyle = (status) => {
    if (status === 'Confirmed') return { background: settings.darkTheme ? 'rgba(16, 185, 129, 0.18)' : '#dcfce7', color: '#16a34a', border: settings.darkTheme ? '1px solid rgba(16,185,129,.25)' : '1px solid #bbf7d0' };
    if (status === 'Rejected') return { background: settings.darkTheme ? 'rgba(239, 68, 68, 0.18)' : '#fee2e2', color: '#dc2626', border: settings.darkTheme ? '1px solid rgba(239,68,68,.25)' : '1px solid #fecaca' };
    if (status === 'Overdue') return { background: settings.darkTheme ? 'rgba(245, 158, 11, 0.18)' : '#fef3c7', color: '#d97706', border: settings.darkTheme ? '1px solid rgba(245,158,11,.25)' : '1px solid #fde68a' };
    return { background: settings.darkTheme ? 'rgba(59, 130, 246, 0.18)' : '#dbeafe', color: '#2563eb', border: settings.darkTheme ? '1px solid rgba(59,130,246,.25)' : '1px solid #bfdbfe' };
  };

  const navBtnStyle = (isActive) => ({
    background: isActive ? '#2563eb' : 'transparent',
    color: isActive ? theme.onAccent : theme.textMuted,
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
    <div style={{ display: 'flex', width: '100vw', minWidth: '100vw', height: '100vh', background: theme.pageBg, color: theme.textMuted, fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden', transition: 'background 0.3s, color 0.3s', colorScheme: settings.darkTheme ? 'dark' : 'light', margin: 0, padding: 0, boxSizing: 'border-box', position: 'fixed', top: 0, left: 0 }}>
      
      {/* SIDEBAR */}
<div style={{ width: '260px', background: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, padding: '15px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, height: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
      <div style={{ background: '#2563eb', padding: '8px', borderRadius: '8px', color: theme.onAccent, fontWeight: 'bold' }}>🚗</div>
      <div>
        <h3 style={{ color: theme.textPrimary, fontSize: '0.95rem', margin: 0 }}>RIDE EASY</h3>
        <span style={{ fontSize: '0.7rem', color: theme.textSoft }}>Car & Bike Rental</span>
      </div>
    </div>

    <div style={{ fontSize: '0.7rem', color: theme.textSoft, fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>CORE MANAGEMENT</div>
    
    {/* Calendar Button Added */}
    <button onClick={() => setActiveTab('calendar')} style={navBtnStyle(activeTab === 'calendar')}>📅 Calendar</button>
    
    <button onClick={() => setActiveTab('dashboard')} style={navBtnStyle(activeTab === 'dashboard')}>📊 Dashboard</button>
    <button onClick={() => setActiveTab('vehicles')} style={navBtnStyle(activeTab === 'vehicles')}>🚙 Vehicles Fleet</button>
    <button onClick={() => setActiveTab('bookings')} style={navBtnStyle(activeTab === 'bookings')}>📋 Bookings List</button>
    <button onClick={() => setActiveTab('extensions')} style={navBtnStyle(activeTab === 'extensions')}>🔑 Extensions</button>

    <div style={{ fontSize: '0.7rem', color: theme.textSoft, fontWeight: 'bold', margin: '18px 0 8px 0', letterSpacing: '0.5px' }}>REPORTS & INSIGHTS</div>
    <button onClick={() => setActiveTab('revenue')} style={navBtnStyle(activeTab === 'revenue')}>📈 Revenue Analytics</button>
    <button onClick={() => setActiveTab('overdue')} style={navBtnStyle(activeTab === 'overdue')}>⚠️ Overdue Tracker</button>

    <div style={{ fontSize: '0.7rem', color: theme.textSoft, fontWeight: 'bold', margin: '18px 0 8px 0', letterSpacing: '0.5px' }}>USER MANAGEMENT</div>
    <button onClick={() => setActiveTab('users')} style={navBtnStyle(activeTab === 'users')}>👥 Registered Users</button>
    <button onClick={() => setActiveTab('verification')} style={navBtnStyle(activeTab === 'verification')}>🛡️ Driver Verification</button>
    
    {/* Settings Button Added */}
    <button onClick={() => setActiveTab('settings')} style={navBtnStyle(activeTab === 'settings')}>⚙️ Settings</button>
  </div>

  <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '8px 10px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
    🚪 Logout
  </button>
</div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '25px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px' }}>
          <div>
            <h1 style={{ color: theme.textPrimary, fontSize: '1.5rem', margin: '0 0 5px 0' }}>
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'bookings' ? 'Bookings List' : activeTab === 'vehicles' ? 'Vehicles Fleet' : activeTab === 'extensions' ? 'Rental Extensions' : activeTab === 'revenue' ? 'Revenue Analytics' : activeTab === 'overdue' ? 'Overdue Tracker' : activeTab === 'users' ? 'Registered Users' : 'Driver Verification'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: theme.textSoft, margin: 0 }}>Manage active rentals, fleet health, and pending requests</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#2563eb', color: theme.onAccent, borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>T</div>
              <div>
                <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>Tamanna</div>
                <div style={{ fontSize: '0.65rem', color: theme.textSoft }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ background: theme.surface, padding: '18px 20px', borderRadius: '10px', marginBottom: '20px', border: `1px solid ${theme.divider}` }}>
              <div style={{ color: theme.textPrimary, fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '10px' }}>📦 Live Fleet Availability (Cars & Bikes Status)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.borderStrong}` }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>🚗 Cars Fleet</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textMuted }}>Total Cars: <b>{stats.totalCars}</b></div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Rented Out: <b>{stats.rentedCars}</b></div>
                  <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold', marginTop: '3px' }}>Available: {stats.availableCars}</div>
                </div>
                <div style={{ background: theme.cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.borderStrong}` }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>🏍️ Bikes Fleet</div>
                  <div style={{ fontSize: '0.8rem', color: theme.textMuted }}>Total Bikes: <b>{stats.totalBikes}</b></div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Rented Out: <b>{stats.rentedBikes}</b></div>
                  <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold', marginTop: '3px' }}>Available: {stats.availableBikes}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: theme.cardBg, padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Total Bookings</div>
                <div style={{ fontSize: '1.6rem', color: theme.textPrimary, fontWeight: 'bold', marginBottom: '4px' }}>{totalBookingsCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>All Time</div>
              </div>
              <div style={{ background: theme.cardBg, padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Confirmed</div>
                <div style={{ fontSize: '1.6rem', color: '#22c55e', fontWeight: 'bold', marginBottom: '4px' }}>{confirmedCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#22c55e' }}>Active Rentals</div>
              </div>
              <div style={{ background: theme.cardBg, padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Pending Requests</div>
                <div style={{ fontSize: '1.6rem', color: '#eab308', fontWeight: 'bold', marginBottom: '4px' }}>{pendingCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#eab308' }}>Needs Action</div>
              </div>
              <div style={{ background: theme.cardBg, padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Rejected</div>
                <div style={{ fontSize: '1.6rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '4px' }}>{rejectedCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#ef4444' }}>Cancelled</div>
              </div>
              <div style={{ background: theme.cardBg, padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginBottom: '8px' }}>Utilization Rate</div>
                <div style={{ fontSize: '1.6rem', color: theme.textPrimary, fontWeight: 'bold', marginBottom: '4px' }}>{stats.utilizationRate}</div>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>Overall</div>
              </div>
            </div>

            <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1rem', marginBottom: '15px' }}>Recent Bookings Summary</h3>
              {bookings.length === 0 ? (
                <p style={{ color: theme.textSoft, fontSize: '0.85rem', margin: 0 }}>No recent bookings found.</p>
              ) : (
                bookings.map((b, idx) => (
                  <div key={`recent-book-${idx}`} style={{ background: theme.surface, padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>{b.vehicleName}</div>
                      <div style={{ fontSize: '0.7rem', color: theme.textMuted }}>{b.userEmail} • From {b.startDate} to {b.endDate}</div>
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
          <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', margin: 0 }}>Fleet Management</h3>
              <button 
                onClick={() => setShowAddModal(!showAddModal)}
                style={{ background: '#2563eb', color: theme.onAccent, border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
              >
                {showAddModal ? 'Cancel' : '+ Add Vehicle'}
              </button>
            </div>

            {/* ADD VEHICLE FORM */}
            {showAddModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(2, 6, 23, 0.72)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 1000
              }}>
                <form onSubmit={handleAddVehicle} style={{
                  width: '100%',
                  maxWidth: '680px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: theme.cardBg,
                  border: `1px solid ${theme.borderStrong}`,
                  borderRadius: '14px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
                    <div>
                      <h2 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.35rem' }}>Create New Vehicle</h2>
                      <p style={{ margin: '6px 0 0', color: theme.textMuted, fontSize: '0.82rem' }}>Add a vehicle to your Ride Easy rental fleet</p>
                    </div>
                    <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: theme.textMuted, fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Vehicle Name</label>
                      <input type="text" placeholder="e.g. SUV Luxury" value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem', outline: 'none' }} required />
                    </div>

                    <div>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Vehicle Type</label>
                      <select value={newVehicle.type} onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem' }}>
                        <option value="Car">Car</option>
                        <option value="Bike">Bike</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Vehicle Number Plate</label>
                      <input type="text" placeholder="e.g. RJ-06-AB-1234" value={newVehicle.numberPlate} onChange={(e) => setNewVehicle({...newVehicle, numberPlate: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem', outline: 'none' }} required />
                    </div>

                    <div>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Price Per Day</label>
                      <input type="number" min="0" placeholder="e.g. 1500" value={newVehicle.pricePerDay} onChange={(e) => setNewVehicle({...newVehicle, pricePerDay: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem', outline: 'none' }} required />
                    </div>

                    <div>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Fuel Type</label>
                      <select value={newVehicle.fuelType} onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem' }}>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Vehicle Status</label>
                      <select value={newVehicle.status} onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem' }}>
                        <option value="Available">Available</option>
                        <option value="Rented">Rented</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '7px' }}>Description</label>
                      <textarea rows="4" placeholder="Enter vehicle description..." value={newVehicle.description} onChange={(e) => setNewVehicle({...newVehicle, description: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '7px', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '18px', borderTop: `1px solid ${theme.border}` }}>
                    <button type="button" onClick={() => setShowAddModal(false)} style={{ background: theme.surface, color: theme.textSecondary, border: `1px solid ${theme.borderStrong}`, padding: '10px 18px', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Cancel</button>
                    <button type="submit" style={{ background: '#2563eb', color: theme.onAccent, border: 'none', padding: '10px 20px', borderRadius: '7px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>Save Vehicle</button>
                  </div>
                </form>
              </div>
            )}

            {/* EDIT VEHICLE FORM MODAL */}
            {editingVehicle && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ background: theme.surface, padding: '25px', borderRadius: '10px', width: '400px', border: `1px solid ${theme.divider}` }}>
                  <h3 style={{ color: theme.textPrimary, marginTop: 0, marginBottom: '15px' }}>✏️ Edit Vehicle</h3>
                  <form onSubmit={handleUpdateVehicle}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Vehicle Name</label>
                      <input type="text" value={editingVehicle.name} onChange={(e) => setEditingVehicle({...editingVehicle, name: e.target.value})} style={{ width: '100%', padding: '8px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.textPrimary, borderRadius: '4px' }} required />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Type</label>
                      <select value={editingVehicle.type || 'Car'} onChange={(e) => setEditingVehicle({...editingVehicle, type: e.target.value})} style={{ width: '100%', padding: '8px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.textPrimary, borderRadius: '4px' }}>
                        <option value="Car">Car</option>
                        <option value="Bike">Bike</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Number Plate</label>
                      <input type="text" value={editingVehicle.numberPlate || ''} onChange={(e) => setEditingVehicle({...editingVehicle, numberPlate: e.target.value})} style={{ width: '100%', padding: '8px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.textPrimary, borderRadius: '4px' }} required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>Price Per Day</label>
                      <input type="text" value={editingVehicle.pricePerDay || ''} onChange={(e) => setEditingVehicle({...editingVehicle, pricePerDay: e.target.value})} style={{ width: '100%', padding: '8px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.textPrimary, borderRadius: '4px' }} required />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setEditingVehicle(null)} style={{ padding: '8px 14px', background: '#64748b', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" style={{ padding: '8px 14px', background: '#2563eb', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Update</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

           {/* VIEW VEHICLE MODAL */}
            {viewingVehicle && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '12px', width: '520px', border: `1px solid ${theme.border}`, color: theme.textSecondary, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                  
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ color: theme.textPrimary, fontSize: '1.2rem', margin: '0 0 4px 0' }}>{viewingVehicle.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>{viewingVehicle.type || 'Car'} • Fleet Management • Active</span>
                    </div>
                    <button onClick={() => setViewingVehicle(null)} style={{ background: theme.surface, color: theme.textMuted, border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>

                  {/* Basic Information & Price Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ background: theme.surfaceAlt, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 'bold', marginBottom: '8px' }}>Basic Information</div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}><span>Type:</span> <b style={{ color: theme.textPrimary }}>{viewingVehicle.type || 'Car'}</b></div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}><span>Number Plate:</span> <b style={{ color: theme.textPrimary }}>{viewingVehicle.numberPlate || 'RJ-27-XX-0000'}</b></div>
                      <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}><span>Status:</span> <b style={{ color: '#22c55e' }}>{viewingVehicle.status || 'Available'}</b></div>
                    </div>

                    <div style={{ background: theme.surfaceAlt, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 'bold', marginBottom: '8px' }}>Rental Pricing</div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}><span>Price / Day:</span> <b style={{ color: '#38bdf8' }}>{viewingVehicle.pricePerDay ? `₹${viewingVehicle.pricePerDay}` : '₹1000'}</b></div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}><span>Security Deposit:</span> <b style={{ color: theme.textPrimary }}>₹2000</b></div>
                      <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}><span>Condition:</span> <b style={{ color: '#22c55e' }}>Excellent</b></div>
                    </div>
                  </div>

                  {/* Timeline History */}
                  <div style={{ background: theme.surfaceAlt, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 'bold', marginBottom: '8px' }}>Fleet History</div>
                    <div style={{ fontSize: '0.75rem', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span> Added to Fleet (17 May 2026)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Last Serviced & Verified (12 May 2026)
                    </div>
                  </div>

                  {/* Activity Log */}
                  <div style={{ background: theme.surfaceAlt, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 'bold', marginBottom: '6px' }}>Activity Log</div>
                    <div style={{ fontSize: '0.75rem', color: theme.textMuted, lineHeight: '1.4' }}>
                      • Admin Tamanna registered this vehicle into the fleet system.<br/>
                      • Status updated successfully to active rentals pool.
                    </div>
                  </div>

                  <button onClick={() => setViewingVehicle(null)} style={{ width: '100%', padding: '10px', background: '#2563eb', color: theme.onAccent, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Close Details</button>
                </div>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.borderStrong}`, color: theme.textMuted }}>
                    <th style={{ padding: '12px' }}>Vehicle Name</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Number Plate</th>
                    <th style={{ padding: '12px' }}>Price/Day</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: theme.textSoft }}>No vehicles added in fleet yet.</td></tr>
                  ) : (
                    vehicles.map((v, index) => (
                      <tr key={`fleet-veh-${index}`} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{v.name}</td>
                        <td style={{ padding: '12px' }}>{v.type || 'Car'}</td>
                        <td style={{ padding: '12px' }}>{v.numberPlate || 'RJ-27-XX-0000'}</td>
                        <td style={{ padding: '12px' }}>{v.pricePerDay || '₹1000'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: v.status === 'Available' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: v.status === 'Available' ? '#22c55e' : '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {v.status || 'Available'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => setViewingVehicle(v)} style={{ padding: '5px 8px', background: '#3b82f6', color: theme.textPrimary, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>View</button>
                            <button onClick={() => setEditingVehicle(v)} style={{ padding: '5px 8px', background: '#eab308', color: theme.inputText, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Edit</button>
                            <button onClick={() => handleDeleteVehicle(v, index)} style={{ padding: '5px 8px', background: '#ef4444', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Delete</button>
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

        {/* 3. BOOKINGS LIST TAB */}
        {activeTab === 'bookings' && (
          <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '15px' }}>All User Bookings</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.borderStrong}`, color: theme.textMuted }}>
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
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: theme.textSoft }}>No bookings found.</td></tr>
                  ) : (
                    bookings.map((item, index) => (
                      <tr key={`booking-row-${index}`} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
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
                            <button onClick={() => handleStatusChange(index, 'Confirmed')} style={{ padding: '5px 10px', background: '#22c55e', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Confirm</button>
                            <button onClick={() => handleStatusChange(index, 'Rejected')} style={{ padding: '5px 10px', background: '#ef4444', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
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
          <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '15px' }}>Rental Period Extensions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.borderStrong}`, color: theme.textMuted }}>
                    <th style={{ padding: '12px' }}>User Email</th>
                    <th style={{ padding: '12px' }}>Vehicle Name</th>
                    <th style={{ padding: '12px' }}>Requested Extension</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {extensions.map((ext, idx) => (
                    <tr key={`ext-${idx}`} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
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
                          <button onClick={() => handleExtensionAction(ext.id, 'Approved')} style={{ padding: '5px 10px', background: '#22c55e', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Approve</button>
                          <button onClick={() => handleExtensionAction(ext.id, 'Rejected')} style={{ padding: '5px 10px', background: '#ef4444', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
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
              <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginBottom: '8px' }}>Total Earnings (All Time)</div>
                <div style={{ fontSize: '1.8rem', color: '#22c55e', fontWeight: 'bold' }}>₹12,500</div>
              </div>
              <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginBottom: '8px' }}>This Month Revenue</div>
                <div style={{ fontSize: '1.8rem', color: '#38bdf8', fontWeight: 'bold' }}>₹4,500</div>
              </div>
              <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginBottom: '8px' }}>Pending Payments</div>
                <div style={{ fontSize: '1.8rem', color: '#eab308', fontWeight: 'bold' }}>₹0</div>
              </div>
            </div>
            <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '10px' }}>Financial Performance Overview</h3>
              <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>Detailed transaction graphs and logs will appear here based on completed rental payments.</p>
            </div>
          </div>
        )}

        {/* 6. OVERDUE TRACKER TAB */}
        {activeTab === 'overdue' && (
          <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '15px' }}>⚠️ Overdue Rentals Tracker</h3>
            {overdueBookings.length === 0 ? (
              <p style={{ color: '#22c55e', fontSize: '0.9rem', background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '6px', margin: 0 }}>
                🎉 Great news! There are currently no overdue vehicle returns. All rentals are on schedule.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.borderStrong}`, color: theme.textMuted }}>
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
                        <tr key={`overdue-${index}`} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
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
                              <a href={`tel:${phoneNo}`} style={{ padding: '5px 12px', background: '#2563eb', color: theme.onAccent, textDecoration: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>
                                📞 Call {phoneNo}
                              </a>
                            ) : (
                              <span style={{ color: theme.textSoft, fontSize: '0.75rem' }}>No Phone Found</span>
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
          <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '15px' }}>Registered Platform Users</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.borderStrong}`, color: theme.textMuted }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Phone Number</th>
                    <th style={{ padding: '12px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textSoft }}>No registered users found.</td></tr>
                  ) : (
                    users.map((u, index) => (
                      <tr key={`user-row-${index}`} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
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
          <div style={{ background: theme.cardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '15px' }}>Driver License & ID Verification</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.borderStrong}`, color: theme.textMuted }}>
                    <th style={{ padding: '12px' }}>Driver Name</th>
                    <th style={{ padding: '12px' }}>License No</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v, idx) => (
                    <tr key={`verif-${idx}`} style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{v.driverName}</td>
                      <td style={{ padding: '12px' }}>{v.licenseNo}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: v.docStatus === 'Verified' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: v.docStatus === 'Verified' ? '#22c55e' : '#eab308', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {v.docStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleVerificationAction(v.id, 'Verified')} style={{ padding: '5px 10px', background: '#22c55e', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Verify</button>
                          <button onClick={() => handleVerificationAction(v.id, 'Rejected')} style={{ padding: '5px 10px', background: '#ef4444', color: theme.onAccent, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '190px minmax(0, 1fr)', gap: '18px', alignItems: 'start' }}>
            {/* CALENDAR FILTERS */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '18px', boxSizing: 'border-box' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '0.95rem', margin: '0 0 18px 0' }}>Calendar Filters</h3>
              {['Confirmed', 'Pending', 'Overdue', 'Rejected'].map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textSecondary, fontSize: '0.82rem', marginBottom: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={calendarFilters[status]}
                    onChange={(e) => setCalendarFilters(prev => ({ ...prev, [status]: e.target.checked }))}
                    style={{ accentColor: '#2563eb', width: '14px', height: '14px' }}
                  />
                  {status}
                </label>
              ))}
              <div style={{ borderTop: `1px solid ${theme.border}`, margin: '18px 0' }} />
              <div style={{ color: theme.textSoft, fontSize: '0.72rem', lineHeight: 1.5 }}>
                Green = confirmed<br />
                Blue = pending<br />
                Orange = overdue<br />
                Red = rejected
              </div>
            </div>

            {/* CALENDAR */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '18px', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => changeCalendarMonth(-1)} style={{ background: theme.surfaceAlt, color: theme.textPrimary, border: `1px solid ${theme.border}`, width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>‹</button>
                  <button onClick={goToToday} style={{ background: theme.surfaceAlt, color: theme.textSecondary, border: `1px solid ${theme.border}`, padding: '7px 11px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>Today</button>
                  <button onClick={() => changeCalendarMonth(1)} style={{ background: theme.surfaceAlt, color: theme.textPrimary, border: `1px solid ${theme.border}`, width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>›</button>
                  <h2 style={{ color: theme.textPrimary, fontSize: '1rem', margin: '0 0 0 10px' }}>{calendarMonthTitle}</h2>
                </div>

                <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                  {['month', 'week', 'day'].map(view => (
                    <button key={view} onClick={() => setCalendarView(view)} style={{ background: calendarView === view ? '#2563eb' : theme.surfaceAlt, color: calendarView === view ? '#fff' : theme.textSecondary, border: 'none', padding: '8px 13px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', textTransform: 'capitalize' }}>{view}</button>
                  ))}
                </div>
              </div>

              {calendarView === 'month' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '7px', marginBottom: '7px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{ color: theme.textSoft, fontSize: '0.68rem', fontWeight: '700', textAlign: 'center', padding: '5px 0', textTransform: 'uppercase' }}>{day}</div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '7px' }}>
                    {getMonthDays().map(({ date, outside }, index) => {
                      const dayBookings = visibleCalendarBookings.filter(b => bookingFallsOnDate(b, date));
                      const isToday = sameCalendarDay(date, new Date());
                      return (
                        <div key={`${formatCalendarDate(date)}-${index}`} style={{ minHeight: '92px', background: outside ? (settings.darkTheme ? '#0b101b' : '#f8fafc') : theme.surfaceAlt, border: `1px solid ${isToday ? '#2563eb' : theme.border}`, borderRadius: '8px', padding: '7px', boxSizing: 'border-box', opacity: outside ? 0.55 : 1, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <span style={{ color: isToday ? '#2563eb' : theme.textSecondary, fontSize: '0.72rem', fontWeight: '700' }}>{date.getDate()}</span>
                            {isToday && <span style={{ color: '#2563eb', fontSize: '0.58rem', fontWeight: '700' }}>TODAY</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {dayBookings.slice(0, 3).map((booking, bookingIndex) => {
                              const status = getBookingStatus(booking);
                              const statusStyle = calendarStatusStyle(status);
                              return (
                                <div key={`${booking.vehicleName || 'vehicle'}-${bookingIndex}`} title={`${booking.vehicleName || 'Vehicle'} | ${booking.userEmail || 'Customer'} | ${booking.startDate || ''} - ${booking.endDate || ''}`} style={{ ...statusStyle, padding: '4px 5px', borderRadius: '4px', fontSize: '0.61rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {booking.vehicleName || 'Vehicle'}
                                </div>
                              );
                            })}
                            {dayBookings.length > 3 && <div style={{ color: theme.textSoft, fontSize: '0.58rem', paddingLeft: '4px' }}>+{dayBookings.length - 3} more</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {calendarView === 'week' && (
                <div style={{ color: theme.textSecondary, fontSize: '0.82rem', background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '20px' }}>
                  <strong style={{ color: theme.textPrimary }}>Weekly schedule</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', marginTop: '15px' }}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const start = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate() - calendarDate.getDay() + i);
                      const dayBookings = visibleCalendarBookings.filter(b => bookingFallsOnDate(b, start));
                      return (
                        <div key={i} style={{ minHeight: '130px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px', background: theme.cardBg }}>
                          <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '7px' }}>{start.toLocaleString('en-US', { weekday: 'short' })} {start.getDate()}</div>
                          {dayBookings.map((b, j) => { const status = getBookingStatus(b); const st = calendarStatusStyle(status); return <div key={j} style={{ ...st, padding: '5px', borderRadius: '4px', marginBottom: '4px', fontSize: '0.62rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.vehicleName || 'Vehicle'}</div>; })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarView === 'day' && (
                <div style={{ color: theme.textSecondary, background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '20px' }}>
                  <h3 style={{ color: theme.textPrimary, margin: '0 0 14px', fontSize: '0.95rem' }}>{calendarDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                  {visibleCalendarBookings.filter(b => bookingFallsOnDate(b, calendarDate)).length === 0 ? (
                    <div style={{ color: theme.textSoft, fontSize: '0.8rem' }}>No rentals scheduled for this day.</div>
                  ) : (
                    visibleCalendarBookings.filter(b => bookingFallsOnDate(b, calendarDate)).map((b, i) => {
                      const status = getBookingStatus(b);
                      const st = calendarStatusStyle(status);
                      return (
                        <div key={i} style={{ ...st, borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{b.vehicleName || 'Vehicle'}</div>
                          <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>{b.userEmail || 'Customer'} • {b.startDate || '-'} to {b.endDate || '-'}</div>
                          <div style={{ fontSize: '0.65rem', marginTop: '5px', fontWeight: '700' }}>{status}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              <div style={{ marginTop: '14px', display: 'flex', gap: '15px', flexWrap: 'wrap', color: theme.textSoft, fontSize: '0.65rem' }}>
                <span>● Confirmed</span><span>● Pending</span><span>● Overdue</span><span>● Rejected</span>
                <span style={{ marginLeft: 'auto' }}>{visibleCalendarBookings.length} booking{visibleCalendarBookings.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        )}

{/* SETTINGS TAB */}
{activeTab === 'settings' && (
  <div style={{ padding: '10px' }}>
    <div style={{ marginBottom: '25px' }}>
      <h2 style={{ color: theme.textPrimary, fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>System Settings</h2>
      <p style={{ color: theme.textSoft, fontSize: '0.85rem', marginTop: '4px' }}>Manage your Ride Easy rental business preferences & configurations</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
      
      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* General Business Info */}
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '12px', border: `1px solid ${theme.border}`, transition: 'all 0.3s' }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1rem', marginBottom: '15px' }}>Business General Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Company Name</label>
              <input 
                name="companyName" 
                value={settings.companyName || 'Ride Easy Car & Bike Rental'} 
                onChange={handleSettingsChange} 
                style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Admin Name</label>
              <input 
                name="adminName" 
                value={settings.adminName || 'Tamanna'} 
                onChange={handleSettingsChange} 
                style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} 
              />
            </div>
          </div>
        </div>

        {/* Rental & Fleet Settings */}
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '12px', border: `1px solid ${theme.border}`, transition: 'all 0.3s' }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1rem', marginBottom: '15px' }}>Rental Rules & Extensions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Max Extension Limit</label>
              <input 
                type="number"
                name="maxExtensions" 
                value={settings.maxExtensions || '2'} 
                onChange={handleSettingsChange} 
                style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Default Currency</label>
              <select 
                name="currency"
                value={settings.currency || 'INR'}
                onChange={handleSettingsChange}
                style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.borderStrong}`, color: theme.inputText, borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '12px', border: `1px solid ${theme.border}`, transition: 'all 0.3s' }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1rem', marginBottom: '15px' }}>Rental Notification Triggers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { id: 'notifNewBooking', label: 'New Car/Bike Booking' },
              { id: 'notifReturnDue', label: 'Vehicle Return Due Today' },
              { id: 'notifOverdue', label: 'Overdue Rental Alert' },
              { id: 'notifExtensionReq', label: 'Booking Extension Request' },
              { id: 'notifVerification', label: 'Driver Verification Pending' },
              { id: 'notifCompleted', label: 'Rental Completed' }
            ].map(item => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.textSecondary, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name={item.id}
                  checked={settings[item.id] ?? true}
                  onChange={handleSettingsChange}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* User Preferences / Theme Selection */}
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '12px', border: `1px solid ${theme.border}`, transition: 'all 0.3s' }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1rem', marginBottom: '15px' }}>Dashboard Theme</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* White / Light Theme Radio Option */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '500' }}>
              <input 
                type="radio" 
                name="darkThemeRadio" 
                checked={!settings.darkTheme} 
                onChange={() => handleSettingsChange({ target: { name: 'darkTheme', type: 'checkbox', checked: false } })} 
                style={{ cursor: 'pointer', accentColor: '#2563eb' }} 
              />
              ☀️ White / Light Theme
            </label>

            {/* Dark Theme Radio Option */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '500' }}>
              <input 
                type="radio" 
                name="darkThemeRadio" 
                checked={settings.darkTheme} 
                onChange={() => handleSettingsChange({ target: { name: 'darkTheme', type: 'checkbox', checked: true } })} 
                style={{ cursor: 'pointer', accentColor: '#2563eb' }} 
              />
              🌙 Dark Theme
            </label>

          </div>
        </div>

        {/* Live Rule Preview & Save */}
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', transition: 'all 0.3s' }}>
          <div>
            <h3 style={{ color: theme.textPrimary, fontSize: '1rem', marginBottom: '8px' }}>Active Fleet Status</h3>
            <p style={{ color: theme.textMuted, fontSize: '0.75rem', lineHeight: '1.4' }}>
              Changes are directly synced with your local storage database for <span style={{ color: '#38bdf8' }}>{settings.companyName || 'Ride Easy'}</span>.
            </p>
          </div>
          <button 
            onClick={() => alert('Settings saved to LocalStorage successfully!')} 
            style={{ background: '#2563eb', color: theme.onAccent, border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', width: '100%', transition: 'background 0.2s' }}
          >
            Save Settings
          </button>                                                                                                                                                                                                                                                                                                                                                                     
        </div >
        </div>
      </div>
    </div>
  )}
      </div>
    </div>
  );
}