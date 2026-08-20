import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const carsList = [
  { id: 1, name: 'Sedan Comfort', price: 'Rs 4,980/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Sedan 2024', rating: '4.5', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 2, name: 'SUV Luxury', price: 'Rs 8,300/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'SUV Pro', rating: '4.8', fuel: 'Diesel', seats: '7 Seats', transmission: 'Automatic' } },
  { id: 3, name: 'Hatchback City', price: 'Rs 3,320/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'City Hatch', rating: '4.2', fuel: 'Petrol', seats: '5 Seats', transmission: 'Manual' } },
  { id: 4, name: 'Electric Cruiser', price: 'Rs 7,470/day', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60', specs: { model: 'EV Model 3', rating: '4.7', fuel: 'Electric', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 5, name: 'Sports Coupe', price: 'Rs 9,960/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Coupe GT', rating: '4.9', fuel: 'Petrol', seats: '2 Seats', transmission: 'Automatic' } },
  { id: 6, name: 'Family MPV', price: 'Rs 6,640/day', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&auto=format&fit=crop&q=60', specs: { model: 'Family Space', rating: '4.3', fuel: 'Diesel', seats: '7 Seats', transmission: 'Manual' } },
  { id: 7, name: 'Compact SUV', price: 'Rs 5,810/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Mini SUV', rating: '4.4', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 8, name: 'Luxury Sedan', price: 'Rs 11,620/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Executive Class', rating: '4.9', fuel: 'Hybrid', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 9, name: 'Off-Road Jeep', price: 'Rs 7,880/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Wrangler X', rating: '4.6', fuel: 'Diesel', seats: '4 Seats', transmission: 'Manual' } },
  { id: 10, name: 'Convertible Spyder', price: 'Rs 12,450/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Spyder 911', rating: '4.9', fuel: 'Petrol', seats: '2 Seats', transmission: 'Automatic' } },
  { id: 11, name: 'Crossover Pro', price: 'Rs 6,225/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Cross 300', rating: '4.4', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 12, name: 'Hybrid Hatchback', price: 'Rs 3,984/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'EcoHybrid', rating: '4.3', fuel: 'Hybrid', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 13, name: 'Full-Size SUV', price: 'Rs 9,545/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Titan 8', rating: '4.7', fuel: 'Diesel', seats: '8 Seats', transmission: 'Automatic' } },
  { id: 14, name: 'City Mini', price: 'Rs 2,490/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'Polo Lite', rating: '4.1', fuel: 'Petrol', seats: '4 Seats', transmission: 'Manual' } },
  { id: 15, name: 'Executive Limo', price: 'Rs 20,750/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Stretch 500', rating: '4.9', fuel: 'Petrol', seats: '8 Seats', transmission: 'Automatic' } },
  { id: 16, name: 'Performance Hatch', price: 'Rs 5,395/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'Hot Hatch', rating: '4.6', fuel: 'Petrol', seats: '5 Seats', transmission: 'Manual' } },
  { id: 17, name: 'Electric SUV', price: 'Rs 8,715/day', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60', specs: { model: 'Tesla Model Y', rating: '4.8', fuel: 'Electric', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 18, name: 'Vintage Classic', price: 'Rs 14,110/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Retro 1969', rating: '4.8', fuel: 'Petrol', seats: '4 Seats', transmission: 'Manual' } },
  { id: 19, name: 'Pickup Truck', price: 'Rs 6,640/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Hauler Pro', rating: '4.5', fuel: 'Diesel', seats: '5 Seats', transmission: 'Manual' } },
  { id: 20, name: 'Muscle Car', price: 'Rs 9,130/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'V8 Beast', rating: '4.7', fuel: 'Petrol', seats: '4 Seats', transmission: 'Automatic' } },
  { id: 21, name: 'Station Wagon', price: 'Rs 4,565/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'Estate 2023', rating: '4.2', fuel: 'Diesel', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 22, name: 'Supercar GT', price: 'Rs 24,900/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Viper GT', rating: '5.0', fuel: 'Petrol', seats: '2 Seats', transmission: 'Automatic' } },
  { id: 23, name: 'Eco Sedan', price: 'Rs 3,735/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'GreenDrive', rating: '4.1', fuel: 'Hybrid', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 24, name: 'Rugged 4x4', price: 'Rs 8,300/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Safari Pro', rating: '4.7', fuel: 'Diesel', seats: '5 Seats', transmission: 'Manual' } },
  { id: 25, name: 'Micro Electric', price: 'Rs 2,905/day', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60', specs: { model: 'Volt Mini', rating: '4.0', fuel: 'Electric', seats: '2 Seats', transmission: 'Automatic' } },
  { id: 26, name: 'Luxury Coupe', price: 'Rs 13,280/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Gran Coupe', rating: '4.9', fuel: 'Petrol', seats: '4 Seats', transmission: 'Automatic' } },
  { id: 27, name: 'Basic Sedan', price: 'Rs 3,320/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Sedan Basic', rating: '4.0', fuel: 'Petrol', seats: '5 Seats', transmission: 'Manual' } },
  { id: 28, name: 'Urban Crossover', price: 'Rs 5,395/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Urban Cross', rating: '4.3', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 29, name: 'Delivery Van', price: 'Rs 4,980/day', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&auto=format&fit=crop&q=60', specs: { model: 'Cargo Van', rating: '4.1', fuel: 'Diesel', seats: '3 Seats', transmission: 'Manual' } },
  { id: 30, name: 'Hybrid SUV', price: 'Rs 8,715/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Hybrid X', rating: '4.6', fuel: 'Hybrid', seats: '7 Seats', transmission: 'Automatic' } },
  { id: 31, name: 'Rally Car', price: 'Rs 10,375/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'RallySpec', rating: '4.8', fuel: 'Petrol', seats: '2 Seats', transmission: 'Manual' } },
  { id: 32, name: 'Subcompact Hatch', price: 'Rs 2,822/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'Sub Hatch', rating: '4.0', fuel: 'Petrol', seats: '5 Seats', transmission: 'Manual' } },
  { id: 33, name: 'Executive Hybrid', price: 'Rs 9,960/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Exec Hybrid', rating: '4.8', fuel: 'Hybrid', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 34, name: 'Electric Hatchback', price: 'Rs 5,810/day', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60', specs: { model: 'Volt Hatch', rating: '4.5', fuel: 'Electric', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 35, name: 'Heavy Pickup', price: 'Rs 7,470/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Heavy Duty', rating: '4.4', fuel: 'Diesel', seats: '5 Seats', transmission: 'Manual' } },
  { id: 36, name: 'Classic Roadster', price: 'Rs 11,205/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Roadster 60s', rating: '4.7', fuel: 'Petrol', seats: '2 Seats', transmission: 'Manual' } },
  { id: 37, name: 'Midsize Sedan', price: 'Rs 4,150/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Mid Sedan', rating: '4.3', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 38, name: 'Luxury Crossover', price: 'Rs 10,375/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Lux Cross', rating: '4.8', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 39, name: 'City Van', price: 'Rs 5,395/day', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&auto=format&fit=crop&q=60', specs: { model: 'Mini Van', rating: '4.2', fuel: 'Diesel', seats: '6 Seats', transmission: 'Manual' } },
  { id: 40, name: 'Sports Sedan', price: 'Rs 7,880/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Sport Sedan', rating: '4.6', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 41, name: 'Ultra Luxury SUV', price: 'Rs 18,260/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Apex SUV', rating: '4.9', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 42, name: 'Track Special', price: 'Rs 22,410/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Track 1', rating: '5.0', fuel: 'Petrol', seats: '2 Seats', transmission: 'Automatic' } },
  { id: 43, name: 'Family Crossover', price: 'Rs 6,225/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Family Cross', rating: '4.4', fuel: 'Hybrid', seats: '7 Seats', transmission: 'Automatic' } },
  { id: 44, name: 'Electric Crossover', price: 'Rs 7,880/day', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60', specs: { model: 'EV Cross', rating: '4.7', fuel: 'Electric', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 45, name: 'Budget Hatchback', price: 'Rs 2,490/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'Budget Hatch', rating: '3.9', fuel: 'Petrol', seats: '5 Seats', transmission: 'Manual' } },
  { id: 46, name: 'Premium Station Wagon', price: 'Rs 6,640/day', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60', specs: { model: 'Prem Wagon', rating: '4.5', fuel: 'Diesel', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 47, name: 'Compact Pickup', price: 'Rs 5,395/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60', specs: { model: 'Mini Truck', rating: '4.2', fuel: 'Diesel', seats: '4 Seats', transmission: 'Manual' } },
  { id: 48, name: 'Luxury Hybrid Sedan', price: 'Rs 12,035/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'Lux Hybrid', rating: '4.9', fuel: 'Hybrid', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 49, name: 'City Cruiser', price: 'Rs 3,735/day', image: 'https://images.unsplash.com/photo-1550355191-aa80b153982c?w=500&auto=format&fit=crop&q=60', specs: { model: 'City Ride', rating: '4.1', fuel: 'Petrol', seats: '5 Seats', transmission: 'Automatic' } },
  { id: 50, name: 'Flagship Supercar', price: 'Rs 29,050/day', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60', specs: { model: 'Apex 100', rating: '5.0', fuel: 'Petrol', seats: '2 Seats', transmission: 'Automatic' } }
];

export default function Cars() {
  const [cars, setCars] = useState(() => {
    const savedCars = localStorage.getItem('rentEasyCarsList');
    if (savedCars) {
      try {
        const parsed = JSON.parse(savedCars);
        // LocalStorage ke data ko carsList ke sath sync karein taaki booked status theek se mile
        return carsList.map(car => {
          const found = parsed.find(p => String(p.id) === String(car.id));
          return found ? { ...car, isBooked: found.isBooked, bookingDetails: found.bookingDetails } : { ...car, isBooked: false };
        });
      } catch (e) {
        console.error(e);
      }
    }
    return carsList.map(car => ({ ...car, isBooked: false }));
  });

  useEffect(() => {
    localStorage.setItem('rentEasyCarsList', JSON.stringify(cars));
  }, [cars]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Available Cars for Rent</h2>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {cars.map((car) => (
          <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '280px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', background: '#fff' }}>
            <img src={car.image} alt={car.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
            <h3 style={{ fontSize: '1.2rem', margin: '12px 0 6px 0', fontWeight: 'bold', color: '#333' }}>{car.name}</h3>
            <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem', margin: '8px 0' }}>{car.price}</p>

            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', margin: '10px 0', textAlign: 'left', fontSize: '0.85rem', color: '#333' }}>
              <p style={{ margin: '4px 0' }}><strong>Model:</strong> {car.specs.model}</p>
              <p style={{ margin: '4px 0' }}><strong>Fuel:</strong> {car.specs.fuel}</p>
              <p style={{ margin: '4px 0' }}><strong>Seats:</strong> {car.specs.seats}</p>
              <p style={{ margin: '4px 0' }}><strong>Transmission:</strong> {car.specs.transmission}</p>
            </div>

            {car.isBooked ? (
              <button disabled style={{ display: 'inline-block', width: '100%', marginTop: '10px', padding: '0.6rem 1.2rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold' }}>
                Booked (Not Available)
              </button>
            ) : (
              <Link to={`/booking/car/${car.id}`} style={{ display: 'inline-block', width: '100%', marginTop: '10px', padding: '0.6rem 1.2rem', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}>
                Rent Now
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}