import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000';

// Points → Rupees conversion
const POINTS_TO_RS = 1; // 1 point = Rs 1

function HistoryBadge({ type }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
      background: type === 'credit' ? '#dcfce7' : '#fee2e2',
      color: type === 'credit' ? '#166534' : '#991b1b',
    }}>
      {type === 'credit' ? '+ Earned' : '- Used'}
    </span>
  );
}

export default function Wallet() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [loyalty, setLoyalty] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email || '';

  // ── LOAD WALLET ────────────────────────────────────────────
  const loadWallet = async () => {
    setLoading(true);
    // Load from localStorage first (instant)
    try {
      const local = JSON.parse(localStorage.getItem(`wallet_${userEmail}`) || '{"points":0,"history":[]}');
      setPoints(local.points || 0);
      setHistory(local.history || []);
    } catch (_) {}

    // Then try backend
    try {
      if (userEmail) {
        const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(userEmail)}/wallet`);
        const data = await res.json();
        if (data.success) {
          setPoints(data.points || 0);
          setHistory(data.history || []);
          localStorage.setItem(`wallet_${userEmail}`, JSON.stringify({ points: data.points, history: data.history }));
        }
        const loyaltyResponse = await fetch(`${API_URL}/api/users/${encodeURIComponent(userEmail)}/loyalty`);
        const loyaltyData = await loyaltyResponse.json();
        if (loyaltyResponse.ok && loyaltyData.success) setLoyalty(loyaltyData);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadWallet();
  }, [userEmail]);

  // ── MOCK: EARN POINTS (for demo — in real app this happens after payment) ──
  const handleEarnDemo = () => {
    const earned = 100;
    const entry = { type: 'credit', points: earned, reason: 'Booking completed (Demo)', date: new Date().toISOString() };
    const newPoints = points + earned;
    const newHistory = [entry, ...history];
    setPoints(newPoints);
    setHistory(newHistory);
    localStorage.setItem(`wallet_${userEmail}`, JSON.stringify({ points: newPoints, history: newHistory }));

    // Backend
    fetch(`${API_URL}/api/users/${encodeURIComponent(userEmail)}/wallet/credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: earned, reason: 'Booking completed (Demo)' }),
    }).catch(() => {});
  };

  // ── REDEEM POINTS ───────────────────────────────────────────
  const handleRedeem = () => {
    const amt = parseInt(redeemInput);
    if (!amt || amt <= 0) { setRedeemMsg('Please enter valid points!'); return; }
    if (amt > points) { setRedeemMsg('Insufficient points!'); return; }

    const entry = { type: 'debit', points: amt, reason: 'Points redeemed for discount', date: new Date().toISOString() };
    const newPoints = points - amt;
    const newHistory = [entry, ...history];
    setPoints(newPoints);
    setHistory(newHistory);
    localStorage.setItem(`wallet_${userEmail}`, JSON.stringify({ points: newPoints, history: newHistory }));

    setRedeemMsg(`✅ Redeemed ${amt} points = Rs ${amt * POINTS_TO_RS} discount!`);
    setRedeemInput('');

    fetch(`${API_URL}/api/users/${encodeURIComponent(userEmail)}/wallet/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: amt }),
    }).catch(() => {});

    setTimeout(() => setRedeemMsg(''), 3000);
  };

  return (
    <main className="wallet-page">
      <div className="wallet-container">
      {/* BACK BUTTON */}
      <Link to="/my-bookings" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1.5rem' }}>
        ← Back to My Bookings
      </Link>

      {/* HEADER */}
      <h2 style={{ margin: '0 0 4px', color: '#111827', fontSize: '1.8rem' }}>💰 My Wallet</h2>
      <p style={{ margin: '0 0 2rem', color: '#6b7280' }}>Earn points on every booking, redeem for discounts</p>

      {loyalty && (
        <div style={{ background: 'linear-gradient(135deg, #0f766e, #115e59)', borderRadius: '14px', padding: '1.25rem', color: '#fff', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(15,118,110,0.22)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 4px', opacity: 0.8, fontSize: '0.78rem' }}>RideHub Loyalty Tier</p>
              <h3 style={{ margin: 0, fontSize: '1.45rem' }}>{loyalty.tier} Member</h3>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{loyalty.points_multiplier}x points</div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>{loyalty.benefits}</p>
          <p style={{ margin: '8px 0 0', fontSize: '0.8rem', opacity: 0.75 }}>Completed rentals: {loyalty.completed_bookings}</p>
        </div>
      )}

      {/* POINTS CARD */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius: '16px', padding: '2rem',
        color: '#fff', marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(79,70,229,0.3)',
      }}>
        <p style={{ margin: '0 0 8px', opacity: 0.85, fontSize: '0.875rem', fontWeight: '500' }}>Available Points</p>
        <h1 style={{ margin: '0 0 4px', fontSize: '3rem', fontWeight: '800', letterSpacing: '-1px' }}>
          {loading ? '...' : points.toLocaleString()}
        </h1>
        <p style={{ margin: '0', opacity: 0.75, fontSize: '0.8rem' }}>
          = Rs {(points * POINTS_TO_RS).toLocaleString()} discount value
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 16px', flex: 1, minWidth: '120px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11px', opacity: 0.8 }}>Total Earned</p>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
              {history.filter(h => h.type === 'credit').reduce((s, h) => s + h.points, 0).toLocaleString()}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 16px', flex: 1, minWidth: '120px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11px', opacity: 0.8 }}>Total Used</p>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
              {history.filter(h => h.type === 'debit').reduce((s, h) => s + h.points, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* HOW TO EARN */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#111827' }}>🎯 How to Earn Points</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { icon: '🚗', text: 'Complete a booking', pts: '+100 pts' },
            { icon: '⭐', text: 'Write a review', pts: '+20 pts' },
            { icon: '👥', text: 'Refer a friend', pts: '+50 pts' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, minWidth: '140px', background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '0.78rem', color: '#6b7280' }}>{item.text}</p>
                <p style={{ margin: 0, fontWeight: '700', color: '#7c3aed', fontSize: '0.875rem' }}>{item.pts}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Demo Button */}
        <button
          onClick={handleEarnDemo}
          style={{ marginTop: '12px', padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
        >
          + Earn 100 Demo Points
        </button>
      </div>

      {/* REDEEM SECTION */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#111827' }}>💸 Redeem Points</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            max={points}
            placeholder={`Max: ${points} pts`}
            value={redeemInput}
            onChange={(e) => setRedeemInput(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '0.9rem', outline: 'none' }}
          />
          <button
            onClick={handleRedeem}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', whiteSpace: 'nowrap' }}
          >
            Redeem
          </button>
        </div>
        {redeemInput && parseInt(redeemInput) > 0 && parseInt(redeemInput) <= points && (
          <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#059669' }}>
            This will give you Rs {parseInt(redeemInput) * POINTS_TO_RS} discount on your next booking
          </p>
        )}
        {redeemMsg && (
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: redeemMsg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: '600' }}>
            {redeemMsg}
          </p>
        )}
      </div>

      {/* HISTORY */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#111827' }}>📋 Points History</h3>
        {history.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '1.5rem 0' }}>No transactions yet. Complete a booking to earn points!</p>
        ) : (
          history.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{item.type === 'credit' ? '🟢' : '🔴'}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '0.875rem', color: '#111827' }}>{item.reason}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryBadge type={item.type} />
                <span style={{ fontWeight: '700', color: item.type === 'credit' ? '#059669' : '#dc2626', fontSize: '0.95rem' }}>
                  {item.type === 'credit' ? '+' : '-'}{item.points} pts
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </main>
  );
}
