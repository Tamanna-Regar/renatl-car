import { Link } from 'react-router-dom';

export default function Bikes() {
  const bikesList = [
    { id: 1, name: 'Mountain Bike', price: 'Rs 3,320/day', image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg' },
    { id: 2, name: 'Road Bike', price: 'Rs 2,905/day', image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg' },
    { id: 3, name: 'Hybrid Bike', price: 'Rs 3,735/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 4, name: 'Electric Bike', price: 'Rs 4,980/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 5, name: 'Folding Bike', price: 'Rs 4,150/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 6, name: 'Cruiser Bike', price: 'Rs 4,565/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 7, name: 'BMX Bike', price: 'Rs 2,490/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 8, name: 'Touring Bike', price: 'Rs 5,395/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 9, name: 'City Bike', price: 'Rs 3,320/day', image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg' },
    { id: 10, name: 'Adventure Bike', price: 'Rs 5,810/day', image: 'https://m.media-amazon.com/images/I/61oQBuwOaXL._SX522_.jpg' },
    { id: 11, name: 'Gravel Bike', price: 'Rs 3,984/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 12, name: 'Fat Bike', price: 'Rs 6,225/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 13, name: 'Dirt Bike', price: 'Rs 4,565/day', image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg' },
    { id: 14, name: 'Fixed Gear Bike', price: 'Rs 2,656/day', image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg' },
    { id: 15, name: 'Tandem Bike', price: 'Rs 6,640/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 16, name: 'Recumbent Bike', price: 'Rs 4,814/day', image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg' },
    { id: 17, name: 'Cargo Bike', price: 'Rs 5,976/day', image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg' },
    { id: 18, name: 'Commuter Bike', price: 'Rs 3,486/day', image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg' },
    { id: 19, name: 'Sport Bike', price: 'Rs 5,644/day', image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg' },
    { id: 20, name: 'Single Speed Bike', price: 'Rs 2,324/day', image: 'https://m.media-amazon.com/images/I/61oQBuwOaXL._SX522_.jpg' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Available Bikes for Rent</h2>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {bikesList.map((bike) => (
          <div key={bike.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#fff' }}>
            <img src={bike.image} alt={bike.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>{bike.name}</h3>
            <p style={{ color: 'green', fontWeight: 'bold' }}>{bike.price}</p>
            <Link to={`/booking/${bike.id}`} style={{ display: 'inline-block', marginTop: '10px', padding: '0.5rem 1rem', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>Rent Now</Link>
          </div>
        ))}
      </div>
    </div>
  );
}