import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const bikesList = [
  {
    id: 1,
    name: 'Mountain Bike',
    price: 'Rs 3,320/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'MTB Pro 2024',
      rating: '4.3',
      frame: '17" Aluminum',
      weight: '13.5 kg',
      gears: '21 Speed'
    }
  },
  {
    id: 2,
    name: 'Road Bike',
    price: 'Rs 2,905/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'RoadMaster 16',
      rating: '4.1',
      frame: '16" Steel',
      weight: '8.2 kg',
      gears: '16 Speed'
    }
  },
  {
    id: 3,
    name: 'Hybrid Bike',
    price: 'Rs 3,735/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Hybrid X18',
      rating: '4.4',
      frame: '18" Aluminum',
      weight: '12.4 kg',
      gears: '18 Speed'
    }
  },
  {
    id: 4,
    name: 'Electric Bike',
    price: 'Rs 4,980/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'E-Ride 500',
      rating: '4.5',
      frame: '19" Aluminum',
      weight: '24 kg',
      battery: '500W'
    }
  },
  {
    id: 5,
    name: 'Folding Bike',
    price: 'Rs 4,150/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'FoldEasy 14',
      rating: '4.0',
      frame: '14" Steel',
      weight: '11.8 kg',
      gears: '8 Speed'
    }
  },
  {
    id: 6,
    name: 'Cruiser Bike',
    price: 'Rs 4,565/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Cruiser Classic',
      rating: '4.2',
      frame: '18" Steel',
      weight: '14.5 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 7,
    name: 'BMX Bike',
    price: 'Rs 2,490/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'BMX Stunt Pro',
      rating: '4.0',
      frame: '20" Steel',
      weight: '10.3 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 8,
    name: 'Touring Bike',
    price: 'Rs 5,395/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Tourer 20',
      rating: '4.6',
      frame: '20" Steel',
      weight: '15.2 kg',
      gears: '27 Speed'
    }
  },
  {
    id: 9,
    name: 'City Bike',
    price: 'Rs 3,320/day',
    image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg',
    specs: {
      model: 'CityRide 17',
      rating: '4.1',
      frame: '17" Aluminum',
      weight: '13 kg',
      gears: '8 Speed'
    }
  },
  {
    id: 10,
    name: 'Adventure Bike',
    price: 'Rs 5,810/day',
    image: 'https://m.media-amazon.com/images/I/61oQBuwOaXL._SX522_.jpg',
    specs: {
      model: 'Adventure X19',
      rating: '4.5',
      frame: '19" Aluminum',
      weight: '14.1 kg',
      gears: '21 Speed'
    }
  },
  {
    id: 11,
    name: 'Gravel Bike',
    price: 'Rs 3,984/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'GravelPro 18',
      rating: '4.3',
      frame: '18" Carbon',
      weight: '9.5 kg',
      gears: '18 Speed'
    }
  },
  {
    id: 12,
    name: 'Fat Bike',
    price: 'Rs 6,225/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'FatTire 20',
      rating: '4.2',
      frame: '20" Aluminum',
      weight: '16.8 kg',
      gears: '21 Speed'
    }
  },
  {
    id: 13,
    name: 'Dirt Bike',
    price: 'Rs 4,565/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'DirtX 17',
      rating: '4.4',
      frame: '17" Steel',
      weight: '12.9 kg',
      gears: '18 Speed'
    }
  },
  {
    id: 14,
    name: 'Fixed Gear Bike',
    price: 'Rs 2,656/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'FixedGear 16',
      rating: '4.0',
      frame: '16" Steel',
      weight: '8.7 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 15,
    name: 'Tandem Bike',
    price: 'Rs 6,640/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Tandem Duo',
      rating: '4.1',
      frame: '20" Aluminum',
      weight: '18.5 kg',
      gears: '21 Speed'
    }
  },
  {
    id: 16,
    name: 'Recumbent Bike',
    price: 'Rs 4,814/day',
    image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg',
    specs: {
      model: 'Recumbent Comfort',
      rating: '4.2',
      frame: '18" Aluminum',
      weight: '15.3 kg',
      gears: '18 Speed'
    }
  },
  {
    id: 17,
    name: 'Cargo Bike',
    price: 'Rs 5,976/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'CargoMax 21',
      rating: '4.3',
      frame: '21" Steel',
      weight: '22 kg',
      gears: '8 Speed'
    }
  },
  {
    id: 18,
    name: 'Commuter Bike',
    price: 'Rs 3,486/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'Commuter 17',
      rating: '4.1',
      frame: '17" Aluminum',
      weight: '12.1 kg',
      gears: '10 Speed'
    }
  },
  {
    id: 19,
    name: 'Sport Bike',
    price: 'Rs 5,644/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'SportX 16',
      rating: '4.6',
      frame: '16" Carbon',
      weight: '7.8 kg',
      gears: '22 Speed'
    }
  },
  {
    id: 20,
    name: 'Single Speed Bike',
    price: 'Rs 2,324/day',
    image: 'https://m.media-amazon.com/images/I/61oQBuwOaXL._SX522_.jpg',
    specs: {
      model: 'Single 15',
      rating: '3.9',
      frame: '15" Steel',
      weight: '11 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 21,
    name: 'Trail Mountain Bike',
    price: 'Rs 3,800/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'Trail Blazer',
      rating: '4.4',
      frame: '18" Aluminum',
      weight: '14 kg',
      gears: '24 Speed'
    }
  },
  {
    id: 22,
    name: 'Aero Road Bike',
    price: 'Rs 5,500/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'Aero Swift',
      rating: '4.7',
      frame: 'Carbon Fiber',
      weight: '7.5 kg',
      gears: '24 Speed'
    }
  },
  {
    id: 23,
    name: 'Urban Hybrid',
    price: 'Rs 3,100/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Urban Glide',
      rating: '4.2',
      frame: '17" Alloy',
      weight: '12 kg',
      gears: '7 Speed'
    }
  },
  {
    id: 24,
    name: 'Step-Through E-Bike',
    price: 'Rs 5,200/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'E-Step 300',
      rating: '4.6',
      frame: '17" Aluminum',
      weight: '22 kg',
      battery: '400W'
    }
  },
  {
    id: 25,
    name: 'Mini Folding Bike',
    price: 'Rs 3,900/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Pocket Fold',
      rating: '4.1',
      frame: 'Steel',
      weight: '10.5 kg',
      gears: '6 Speed'
    }
  },
  {
    id: 26,
    name: 'Classic Beach Cruiser',
    price: 'Rs 4,000/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Beach Wave',
      rating: '4.3',
      frame: 'Steel',
      weight: '15 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 27,
    name: 'Pro BMX Street',
    price: 'Rs 2,700/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Street King',
      rating: '4.2',
      frame: 'Hi-Ten Steel',
      weight: '11 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 28,
    name: 'Long Distance Tourer',
    price: 'Rs 5,600/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Globe Trotter',
      rating: '4.8',
      frame: 'Chromoly Steel',
      weight: '16 kg',
      gears: '30 Speed'
    }
  },
  {
    id: 29,
    name: 'City Comfort Bike',
    price: 'Rs 3,200/day',
    image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg',
    specs: {
      model: 'Comfort Ease',
      rating: '4.0',
      frame: 'Aluminum',
      weight: '13.2 kg',
      gears: '7 Speed'
    }
  },
  {
    id: 30,
    name: 'All-Terrain Adventure',
    price: 'Rs 6,000/day',
    image: 'https://m.media-amazon.com/images/I/61oQBuwOaXL._SX522_.jpg',
    specs: {
      model: 'TerraMax',
      rating: '4.5',
      frame: 'Aluminum',
      weight: '14.5 kg',
      gears: '27 Speed'
    }
  },
  {
    id: 31,
    name: 'Carbon Gravel Bike',
    price: 'Rs 4,500/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Gravel Carbon X',
      rating: '4.6',
      frame: 'Carbon',
      weight: '9 kg',
      gears: '22 Speed'
    }
  },
  {
    id: 32,
    name: 'Extreme Fat Bike',
    price: 'Rs 6,500/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Snow Beast',
      rating: '4.3',
      frame: 'Aluminum',
      weight: '17.5 kg',
      gears: '12 Speed'
    }
  },
  {
    id: 33,
    name: 'Junior Dirt Bike',
    price: 'Rs 4,000/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'Junior Jump',
      rating: '4.2',
      frame: 'Steel',
      weight: '12 kg',
      gears: '6 Speed'
    }
  },
  {
    id: 34,
    name: 'Track Fixed Gear',
    price: 'Rs 2,800/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'Velodrome Pro',
      rating: '4.1',
      frame: 'Aluminum',
      weight: '8 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 35,
    name: 'Triple Tandem Bike',
    price: 'Rs 8,000/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Triple Trio',
      rating: '4.0',
      frame: 'Steel',
      weight: '24 kg',
      gears: '27 Speed'
    }
  },
  {
    id: 36,
    name: 'Ergonomic Recumbent',
    price: 'Rs 5,100/day',
    image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg',
    specs: {
      model: 'Recumbent Pro',
      rating: '4.4',
      frame: 'Aluminum',
      weight: '16 kg',
      gears: '24 Speed'
    }
  },
  {
    id: 37,
    name: 'Heavy Cargo E-Bike',
    price: 'Rs 7,000/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'CargoHauler',
      rating: '4.5',
      frame: 'Steel',
      weight: '28 kg',
      gears: '10 Speed'
    }
  },
  {
    id: 38,
    name: 'Daily Commuter Pro',
    price: 'Rs 3,600/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'DailyRide',
      rating: '4.3',
      frame: 'Aluminum',
      weight: '12.5 kg',
      gears: '9 Speed'
    }
  },
  {
    id: 39,
    name: 'Endurance Sport Bike',
    price: 'Rs 5,900/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'Endurance X',
      rating: '4.7',
      frame: 'Carbon',
      weight: '7.9 kg',
      gears: '22 Speed'
    }
  },
  {
    id: 40,
    name: 'Vintage Single Speed',
    price: 'Rs 2,500/day',
    image: 'https://m.media-amazon.com/images/I/61oQBuwOaXL._SX522_.jpg',
    specs: {
      model: 'Vintage 70s',
      rating: '4.1',
      frame: 'Steel',
      weight: '11.5 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 41,
    name: 'Full Suspension MTB',
    price: 'Rs 4,800/day',
    image: 'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',
    specs: {
      model: 'FullShock 29',
      rating: '4.6',
      frame: 'Aluminum',
      weight: '15 kg',
      gears: '21 Speed'
    }
  },
  {
    id: 42,
    name: 'Time Trial Bike',
    price: 'Rs 6,500/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'Chronos TT',
      rating: '4.8',
      frame: 'Carbon Fiber',
      weight: '8.1 kg',
      gears: '22 Speed'
    }
  },
  {
    id: 43,
    name: 'Fitness Hybrid Bike',
    price: 'Rs 3,400/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'FitShape 10',
      rating: '4.3',
      frame: 'Aluminum',
      weight: '11.8 kg',
      gears: '16 Speed'
    }
  },
  {
    id: 44,
    name: 'Heavy Duty E-Bike',
    price: 'Rs 5,800/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'PowerGo 750',
      rating: '4.6',
      frame: 'Aluminum',
      weight: '25 kg',
      battery: '750W'
    }
  },
  {
    id: 45,
    name: 'Compact Folding Bike',
    price: 'Rs 4,300/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'MicroFold',
      rating: '4.2',
      frame: 'Aluminum',
      weight: '10 kg',
      gears: '7 Speed'
    }
  },
  {
    id: 46,
    name: 'Retro Cruiser',
    price: 'Rs 4,200/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Retro Vibe',
      rating: '4.4',
      frame: 'Steel',
      weight: '14.8 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 47,
    name: 'Freestyle BMX',
    price: 'Rs 2,600/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'FreeSpin',
      rating: '4.1',
      frame: 'Hi-Ten Steel',
      weight: '10.8 kg',
      gears: 'Single Speed'
    }
  },
  {
    id: 48,
    name: 'Expedition Touring Bike',
    price: 'Rs 6,100/day',
    image: 'https://m.media-amazon.com/images/I/71cmtvdbRhL._SX522_.jpg',
    specs: {
      model: 'Expedition X',
      rating: '4.9',
      frame: 'Chromoly Steel',
      weight: '16.5 kg',
      gears: '30 Speed'
    }
  },
  {
    id: 49,
    name: 'Urban Commuter Plus',
    price: 'Rs 3,500/day',
    image: 'https://m.media-amazon.com/images/I/616zet0w+3L._SX522_.jpg',
    specs: {
      model: 'UrbanPlus',
      rating: '4.2',
      frame: 'Aluminum',
      weight: '12.8 kg',
      gears: '8 Speed'
    }
  },
  {
    id: 50,
    name: 'Pro Racing Bicycle',
    price: 'Rs 7,200/day',
    image: 'https://m.media-amazon.com/images/I/71RCJ8dgB-L._SL1500_.jpg',
    specs: {
      model: 'Apex Racer',
      rating: '4.9',
      frame: 'Full Carbon',
      weight: '6.9 kg',
      gears: '24 Speed'
    }
  }
];

