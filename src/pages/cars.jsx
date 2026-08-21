import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const carsList = [
  {
    id: 1,
    name: 'Maruti Swift',
    price: 'Rs 2,500/day',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',
    specs: {
      model: 'Swift VXI 2024',
      rating: '4.4',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '22 km/l'
    }
  },
  {
    id: 2,
    name: 'Hyundai Creta',
    price: 'Rs 3,800/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Creta SX 2024',
      rating: '4.6',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 3,
    name: 'Tata Nexon',
    price: 'Rs 3,200/day',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    specs: {
      model: 'Nexon XZ+',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '17 km/l'
    }
  },
  {
    id: 4,
    name: 'Mahindra Thar',
    price: 'Rs 4,500/day',
    image: 'https://images.unsplash.com/photo-1627454820516-dc767bcb4d5e?w=800',
    specs: {
      model: 'Thar LX 2024',
      rating: '4.7',
      fuelType: 'Diesel',
      transmission: 'Manual',
      seats: '4 Seater',
      mileage: '15 km/l'
    }
  },
  {
    id: 5,
    name: 'Toyota Fortuner',
    price: 'Rs 6,500/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Fortuner Legender',
      rating: '4.8',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '14 km/l'
    }
  },
  {
    id: 6,
    name: 'Kia Seltos',
    price: 'Rs 3,700/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    specs: {
      model: 'Seltos HTX',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '17 km/l'
    }
  },
  {
    id: 7,
    name: 'Honda City',
    price: 'Rs 3,000/day',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
    specs: {
      model: 'City ZX 2024',
      rating: '4.4',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 8,
    name: 'Toyota Innova Crysta',
    price: 'Rs 4,800/day',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
    specs: {
      model: 'Innova Crysta GX',
      rating: '4.7',
      fuelType: 'Diesel',
      transmission: 'Manual',
      seats: '7 Seater',
      mileage: '15 km/l'
    }
  },
  {
    id: 9,
    name: 'Hyundai i20',
    price: 'Rs 2,300/day',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    specs: {
      model: 'i20 Sportz',
      rating: '4.3',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 10,
    name: 'Mahindra XUV700',
    price: 'Rs 5,200/day',
    image: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800',
    specs: {
      model: 'XUV700 AX7',
      rating: '4.8',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '16 km/l'
    }
  },
  {
    id: 11,
    name: 'Tata Harrier',
    price: 'Rs 4,200/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Harrier XZA',
      rating: '4.6',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '16 km/l'
    }
  },
  {
    id: 12,
    name: 'MG Hector',
    price: 'Rs 4,000/day',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    specs: {
      model: 'Hector Sharp',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '15 km/l'
    }
  },
  {
    id: 13,
    name: 'Maruti Baleno',
    price: 'Rs 2,200/day',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',
    specs: {
      model: 'Baleno Alpha',
      rating: '4.2',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '22 km/l'
    }
  },
  {
    id: 14,
    name: 'Hyundai Venue',
    price: 'Rs 2,800/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    specs: {
      model: 'Venue SX',
      rating: '4.4',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 15,
    name: 'Kia Sonet',
    price: 'Rs 2,900/day',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
    specs: {
      model: 'Sonet GTX',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 16,
    name: 'Honda Elevate',
    price: 'Rs 3,600/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Elevate ZX',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '16 km/l'
    }
  },
  {
    id: 17,
    name: 'Tata Punch',
    price: 'Rs 2,400/day',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    specs: {
      model: 'Punch Accomplished',
      rating: '4.3',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 18,
    name: 'Maruti Brezza',
    price: 'Rs 3,000/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Brezza ZXI',
      rating: '4.4',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 19,
    name: 'Volkswagen Virtus',
    price: 'Rs 3,500/day',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    specs: {
      model: 'Virtus GT',
      rating: '4.6',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 20,
    name: 'Skoda Slavia',
    price: 'Rs 3,400/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    specs: {
      model: 'Slavia Style',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 21,
    name: 'Jeep Compass',
    price: 'Rs 5,000/day',
    image: 'https://images.unsplash.com/photo-1627454820516-dc767bcb4d5e?w=800',
    specs: {
      model: 'Compass Limited',
      rating: '4.7',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '17 km/l'
    }
  },
  {
    id: 22,
    name: 'MG Astor',
    price: 'Rs 3,500/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Astor Savvy',
      rating: '4.4',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '15 km/l'
    }
  },
  {
    id: 23,
    name: 'Renault Duster',
    price: 'Rs 3,100/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Duster RXZ',
      rating: '4.2',
      fuelType: 'Diesel',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 24,
    name: 'Nissan Magnite',
    price: 'Rs 2,600/day',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
    specs: {
      model: 'Magnite XV',
      rating: '4.2',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 25,
    name: 'Renault Kiger',
    price: 'Rs 2,700/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    specs: {
      model: 'Kiger RXZ',
      rating: '4.3',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 26,
    name: 'Citroen C3',
    price: 'Rs 2,300/day',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',
    specs: {
      model: 'C3 Shine',
      rating: '4.1',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 27,
    name: 'Toyota Glanza',
    price: 'Rs 2,400/day',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    specs: {
      model: 'Glanza V',
      rating: '4.3',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '22 km/l'
    }
  },
  {
    id: 28,
    name: 'Maruti Ertiga',
    price: 'Rs 3,500/day',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
    specs: {
      model: 'Ertiga ZXI',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '7 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 29,
    name: 'Kia Carens',
    price: 'Rs 4,200/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Carens Luxury',
      rating: '4.6',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 30,
    name: 'Toyota Hyryder',
    price: 'Rs 4,000/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Hyryder V',
      rating: '4.7',
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '27 km/l'
    }
  },
  {
    id: 31,
    name: 'Maruti Grand Vitara',
    price: 'Rs 3,900/day',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
    specs: {
      model: 'Grand Vitara Alpha',
      rating: '4.6',
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '27 km/l'
    }
  },
  {
    id: 32,
    name: 'Tata Safari',
    price: 'Rs 5,000/day',
    image: 'https://images.unsplash.com/photo-1627454820516-dc767bcb4d5e?w=800',
    specs: {
      model: 'Safari XZA+',
      rating: '4.7',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '16 km/l'
    }
  },
  {
    id: 33,
    name: 'Hyundai Alcazar',
    price: 'Rs 4,700/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Alcazar Signature',
      rating: '4.6',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 34,
    name: 'Volkswagen Taigun',
    price: 'Rs 3,800/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    specs: {
      model: 'Taigun GT',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 35,
    name: 'Skoda Kushaq',
    price: 'Rs 3,700/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Kushaq Style',
      rating: '4.5',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '18 km/l'
    }
  },
  {
    id: 36,
    name: 'Honda Amaze',
    price: 'Rs 2,500/day',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
    specs: {
      model: 'Amaze VX',
      rating: '4.2',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 37,
    name: 'Maruti Dzire',
    price: 'Rs 2,400/day',
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',
    specs: {
      model: 'Dzire ZXI',
      rating: '4.3',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '22 km/l'
    }
  },
  {
    id: 38,
    name: 'Hyundai Verna',
    price: 'Rs 3,200/day',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    specs: {
      model: 'Verna SX',
      rating: '4.6',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 39,
    name: 'Tata Altroz',
    price: 'Rs 2,500/day',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    specs: {
      model: 'Altroz XZ',
      rating: '4.3',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 40,
    name: 'Maruti Ciaz',
    price: 'Rs 2,900/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Ciaz Alpha',
      rating: '4.2',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: '5 Seater',
      mileage: '20 km/l'
    }
  },
  {
    id: 41,
    name: 'BMW 3 Series',
    price: 'Rs 8,000/day',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    specs: {
      model: 'BMW 330i',
      rating: '4.9',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '16 km/l'
    }
  },
  {
    id: 42,
    name: 'Mercedes-Benz C-Class',
    price: 'Rs 9,000/day',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
    specs: {
      model: 'C-Class C200',
      rating: '4.9',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '17 km/l'
    }
  },
  {
    id: 43,
    name: 'Audi A4',
    price: 'Rs 8,500/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Audi A4 Premium',
      rating: '4.8',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '17 km/l'
    }
  },
  {
    id: 44,
    name: 'Jeep Meridian',
    price: 'Rs 5,500/day',
    image: 'https://images.unsplash.com/photo-1627454820516-dc767bcb4d5e?w=800',
    specs: {
      model: 'Meridian Limited',
      rating: '4.7',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '16 km/l'
    }
  },
  {
    id: 45,
    name: 'MG ZS EV',
    price: 'Rs 4,500/day',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    specs: {
      model: 'ZS EV Exclusive',
      rating: '4.7',
      fuelType: 'Electric',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '461 km Range'
    }
  },
  {
    id: 46,
    name: 'Tata Nexon EV',
    price: 'Rs 4,000/day',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    specs: {
      model: 'Nexon EV Max',
      rating: '4.6',
      fuelType: 'Electric',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '437 km Range'
    }
  },
  {
    id: 47,
    name: 'Hyundai Ioniq 5',
    price: 'Rs 7,500/day',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    specs: {
      model: 'Ioniq 5',
      rating: '4.9',
      fuelType: 'Electric',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '631 km Range'
    }
  },
  {
    id: 48,
    name: 'Toyota Camry',
    price: 'Rs 6,500/day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    specs: {
      model: 'Camry Hybrid',
      rating: '4.8',
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '19 km/l'
    }
  },
  {
    id: 49,
    name: 'Volvo XC40',
    price: 'Rs 7,000/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'XC40 Recharge',
      rating: '4.8',
      fuelType: 'Electric',
      transmission: 'Automatic',
      seats: '5 Seater',
      mileage: '418 km Range'
    }
  },
  {
    id: 50,
    name: 'Land Rover Defender',
    price: 'Rs 10,000/day',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    specs: {
      model: 'Defender 110',
      rating: '4.9',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: '7 Seater',
      mileage: '11 km/l'
    }
  }
];

/* =========================================================
   CAR DATA NORMALIZER

   Existing cars + Admin Dashboard se added cars dono handle karega
========================================================= */

const normalizeCar = (car, index = 0) => {
  const safeCar = car || {};
  const safeSpecs = safeCar.specs || {};

  return {
    ...safeCar,

    id:
      safeCar.id ||
      `car-${index}-${Date.now()}`,

    name:
      safeCar.name ||
      safeCar.model ||
      'Unnamed Car',

    price:
      safeCar.price ||
      (
        safeCar.pricePerDay
          ? `Rs ${safeCar.pricePerDay}/day`
          : 'Price not available'
      ),

    image:
      safeCar.image ||
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',

    specs: {
      model:
        safeSpecs.model ||
        safeCar.model ||
        safeCar.name ||
        'N/A',

      rating:
        safeSpecs.rating ||
        safeCar.rating ||
        'N/A',

      fuelType:
        safeSpecs.fuelType ||
        safeCar.fuelType ||
        safeCar.fuel ||
        '',

      transmission:
        safeSpecs.transmission ||
        safeCar.transmission ||
        '',

      seats:
        safeSpecs.seats ||
        safeCar.seats ||
        '',

      mileage:
        safeSpecs.mileage ||
        safeCar.mileage ||
        ''
    },

    isBooked: Boolean(safeCar.isBooked)
  };
};

/* =========================================================
   CARS COMPONENT
========================================================= */

export default function Cars() {
  const [cars, setCars] = useState(() => {
    try {
      const savedCars =
        localStorage.getItem('rentEasyCarsList');

      if (savedCars) {
        const parsedCars =
          JSON.parse(savedCars);

        if (Array.isArray(parsedCars)) {
          return parsedCars.map(
            (car, index) =>
              normalizeCar(car, index)
          );
        }
      }
    } catch (error) {
      console.error(
        'Error loading cars from localStorage:',
        error
      );
    }

    return carsList.map(
      (car, index) =>
        normalizeCar(
          {
            ...car,
            isBooked: false
          },
          index
        )
    );
  });

  /* =========================================================
     SAVE CARS TO LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        'rentEasyCarsList',
        JSON.stringify(cars)
      );
    } catch (error) {
      console.error(
        'Error saving cars:',
        error
      );
    }
  }, [cars]);

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
        Available Cars for Rent
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
        {cars.map((car, index) => (
          <div
            key={car.id || index}
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
              src={car.image}
              alt={car.name}
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800';
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
              {car.name}
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
              {car.price}
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
                {car.specs?.model || 'N/A'}
              </p>

              <p
                style={{
                  margin: '4px 0'
                }}
              >
                <strong>Rating:</strong>{' '}
                {car.specs?.rating || 'N/A'}
              </p>

              {car.specs?.fuelType && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Fuel:</strong>{' '}
                  {car.specs.fuelType}
                </p>
              )}

              {car.specs?.transmission && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Transmission:</strong>{' '}
                  {car.specs.transmission}
                </p>
              )}

              {car.specs?.seats && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Seats:</strong>{' '}
                  {car.specs.seats}
                </p>
              )}

              {car.specs?.mileage && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Mileage:</strong>{' '}
                  {car.specs.mileage}
                </p>
              )}

              {car.numberPlate && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Number Plate:</strong>{' '}
                  {car.numberPlate}
                </p>
              )}

              {car.status && (
                <p
                  style={{
                    margin: '4px 0'
                  }}
                >
                  <strong>Status:</strong>{' '}
                  {car.status}
                </p>
              )}
            </div>

            {/* BOOKING BUTTON */}

            {car.isBooked ? (
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
                to={`/booking/car/${car.id}`}
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