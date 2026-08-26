import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Cars from './pages/Cars';
import Bikes from './pages/Bikes';

import Login from './pages/Login';
import Register from './pages/Register';

import Booking from './pages/Booking';
import Payment from './pages/payment';

import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#090d16'
      }}
    >
      {showNavbar && <Navbar />}

      <div
        style={{
          flex: 1
        }}
      >
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