/* =========================================================
   BIKE DATA NORMALIZER
   Existing bikes + Admin Dashboard se added bikes dono handle karega
========================================================= */

const normalizeBike = (bike, index = 0) => {
  const safeBike = bike || {};
  const safeSpecs = safeBike.specs || {};

  return {
    ...safeBike,

    id: safeBike.id || `bike-${index}-${Date.now()}`,

    name:
      safeBike.name ||
      safeBike.model ||
      'Unnamed Bike',

    price:
      safeBike.price ||
      (
        safeBike.pricePerDay
          ? `Rs ${safeBike.pricePerDay}/day`
          : 'Price not available'
      ),

    image:
      safeBike.image ||
      'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg',

    specs: {
      model:
        safeSpecs.model ||
        safeBike.model ||
        safeBike.name ||
        'N/A',

      rating:
        safeSpecs.rating ||
        safeBike.rating ||
        'N/A',

      frame:
        safeSpecs.frame ||
        safeBike.frame ||
        'N/A',

      weight:
        safeSpecs.weight ||
        safeBike.weight ||
        'N/A',

      gears:
        safeSpecs.gears ||
        safeBike.gears ||
        '',

      battery:
        safeSpecs.battery ||
        safeBike.battery ||
        ''
    },

    isBooked: Boolean(safeBike.isBooked)
  };
};

