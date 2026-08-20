import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div style={{ width: '260px', background: '#0e1424', borderRight: '1px solid #1e293b', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100vh', boxSizing: 'border-box' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
          <div style={{ background: '#2563eb', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>📋</div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '0.95rem', margin: 0 }}>TASK MANAGEMENT</h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Delegation & Checklist</span>
          </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>DASHBOARD</div>
        <button onClick={() => setActiveTab('dashboard')} style={navBtn(activeTab === 'dashboard')}>📊 Dashboard</button>

        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', margin: '15px 0 8px 0' }}>TASK MANAGEMENT</div>
        <button onClick={() => setActiveTab('tasks')} style={navBtn(activeTab === 'tasks')}>📝 Task List</button>
        <button onClick={() => setActiveTab('calendar')} style={navBtn(activeTab === 'calendar')}>📅 Calendar</button>

        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', margin: '15px 0 8px 0' }}>MANAGEMENT</div>
        <button onClick={() => setActiveTab('settings')} style={navBtn(activeTab === 'settings')}>⚙️ Settings</button>
      </div>

      <button style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '8px 10px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Logout</button>
    </div>
  );
}

const navBtn = (isActive) => ({
  width: '100%',
  background: isActive ? '#2563eb' : 'transparent',
  color: isActive ? '#fff' : '#94a3b8',
  border: 'none',
  padding: '8px 10px',
  borderRadius: '6px',
  textAlign: 'left',
  cursor: 'pointer',
  marginBottom: '4px',
  fontSize: '0.85rem'
});