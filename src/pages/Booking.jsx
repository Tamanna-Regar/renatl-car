import { useParams } from 'react-router-dom';

export default function Booking() {
  const { id } = useParams();

  return (
    <div style={{ padding: '3rem', maxWidth: '500px', margin: 'auto' }}>
      <h2>Complete Your Booking (Vehicle ID: {id})</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <label>Start Date:</label>
        <input type="date" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <label>End Date:</label>
        <input type="date" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <button type="submit" style={{ padding: '0.8rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Confirm Booking & Pay</button>
      </form>
    </div>
  );
}