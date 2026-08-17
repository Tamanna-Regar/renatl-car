import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cars from './pages/Cars';
import Bikes from './pages/Bikes';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/bikes" element={<Bikes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;