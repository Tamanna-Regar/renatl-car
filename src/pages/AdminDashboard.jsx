import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const usersRes = await fetch('http://127.0.0.1:8000/api/admin/users');
        const usersData = await usersRes.json();
        if (usersData.success) setUsers(usersData.users);

        const carsRes = await fetch('http://127.0.0.1:8000/api/admin/cars');
        const carsData = await carsRes.json();
        if (carsData.success) setCars(carsData.cars);

        const bookingsRes = await fetch('http://127.0.0.1:8000/api/admin/bookings');
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success) setBookings(bookingsData.bookings);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading admin data...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Dashboard</h1>

      <h2>Cars List</h2>
      <table border="1" cellPadding="10" style={{ marginBottom: '20px', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Price Per Day</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? (
            cars.map((car, index) => (
              <tr key={index}>
                <td>{car.name}</td>
                <td>{car.brand}</td>
                <td>{car.price_per_day}</td>
                <td>{car.status}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No cars found</td></tr>
          )}
        </tbody>
      </table>

      <h2>Users List</h2>
      <ul style={{ marginBottom: '20px' }}>
        {users.length > 0 ? (
          users.map((user, index) => (
            <li key={index}>{user.username || user.email}</li>
          ))
        ) : (
          <p>No users found</p>
        )}
      </ul>

      <h2>Bookings List</h2>
      <ul>
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <li key={index}>Booking ID: {booking._id}</li>
          ))
        ) : (
          <p>No bookings found</p>
        )}
      </ul>
    </div>
  );
}

export default AdminDashboard;