/* =========================================================
   BIKES COMPONENT
========================================================= */

export default function Bikes() {
  const [bikes, setBikes] = useState(() => {
    try {
      const savedBikes =
        localStorage.getItem('rentEasyBikesList');

      if (savedBikes) {
        const parsedBikes =
          JSON.parse(savedBikes);

        if (Array.isArray(parsedBikes)) {
          return parsedBikes.map(
            (bike, index) =>
              normalizeBike(bike, index)
          );
        }
      }
    } catch (error) {
      console.error(
        'Error loading bikes from localStorage:',
        error
      );
    }

    return bikesList.map(
      (bike, index) =>
        normalizeBike(
          {
            ...bike,
            isBooked: false
          },
          index
        )
    );
  });

  /* =========================================================
     SAVE BIKES TO LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        'rentEasyBikesList',
        JSON.stringify(bikes)
      );
    } catch (error) {
      console.error(
        'Error saving bikes:',
        error
      );
    }
  }, [bikes]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        background: '#f8f9fa'
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}
      >
        Available Bikes for Rent
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        {bikes.map((bike, index) => (
          <div
            key={bike.id || index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              width: '280px',
              textAlign: 'center',
              boxShadow:
                '0 2px 8px rgba(0,0,0,0.15)',
              background: '#fff'
            }}
          >
            {/* IMAGE */}

            <img
              src={bike.image}
              alt={bike.name}
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://m.media-amazon.com/images/I/714Csi6NaUL._SX522_.jpg';
              }}
            />

            {/* NAME */}

            <h3
              style={{
                fontSize: '1.2rem',
                margin: '12px 0 6px 0',
                fontWeight: 'bold'
              }}
            >
              {bike.name}
            </h3>

            {/* PRICE */}

            <p
              style={{
                color: '#28a745',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                margin: '8px 0'
              }}
            >
              {bike.price}
            </p>

            {/* SPECS */}

            <div
              style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                margin: '10px 0',
                textAlign: 'left',
                fontSize: '0.85rem'
              }}
            >
              <p
                style={{
                  margin: '4px 0'
                }}
              >
                <strong>Model:</strong>{' '}
                {bike.specs?.model || 'N/A'}
              </p>

              <p
                style={{
                  margin: '4px 0'
                }}
              >
                <strong>Frame:</strong>{' '}
                {bike.specs?.frame || 'N/A'}
              </p>

              <p
                style={{
                  margin: '4px 0'
                }}
              >
                <strong>Weight:</strong>{' '}
                {bike.specs?.weight || 'N/A'}
              </p>

              {bike.specs?.gears && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Gears:</strong>{' '}
                  {bike.specs.gears}
                </p>
              )}

              {bike.specs?.battery && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Battery:</strong>{' '}
                  {bike.specs.battery}
                </p>
              )}

              {bike.numberPlate && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Number Plate:</strong>{' '}
                  {bike.numberPlate}
                </p>
              )}

              {bike.fuelType && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Fuel:</strong>{' '}
                  {bike.fuelType}
                </p>
              )}

              {bike.status && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Status:</strong>{' '}
                  {bike.status}
                </p>
              )}
            </div>

            {/* BOOKING BUTTON */}

            {bike.isBooked ? (
              <button
                disabled
                style={{
                  display: 'inline-block',
                  width: '100%',
                  marginTop: '10px',
                  padding: '0.6rem 1.2rem',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Booked (Not Available)
              </button>
            ) : (
              <Link
                to={`/booking/bike/${bike.id}`}
                style={{
                  display: 'inline-block',
                  width: '100%',
                  marginTop: '10px',
                  padding: '0.6rem 1.2rem',
                  background: '#007bff',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              >
                Rent Now
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}