import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfc' }}>
      
      {/* Hero Section */}
      <section style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        padding: '4rem 2rem', 
        background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80") no-repeat center center/cover',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Rent Your Dream Ride Today
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          Explore the best cars and bikes for rent at unbeatable prices. Fast booking, reliable service, and zero hassle.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/cars" style={{ background: '#007bff', color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            Browse Cars
          </Link>
          <Link to="/bikes" style={{ background: '#28a745', color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            Browse Bikes
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', background: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '3rem', fontWeight: 'bold' }}>Why Choose Ride Easy?</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', width: '280px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#007bff' }}>Wide Selection</h3>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>Choose from a massive fleet of high-performance cars and diverse bicycles tailored for your needs.</p>
          </div>

          <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', width: '280px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#28a745' }}>Affordable Pricing</h3>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>Get transparent daily rental rates with no hidden fees and exciting discounts.</p>
          </div>

          <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', width: '280px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#ffc107' }}>Easy Booking</h3>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>Seamless booking history tracking and instant reservations in just a few clicks.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#343a40', color: '#fff', textAlign: 'center', padding: '1.5rem', marginTop: 'auto' }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>&copy; 2026 Ride Easy. All rights reserved.</p>
      </footer>

    </div>
  );
}