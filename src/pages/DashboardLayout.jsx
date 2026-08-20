import React, { useState } from 'react';
import TaskList from './TaskList'; // Niche di gayi task list file
// Baaki components bhi yahan import kar sakti hain

function DashboardLayout() {
  const [activeMenu, setActiveMenu] = useState('taskList');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19', color: '#94a3b8', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <div style={{ width: '260px', background: '#111827', borderRight: '1px solid #1f2937', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <div style={{ background: '#2563eb', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>📋</div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', margin: 0 }}>TASK MANAGEMENT</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Delegation & Checklist</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>DASHBOARD</div>
          <button onClick={() => setActiveMenu('dashboard')} style={navBtnStyle(activeMenu === 'dashboard')}>📊 Dashboard</button>

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', margin: '15px 0 10px 0' }}>TASK MANAGEMENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button onClick={() => setActiveMenu('taskList')} style={navBtnStyle(activeMenu === 'taskList')}>📄 Task List</button>
            <button onClick={() => setActiveMenu('calendar')} style={navBtnStyle(activeMenu === 'calendar')}>📅 Calendar</button>
            <button onClick={() => setActiveMenu('delegation')} style={navBtnStyle(activeMenu === 'delegation')}>👥 Delegation</button>
            <button onClick={() => setActiveMenu('checklist')} style={navBtnStyle(activeMenu === 'checklist')}>✅ Check List</button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', margin: '15px 0 10px 0' }}>REPORTS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button onClick={() => setActiveMenu('reports')} style={navBtnStyle(activeMenu === 'reports')}>📈 Reports</button>
            <button onClick={() => setActiveMenu('extensionReport')} style={navBtnStyle(activeMenu === 'extensionReport')}>📑 Extension Report</button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', margin: '15px 0 10px 0' }}>PERFORMANCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button onClick={() => setActiveMenu('userPerf')} style={navBtnStyle(activeMenu === 'userPerf')}>⭐ User Performance</button>
            <button onClick={() => setActiveMenu('deptPerf')} style={navBtnStyle(activeMenu === 'deptPerf')}>🏢 Department Performance</button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', margin: '15px 0 10px 0' }}>MANAGEMENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button onClick={() => setActiveMenu('users')} style={navBtnStyle(activeMenu === 'users')}>👤 Users</button>
            <button onClick={() => setActiveMenu('departments')} style={navBtnStyle(activeMenu === 'departments')}>🏬 Departments</button>
          </div>
        </div>

        <button style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '10px 12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Logout</button>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {activeMenu === 'taskList' && <TaskList />}
        {activeMenu === 'dashboard' && <div style={{ color: '#fff' }}>Dashboard Component View...</div>}
        {activeMenu === 'users' && <div style={{ color: '#fff' }}>Users Management Component View...</div>}
        {/* Baaki components ke liye bhi aise hi conditions laga sakti hain */}
      </div>

    </div>
  );
}

// Sidebar Button Helper Style
const navBtnStyle = (isActive) => ({
  width: '100%',
  background: isActive ? '#2563eb' : 'transparent',
  color: isActive ? '#fff' : '#94a3b8',
  border: 'none',
  padding: '10px 12px',
  borderRadius: '6px',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: isActive ? '500' : 'normal'
});

export default DashboardLayout;