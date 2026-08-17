import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    bookings: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        customers: Math.min(prev.customers + 50, 5000),
        vehicles: Math.min(prev.vehicles + 2, 220),
        bookings: Math.min(prev.bookings + 500, 50000),
        satisfaction: Math.min(prev.satisfaction + 1, 98),
      }));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const heroStyle = {
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
    padding: '6rem 2rem',
    color: '#fff',
    textAlign: 'center',
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const buttonStyle = {
    padding: '1rem 2.5rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'inline-block',
    cursor: 'pointer',
  };

  const carsButtonStyle = {
    ...buttonStyle,
    background: '#10b981',
    color: '#fff',
  };

  const bikesButtonStyle = {
    ...buttonStyle,
    background: '#f59e0b',
    color: '#fff',
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={heroStyle}>
        <div>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-1px' }}>Welcome to RideHub</h1>
          <p style={{ fontSize: '1.4rem', marginBottom: '1.5rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto 1.5rem' }}>

            Your premium vehicle rental platform. Book cars and bikes instantly with unbeatable prices!
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link 
            to="/cars" 
            style={{...carsButtonStyle, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'}}
          >
            🚗 Browse Cars
          </Link>
          <Link 
            to="/bikes" 
            style={{...bikesButtonStyle, boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'}}
          >
            🏍️ Browse Bikes
          </Link>
        </div>
      </div>

      {/* Affordable Pricing Section */}
      <div style={{ padding: '2rem 1.5rem', background: '#f8f9ff' }}>
        <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem', color: '#1f2937', fontWeight: 'bold' }}>💳 Affordable Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { title: 'Budget Cars', price: 'Rs3,000- 5,000/day', emoji: '🚗', brands: 'Maruti, Hyundai, Tata', link: '/cars' },
            { title: 'Mid-Range', price: 'Rs5,000- 10,000/day', emoji: '🚙', brands: 'Honda, Toyota, BMW', link: '/cars', popular: true },
            { title: 'Luxury', price: 'Rs15,000- 30,000/day', emoji: '🏎️', brands: 'Mercedes, Audi, Tesla', link: '/cars' },
            { title: 'Bikes', price: 'Rs2,500- 7,500/day', emoji: '🏍️', brands: 'All types available', link: '/bikes' },
          ].map((plan, idx) => (
            <div key={idx} style={{ 
              background: '#fff', 
              borderRadius: '12px', 
              padding: '1.2rem', 
              textAlign: 'center', 
              boxShadow: plan.popular ? '0 8px 25px rgba(37, 99, 235, 0.2)' : '0 4px 15px rgba(0,0,0,0.05)',
              border: plan.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  ⭐ Popular
                </div>
              )}
              <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>{plan.emoji}</div>
              <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '0.4rem', fontWeight: '600' }}>{plan.title}</h3>
              <div style={{ fontSize: '1.3rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '0.4rem' }}>{plan.price}</div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.8rem' }}>🏢 {plan.brands}</p>
              <Link to={plan.link} style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', transition: 'all 0.3s ease', fontSize: '0.85rem' }}>
                Book Now →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#1f2937', fontWeight: 'bold' }}>📊 Our Track Record</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'inline-block', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#2563eb', fontWeight: 'bold' }}>{stats.customers.toLocaleString()}+</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500', margin: '0.3rem 0 0 0' }}>Happy Customers</p>
          </div>
          <div style={{ display: 'inline-block', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#2563eb', fontWeight: 'bold' }}>{stats.vehicles}+</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500', margin: '0.3rem 0 0 0' }}>Vehicles Available</p>
          </div>
          <div style={{ display: 'inline-block', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#2563eb', fontWeight: 'bold' }}>{stats.bookings.toLocaleString()}+</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500', margin: '0.3rem 0 0 0' }}>Completed Bookings</p>
          </div>
          <div style={{ display: 'inline-block', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#2563eb', fontWeight: 'bold' }}>{stats.satisfaction}%</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500', margin: '0.3rem 0 0 0' }}>Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '4rem 2rem', background: '#fff' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.8rem', marginBottom: '3rem', color: '#1f2937', fontWeight: 'bold' }}>Why Choose RideHub?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.3rem', color: '#111827' }}>Quick Booking</h3>
            <p style={{ color: '#6b7280' }}>Book in just a few clicks. Fast and hassle-free!</p>
          </div>
          <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
            <h3 style={{ fontSize: '1.3rem', color: '#111827' }}>Best Prices</h3>
            <p style={{ color: '#6b7280' }}>Competitive rates with transparent pricing.</p>
          </div>
          <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.3rem', color: '#111827' }}>Secure & Safe</h3>
            <p style={{ color: '#6b7280' }}>All vehicles insured and well-maintained.</p>
          </div>
          <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.3rem', color: '#111827' }}>Wide Selection</h3>
            <p style={{ color: '#6b7280' }}>200+ vehicles to choose from!</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{ padding: '4rem 2rem', background: '#f9fafb' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.8rem', marginBottom: '3rem', color: '#1f2937', fontWeight: 'bold' }}>⭐ What Our Customers Say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { name: 'Raj Kumar', text: 'Amazing service! Booked a car in 2 minutes. Highly recommended!', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Priya Singh', text: 'Best prices I found. Great customer support and clean vehicles!', rating: '⭐⭐⭐⭐⭐' },
            { name: 'Arjun Patel', text: 'Perfect bike rental experience. Will definitely rent again!', rating: '⭐⭐⭐⭐⭐' },
          ].map((testimonial, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1rem', fontStyle: 'italic' }}>"{testimonial.text}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#111827' }}>{testimonial.name}</strong>
                <span style={{ fontSize: '0.9rem' }}>{testimonial.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '4rem 2rem', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>🎉 Ready to Start Your Journey?</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.95 }}>Join thousands of happy customers renting with us today!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link 
            to="/cars" 
            style={{...buttonStyle, background: '#fff', color: '#667eea', fontWeight: 'bold'}}
          >
            🚗 Explore Cars
          </Link>
          <Link 
            to="/bikes" 
            style={{...buttonStyle, background: '#fff', color: '#667eea', fontWeight: 'bold'}}
          >
            🏍️ Explore Bikes
          </Link>
        </div>
      </div>
    </div>
  );
}