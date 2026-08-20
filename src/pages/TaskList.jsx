import React, { useState } from 'react';

export default function TaskList() {
  const [taskFilter, setTaskFilter] = useState('all');

  const tasks = [
    { id: 1, title: 'Performance Review Prep', dept: 'Sales', type: 'Delegation', freq: 'One Time', assigned: 'Rohit Gupta', initials: 'RG', dueDate: '12 May', status: 'Done', days: '0' },
    { id: 2, title: 'Monthly Payroll Processing', dept: 'HR', type: 'Check List', freq: 'Monthly', assigned: 'Priya Singh', initials: 'PS', dueDate: '13 May', status: 'Done', days: '0' },
    { id: 3, title: 'Yearly Budget Planning', dept: 'Finance', type: 'Check List', freq: 'Yearly', assigned: 'Neha Verma', initials: 'NV', dueDate: '13 May', status: '5+ Days', days: '+5' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '25px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 5px 0' }}>Task List</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Manage delegated tasks and one-time checklists</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'pending', 'completed', 'overdue', 'upcoming'].map((tab) => (
            <button key={tab} onClick={() => setTaskFilter(tab)} style={{ background: taskFilter === tab ? '#2563eb' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>
        <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Task</button>
      </div>

      <div style={{ background: '#111827', borderRadius: '10px', border: '1px solid #1f2937', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '15px' }}>#</th>
              <th style={{ padding: '15px' }}>Task</th>
              <th style={{ padding: '15px' }}>Department</th>
              <th style={{ padding: '15px' }}>Type</th>
              <th style={{ padding: '15px' }}>Frequency</th>
              <th style={{ padding: '15px' }}>Assigned To</th>
              <th style={{ padding: '15px' }}>Due Date</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #1f2937', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <td style={{ padding: '15px' }}>{t.id}</td>
                <td style={{ padding: '15px', color: '#fff', fontWeight: '500' }}>{t.title}</td>
                <td style={{ padding: '15px' }}>{t.dept}</td>
                <td style={{ padding: '15px' }}><span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>{t.type}</span></td>
                <td style={{ padding: '15px' }}>{t.freq}</td>
                <td style={{ padding: '15px' }}>{t.assigned}</td>
                <td style={{ padding: '15px' }}>{t.dueDate}</td>
                <td style={{ padding: '15px' }}><span style={{ background: t.status === 'Done' ? '#065f46' : '#7f1d1d', color: t.status === 'Done' ? '#34d399' : '#f87171', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}