import { Link } from 'react-router-dom';

export default function Cars() {
  const fallbackCarImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop&auto=format&q=80';

  const carsList = [
    { id: 1, name: 'Maruti Dzire', price: 'Rs 3,320/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 2, name: 'Hyundai Verna', price: 'Rs 3,735/day', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 3, name: 'Hyundai Aura', price: 'Rs 3,320/day', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 4, name: 'Maruti Swift', price: 'Rs 2,905/day', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 5, name: 'BMW M5', price: 'Rs 16,600/day', image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 6, name: 'Honda City', price: 'Rs 4,150/day', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 7, name: 'Honda Amaze', price: 'Rs 3,735/day', image: 'https://images.unsplash.com/photo-1533473359331-35ac8b3fd8cb?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 8, name: 'Toyota Camry', price: 'Rs 4,980/day', image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 9, name: 'Maruti Ciaz', price: 'Rs 4,150/day', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 10, name: 'BMW i7', price: 'Rs 24,900/day', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 11, name: 'Mercedes-Benz E-Class', price: 'Rs 29,050/day', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 12, name: 'Tata Tigor', price: 'Rs 3,320/day', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 13, name: 'Kia Seltos', price: 'Rs 4,565/day', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 14, name: 'Skoda Slavia', price: 'Rs 5,395/day', image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 15, name: 'Volkswagen Polo', price: 'Rs 3,984/day', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 16, name: 'Audi A4', price: 'Rs 23,240/day', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 17, name: 'Tesla Model 3', price: 'Rs 20,750/day', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 18, name: 'Mahindra XUV700', price: 'Rs 6,225/day', image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 19, name: 'Jeep Compass', price: 'Rs 5,810/day', image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&h=300&fit=crop&auto=format&q=80' },
    { id: 20, name: 'Toyota Fortuner', price: 'Rs 7,055/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&auto=format&q=80' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Available Cars for Rent</h2>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {carsList.map((car) => (
          <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: '#fff' }}>
            <img
              src={car.image}
              alt={car.name}
              onError={(event) => {
                event.target.src = fallbackCarImage;
              }}
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>{car.name}</h3>
            <p style={{ color: 'green', fontWeight: 'bold' }}>{car.price}</p>
            <Link to={`/booking/${car.id}`} style={{ display: 'inline-block', marginTop: '10px', padding: '0.5rem 1rem', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>Rent Now</Link>
          </div>
        ))}
      </div>
    </div>
  );
}