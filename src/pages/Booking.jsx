import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carsList } from './Cars';
import { bikesList } from './Bikes';

const API_URL = 'http://localhost:8000';

export default function Booking() {

  const { type, id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD VEHICLE
  // =========================

  useEffect(() => {

    const defaultList =
      type === 'car'
        ? carsList
        : bikesList;

    const listKey =
      type === 'car'
        ? 'rentEasyCarsList'
        : 'rentEasyBikesList';

    const savedData =
      localStorage.getItem(listKey);

    let currentList = defaultList;

    if (savedData) {

      try {

        const parsed = JSON.parse(savedData);

        if (Array.isArray(parsed)) {

          currentList = defaultList.map((vehicle) => {

            const savedVehicle = parsed.find(
              (p) =>
                String(p.id) === String(vehicle.id)
            );

            return savedVehicle
              ? {
                  ...vehicle,
                  ...savedVehicle
                }
              : vehicle;

          });

          // Custom vehicles
          const customVehicles = parsed.filter(
            (saved) =>
              !defaultList.some(
                (vehicle) =>
                  String(vehicle.id) ===
                  String(saved.id)
              )
          );

          currentList = [
            ...currentList,
            ...customVehicles
          ];
        }

      } catch (error) {

        console.error(
          'LocalStorage error:',
          error
        );

      }
    }

    const found = currentList.find(
      (vehicle) =>
        String(vehicle.id) === String(id)
    );

    setItem(found || null);

  }, [type, id]);


  // =========================
  // CALCULATE TOTAL
  // =========================

  useEffect(() => {

    if (!startDate || !endDate || !item) {
      setTotalAmount(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime =
      end.getTime() - start.getTime();

    const diffDays =
      Math.ceil(
        diffTime /
        (1000 * 60 * 60 * 24)
      ) + 1;

    if (diffDays > 0) {

      const priceNumber =
        parseInt(
          String(item.price)
            .replace(/[^0-9]/g, '')
        ) || 0;

      setTotalAmount(
        diffDays * priceNumber
      );

    } else {

      setTotalAmount(0);

    }

  }, [startDate, endDate, item]);


  // =========================
  // CONFIRM BOOKING
  // =========================

  const handleConfirmBooking = async (e) => {

    e.preventDefault();

    if (!startDate || !endDate) {

      alert(
        'Please select both Start Date and End Date!'
      );

      return;
    }

    if (
      new Date(startDate) >
      new Date(endDate)
    ) {

      alert(
        'End Date cannot be earlier than Start Date!'
      );

      return;
    }

    if (!item) {

      alert('Vehicle not found!');

      return;
    }

    setLoading(true);

    try {

      const start = new Date(startDate);
      const end = new Date(endDate);

      const diffTime =
        end.getTime() - start.getTime();

      const totalDays =
        Math.ceil(
          diffTime /
          (1000 * 60 * 60 * 24)
        ) + 1;


      // =========================
      // GET USER DETAILS
      // =========================

      let userEmail = 'guest@gmail.com';
      let userName = 'Guest User';

      try {

        const savedUser =
          localStorage.getItem('user');

        if (savedUser) {

          const user =
            JSON.parse(savedUser);

          userEmail =
            user.email ||
            user.username ||
            'guest@gmail.com';

          userName =
            user.name ||
            user.username ||
            'Guest User';
        }

      } catch (error) {

        console.log(
          'User data not found'
        );

      }


      // =========================
      // SEND TO FASTAPI
      // =========================

      let bookingId = 'BKG_' + Date.now();

      try {

        const response = await fetch(
          `${API_URL}/api/bookings`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              user_email: userEmail,

              vehicle_id:
                String(item.id),

              vehicle_name:
                item.name,

              vehicle_type:
                type,

              start_date:
                startDate,

              end_date:
                endDate,

              total_days:
                totalDays,

              total_price:
                totalAmount

            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.booking_id) {
            bookingId = data.booking_id;
          }
        }

      } catch (err) {
        console.log('Backend offline, using local storage backup.');
      }


      // =========================
      // UPDATE LOCAL STORAGE
      // =========================

      const listKey =
        type === 'car'
          ? 'rentEasyCarsList'
          : 'rentEasyBikesList';

      const defaultList =
        type === 'car'
          ? carsList
          : bikesList;

      let savedList = [];

      try {

        const saved =
          localStorage.getItem(listKey);

        savedList =
          saved
            ? JSON.parse(saved)
            : [];

      } catch (error) {

        savedList = [];

      }


      const updatedList =
        defaultList.map((vehicle) => {

          const savedVehicle =
            savedList.find(
              (saved) =>
                String(saved.id) ===
                String(vehicle.id)
            );

          const finalVehicle =
            savedVehicle
              ? {
                  ...vehicle,
                  ...savedVehicle
                }
              : {
                  ...vehicle
                };


          if (
            String(vehicle.id) ===
            String(item.id)
          ) {

            return {

              ...finalVehicle,

              isBooked: true,

              status: 'booked',

              bookingDetails: {

                userEmail: userEmail.trim().toLowerCase(),

                userName: userName,

                startDate,

                endDate,

                totalAmount,

                totalDays,

                bookingId: bookingId,

                status: 'pending',

                image: item.image

              }

            };

          }

          return finalVehicle;

        });


      // Custom vehicles
      const customVehicles =
        savedList.filter(
          (saved) =>
            !defaultList.some(
              (vehicle) =>
                String(vehicle.id) ===
                String(saved.id)
            )
        );


      localStorage.setItem(
        listKey,
        JSON.stringify([
          ...updatedList,
          ...customVehicles
        ])
      );


      // Refresh Cars/Bikes page
      window.dispatchEvent(
        new Event(
          type === 'car'
            ? 'rentEasyCarsUpdated'
            : 'rentEasyBikesUpdated'
        )
      );


      alert(
        `Booking Confirmed Successfully!\nTotal: Rs ${totalAmount}`
      );


      navigate('/my-bookings');


    } catch (error) {

      console.error(
        'Booking error:',
        error
      );

      alert(
        `Booking failed: ${error.message}`
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================
  // ITEM NOT FOUND
  // =========================

  if (!item) {

    return (

      <div
        style={{
          textAlign: 'center',
          padding: '3rem'
        }}
      >

        <h2>
          Item not found!
        </h2>

      </div>

    );

  }


  // =========================
  // UI
  // =========================

  return (

    <div
      style={{
        maxWidth: '600px',
        margin: '3rem auto',
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#fff',
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >

      <h2
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#333'
        }}
      >
        Complete Your Booking
      </h2>


      <div
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}
      >

        <img
          src={item.image}
          alt={item.name}
          style={{
            width: '100%',
            maxHeight: '250px',
            objectFit: 'cover',
            borderRadius: '6px'
          }}
        />


        <h3
          style={{
            margin: '15px 0 5px',
            fontSize: '1.5rem',
            color: '#333'
          }}
        >
          {item.name}
        </h3>


        <p
          style={{
            color: '#28a745',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          {item.price}
        </p>


        {item.specs && (

          <p
            style={{
              color: '#666',
              fontSize: '0.95rem'
            }}
          >

            Model:
            {item.specs.model}
            {' | '}

            Fuel:
            {item.specs.fuel}
            {' | '}

            Transmission:
            {item.specs.transmission}

          </p>

        )}

      </div>


      {item.isBooked ? (

        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >

          This vehicle is already booked.

        </div>

      ) : (

        <form
          onSubmit={
            handleConfirmBooking
          }
        >

          <div
            style={{
              marginBottom: '1rem'
            }}
          >

            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#333'
              }}
            >
              Start Date:
            </label>


            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                boxSizing:
                  'border-box',
                borderRadius: '4px',
                border:
                  '1px solid #ccc'
              }}
            />

          </div>


          <div
            style={{
              marginBottom: '1rem'
            }}
          >

            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#333'
              }}
            >
              End Date:
            </label>


            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                boxSizing:
                  'border-box',
                borderRadius: '4px',
                border:
                  '1px solid #ccc'
              }}
            />

          </div>


          {totalAmount > 0 && (

            <div
              style={{
                marginBottom: '1.5rem',
                padding: '10px',
                background: '#e9ecef',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#333'
              }}
            >

              Total Amount:

              <span
                style={{
                  color: '#28a745'
                }}
              >
                {' '}
                Rs {totalAmount}
              </span>

            </div>

          )}


          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: loading
                ? '#6c757d'
                : '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading
                ? 'not-allowed'
                : 'pointer'
            }}
          >

            {loading
              ? 'Confirming Booking...'
              : 'Confirm & Rent Now'}

          </button>

        </form>

      )}

    </div>

  );

}