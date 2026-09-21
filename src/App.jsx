import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/home';
import Cars from './pages/cars';
import Bikes from './pages/Bikes';

import Login from './pages/Login';
import Register from './pages/Register';

import Booking from './pages/Booking';
import Payment from './pages/payment';

import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import DamageReport from './pages/DamageReport';
import Inspection from './pages/Inspection';

import AdminDashboard from './pages/AdminDashboard';

function Layout() {
  const location = useLocation();

  const hideNavbarPaths = [
    '/admin',
    '/login',
    '/register'
  ];

  const showNavbar =
    !hideNavbarPaths.some((path) =>
      location.pathname.startsWith(path)
    );

  return (
    <div className="app-shell">
      {showNavbar && <Navbar />}

      <div style={{ flex: 1 }}>
        <Routes>

          {/* HOME */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/home"
            element={<Home />}
          />

          <Route
            path="/landing"
            element={<Home />}
          />

          {/* VEHICLES */}
          <Route
            path="/cars"
            element={<Cars />}
          />

          <Route
            path="/bikes"
            element={<Bikes />}
          />

          {/* AUTH */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* BOOKING */}
          <Route
            path="/booking/:type/:id"
            element={<Booking />}
          />

          {/* PAYMENT */}
          <Route
            path="/payment"
            element={<Payment />}
          />

          {/* MY BOOKINGS */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute requiredRole="user">
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* WALLET */}
          <Route
            path="/wallet"
            element={
              <ProtectedRoute requiredRole="user">
                <Wallet />
              </ProtectedRoute>
            }
          />

          {/* DAMAGE REPORT */}
          <Route
            path="/damage-report/:bookingId"
            element={
              <ProtectedRoute requiredRole="user">
                <DamageReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspection/:bookingId"
            element={
              <ProtectedRoute requiredRole="user">
                <Inspection />
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;