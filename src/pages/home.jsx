import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    bookings: 0,
    satisfaction: 0,
  });
  const [tripType, setTripType] = useState('family');
  const [passengers, setPassengers] = useState(4);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [corporateRequest, setCorporateRequest] = useState({
    company_name: '',
    company_email: '',
    contact_person: '',
    gst_number: '',
    vehicle_name: 'Hyundai Creta',
    vehicle_type: 'car',
    start_date: '',
    end_date: '',
    passengers: 4,
    billing_cycle: 'monthly',
    invoice_required: true,
    notes: '',
  });
  const [corporateMessage, setCorporateMessage] = useState('');
  const [fraudRisk, setFraudRisk] = useState(null);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [marketplaceMessage, setMarketplaceMessage] = useState('');
  const [marketplaceRequest, setMarketplaceRequest] = useState({
    owner_name: '',
    owner_email: '',
    vehicle_name: '',
    vehicle_type: 'car',
    city: 'Delhi',
    price_per_day: 2500,
    seats: 4,
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

  const getRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await fetch('http://localhost:8000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_type: tripType,
          passengers,
          duration_days: 3,
          city: 'Delhi',
          budget_per_day: 5000,
        }),
      });

      const data = await response.json();
      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Recommendation fetch failed', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const submitCorporateBooking = async (e) => {
    e.preventDefault();
    setCorporateMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/corporate/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...corporateRequest,
          vehicle_id: String(Date.now()),
          vehicle_name: corporateRequest.vehicle_name,
          vehicle_type: corporateRequest.vehicle_type,
          passengers: Number(corporateRequest.passengers || 4),
          invoice_required: Boolean(corporateRequest.invoice_required),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Corporate request failed');
      }

      setCorporateMessage(`Corporate request approved. Invoice: ${data.booking.invoice_number}. Total: ₹${Number(data.booking.total_amount).toLocaleString('en-IN')}`);
      setCorporateRequest({
        company_name: '',
        company_email: '',
        contact_person: '',
        gst_number: '',
        vehicle_name: 'Hyundai Creta',
        vehicle_type: 'car',
        start_date: '',
        end_date: '',
        passengers: 4,
        billing_cycle: 'monthly',
        invoice_required: true,
        notes: '',
      });

      const riskResponse = await fetch('http://localhost:8000/api/fraud/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: corporateRequest.company_email,
          phone: '9999999999',
          city: 'Delhi',
          vehicle_id: String(Date.now()),
          booking_amount: Number(data.booking.total_amount || 0),
          booking_days: Math.max(1, Math.ceil((new Date(corporateRequest.end_date) - new Date(corporateRequest.start_date)) / 86400000) + 1),
          duplicate_attempts: 0,
          verification_status: 'approved'
        }),
      });

      if (riskResponse.ok) {
        const riskData = await riskResponse.json();
        setFraudRisk(riskData);
      }
    } catch (error) {
      setCorporateMessage(error.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    getRecommendations();
    fetch('http://localhost:8000/api/marketplace/listings')
      .then((response) => response.json())
      .then((data) => setMarketplaceListings(data.listings || []))
      .catch((error) => console.error('Marketplace listings fetch failed', error));
  }, []);

  const submitMarketplaceListing = async (event) => {
    event.preventDefault();
    setMarketplaceMessage('');
    try {
      const response = await fetch('http://localhost:8000/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...marketplaceRequest,
          price_per_day: Number(marketplaceRequest.price_per_day),
          seats: Number(marketplaceRequest.seats),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Listing submission failed');
      setMarketplaceMessage(data.message);
      setMarketplaceRequest({ ...marketplaceRequest, owner_name: '', owner_email: '', vehicle_name: '' });
    } catch (error) {
      setMarketplaceMessage(error.message || 'Listing submission failed');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Welcome to RideHub</h1>
          <p>

            Your premium vehicle rental platform. Book cars and bikes instantly with unbeatable prices!
          </p>
        </div>
        <div className="home-hero-actions">
          <Link 
            to="/cars" 
            className="home-hero-button home-hero-button-cars"
          >
            🚗 Browse Cars
          </Link>
          <Link 
            to="/bikes" 
            className="home-hero-button home-hero-button-bikes"
          >
            🏍️ Browse Bikes
          </Link>
        </div>
      </section>

      <div style={{ padding: '2.5rem 1.5rem', background: '#eef4ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2563eb', fontWeight: '700' }}>AI Recommendation</p>
              <h3 style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#111827', fontWeight: 'bold' }}>Find the best car for your trip</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={tripType} onChange={(e) => setTripType(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', background: '#fff' }}>
                <option value="family">Family trip</option>
                <option value="business">Business</option>
                <option value="weekend">Weekend escape</option>
                <option value="adventure">Adventure</option>
                <option value="city">City drive</option>
              </select>
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', background: '#fff' }}>
                {[1,2,3,4,5,6,7].map(option => (
                  <option key={option} value={option}>{option} passengers</option>
                ))}
              </select>
              <button onClick={getRecommendations} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem 1.2rem', fontWeight: '700', cursor: 'pointer' }}>
                {isLoadingRecommendations ? 'Finding...' : 'Get match'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {recommendations.length > 0 ? (
              recommendations.map((vehicle) => (
                <div key={vehicle.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', boxShadow: '0 8px 22px rgba(37, 99, 235, 0.1)', border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.35rem 0.65rem', borderRadius: '999px', fontWeight: '700', fontSize: '0.72rem' }}>{vehicle.score}/100 match</span>
                    <span style={{ color: '#6b7280', fontWeight: '600', fontSize: '0.8rem' }}>{vehicle.type}</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '700' }}>{vehicle.name}</h4>
                  <p style={{ margin: '0.5rem 0', color: '#4b5563', fontWeight: '600' }}>{vehicle.reason}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827', fontWeight: '700', margin: '0.8rem 0' }}>
                    <span>Rs {Number(vehicle.price_per_day).toLocaleString()}/day</span>
                    <span>{vehicle.seats} seats</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                    {vehicle.features.map((feature, idx) => (
                      <li key={`${vehicle.id}-${idx}`} style={{ color: '#374151', fontSize: '0.9rem' }}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', background: '#fff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', color: '#4b5563' }}>
                {isLoadingRecommendations ? 'Loading recommendations...' : 'Choose your trip type to see smart suggestions.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="marketplace-section">
        <div className="marketplace-container">
          <p className="marketplace-eyebrow">Digital Fleet Marketplace</p>
          <h3 className="marketplace-title">Rent unique vehicles from local owners</h3>
          <div className="marketplace-grid">
            {marketplaceListings.length > 0 ? marketplaceListings.map((listing, index) => (
              <div className="marketplace-card" key={`${listing.vehicle_name}-${index}`}>
                <span className="marketplace-card-meta">{listing.city} · {listing.vehicle_type}</span>
                <h4>{listing.vehicle_name}</h4>
                <div className="marketplace-card-footer">
                  <span>₹{Number(listing.price_per_day).toLocaleString('en-IN')}/day</span>
                  <span>{listing.seats} seats</span>
                </div>
              </div>
            )) : (
              <div className="marketplace-empty">No owner listings are approved yet. Be the first to list your vehicle.</div>
            )}
          </div>
          <form onSubmit={submitMarketplaceListing} className="marketplace-form">
            <input placeholder="Owner name" value={marketplaceRequest.owner_name} onChange={(e) => setMarketplaceRequest({ ...marketplaceRequest, owner_name: e.target.value })} required />
            <input type="email" placeholder="Owner email" value={marketplaceRequest.owner_email} onChange={(e) => setMarketplaceRequest({ ...marketplaceRequest, owner_email: e.target.value })} required />
            <input placeholder="Vehicle name" value={marketplaceRequest.vehicle_name} onChange={(e) => setMarketplaceRequest({ ...marketplaceRequest, vehicle_name: e.target.value })} required />
            <input placeholder="City" value={marketplaceRequest.city} onChange={(e) => setMarketplaceRequest({ ...marketplaceRequest, city: e.target.value })} required />
            <input type="number" min="1" placeholder="Price/day" value={marketplaceRequest.price_per_day} onChange={(e) => setMarketplaceRequest({ ...marketplaceRequest, price_per_day: e.target.value })} required />
            <button type="submit">List my vehicle</button>
            {marketplaceMessage && <div className="marketplace-message">{marketplaceMessage}</div>}
          </form>
        </div>
      </section>

      <div style={{ padding: '2.5rem 1.5rem', background: '#111827' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7dd3fc', fontWeight: '700' }}>Corporate Rentals</p>
              <h3 style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#fff', fontWeight: 'bold' }}>Business fleet made simple</h3>
            </div>
          </div>

          <form onSubmit={submitCorporateBooking} style={{ background: '#1f2937', borderRadius: '18px', padding: '1.3rem', border: '1px solid #374151', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', color: '#fff' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Company name</label>
              <input value={corporateRequest.company_name} onChange={(e) => setCorporateRequest({ ...corporateRequest, company_name: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Company email</label>
              <input type="email" value={corporateRequest.company_email} onChange={(e) => setCorporateRequest({ ...corporateRequest, company_email: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Contact person</label>
              <input value={corporateRequest.contact_person} onChange={(e) => setCorporateRequest({ ...corporateRequest, contact_person: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>GST number</label>
              <input value={corporateRequest.gst_number} onChange={(e) => setCorporateRequest({ ...corporateRequest, gst_number: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Vehicle</label>
              <select value={corporateRequest.vehicle_name} onChange={(e) => setCorporateRequest({ ...corporateRequest, vehicle_name: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }}>
                <option>Hyundai Creta</option>
                <option>Maruti Swift</option>
                <option>Innova Crysta</option>
                <option>Mahindra Thar</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Vehicle type</label>
              <select value={corporateRequest.vehicle_type} onChange={(e) => setCorporateRequest({ ...corporateRequest, vehicle_type: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Start date</label>
              <input type="date" value={corporateRequest.start_date} onChange={(e) => setCorporateRequest({ ...corporateRequest, start_date: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>End date</label>
              <input type="date" value={corporateRequest.end_date} onChange={(e) => setCorporateRequest({ ...corporateRequest, end_date: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Passengers</label>
              <input type="number" min="1" value={corporateRequest.passengers} onChange={(e) => setCorporateRequest({ ...corporateRequest, passengers: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Billing cycle</label>
              <select value={corporateRequest.billing_cycle} onChange={(e) => setCorporateRequest({ ...corporateRequest, billing_cycle: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff' }}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Notes</label>
              <textarea value={corporateRequest.notes} onChange={(e) => setCorporateRequest({ ...corporateRequest, notes: e.target.value })} rows="3" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '10px', border: '1px solid #4b5563', background: '#111827', color: '#fff', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#e2e8f0', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={corporateRequest.invoice_required} onChange={(e) => setCorporateRequest({ ...corporateRequest, invoice_required: e.target.checked })} />
                Need invoice / GST billing
              </label>
              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem 1.4rem', fontWeight: '700', cursor: 'pointer' }}>Submit corporate request</button>
            </div>
            {corporateMessage && (
              <div style={{ gridColumn: '1 / -1', color: '#d1fae5', background: '#064e3b', border: '1px solid #10b981', borderRadius: '10px', padding: '0.8rem 1rem' }}>{corporateMessage}</div>
            )}
            {fraudRisk && (
              <div style={{ gridColumn: '1 / -1', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.6rem' }}>
                  <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>Fraud Risk Engine</h4>
                  <span style={{ background: fraudRisk.verdict === 'high' ? '#7f1d1d' : fraudRisk.verdict === 'medium' ? '#78350f' : '#064e3b', color: '#fff', borderRadius: '999px', padding: '0.3rem 0.7rem', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>{fraudRisk.verdict}</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.6rem' }}>Risk score: <strong style={{ color: '#fff' }}>{fraudRisk.risk_score}/100</strong></div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.6rem' }}>Action: <strong style={{ color: '#fff' }}>{fraudRisk.action}</strong></div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', display: 'grid', gap: '0.35rem' }}>
                  {fraudRisk.reasons.map((reason, index) => (
                    <li key={`${reason}-${index}`}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </form>
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
            className="home-cta-button"
          >
            🚗 Explore Cars
          </Link>
          <Link 
            to="/bikes" 
            className="home-cta-button"
          >
            🏍️ Explore Bikes
          </Link>
        </div>
      </div>
    </div>
  );
}