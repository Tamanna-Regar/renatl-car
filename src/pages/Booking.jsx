import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carsList } from './Cars';
import { bikesList } from './Bikes';

const API_URL = 'http://localhost:8000';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';

export default function Booking() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);

  // =========================
  // BOOKING DATES
  // =========================
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // =========================
  // CUSTOMER DETAILS
  // =========================
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // =========================
  // TOTAL
  // =========================
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD LOGGED-IN USER
  // =========================
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        const user = JSON.parse(savedUser);

        const savedName =
          user.name ||
          user.fullName ||
          user.username ||
          '';

        const savedEmail =
          user.email ||
          user.username ||
          '';

        setFullName(savedName);
        setEmail(savedEmail);
      }
    } catch (error) {
      console.log('User data not found:', error);
    }
  }, []);

  // =========================
  // LOAD VEHICLE
  // =========================
  useEffect(() => {
    const defaultList =
      type === 'car' ? carsList : bikesList;

    const listKey =
      type === 'car'
        ? 'rentEasyCarsList'
        : 'rentEasyBikesList';

    let currentList = [...defaultList];

    // =========================
    // LOAD SAVED CARS / BIKES
    // =========================
    try {
      const savedData =
        localStorage.getItem(listKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);

        if (Array.isArray(parsed)) {
          currentList = defaultList.map((vehicle) => {
            const savedVehicle = parsed.find(
              (p) =>
                String(p.id) ===
                String(vehicle.id)
            );

            return savedVehicle
              ? {
                  ...vehicle,
                  ...savedVehicle
                }
              : vehicle;
          });

          const customVehicles =
            parsed.filter(
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
      }
    } catch (error) {
      console.error(
        'Cars/Bikes LocalStorage error:',
        error
      );
    }

    // =========================
    // LOAD ADMIN FLEET VEHICLES
    // =========================
    try {
      const fleetData =
        localStorage.getItem('fleetVehicles');

      if (fleetData) {
        const fleetVehicles =
          JSON.parse(fleetData);

        if (Array.isArray(fleetVehicles)) {
          const correctTypeVehicles =
            fleetVehicles.filter((vehicle) => {
              const vehicleType =
                String(
                  vehicle.type ||
                    vehicle.vehicleType ||
                    ''
                ).toLowerCase();

              return (
                vehicleType ===
                String(type).toLowerCase()
              );
            });

          correctTypeVehicles.forEach(
            (fleetVehicle) => {
              const existingIndex =
                currentList.findIndex(
                  (vehicle) =>
                    String(vehicle.id) ===
                    String(fleetVehicle.id)
                );

              if (existingIndex >= 0) {
                currentList[existingIndex] = {
                  ...currentList[existingIndex],
                  ...fleetVehicle
                };
              } else {
                currentList.push(
                  fleetVehicle
                );
              }
            }
          );
        }
      }
    } catch (error) {
      console.error(
        'Fleet vehicles error:',
        error
      );
    }

    // =========================
    // FIND VEHICLE
    // =========================
    const found = currentList.find(
      (vehicle) =>
        String(vehicle.id) ===
        String(id)
    );

    setItem(found || null);
  }, [type, id]);

  // =========================
  // CALCULATE PRICE
  // =========================
  useEffect(() => {
    if (!startDate || !endDate || !item) {
      setTotalAmount(0);
      setTotalDays(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime =
      end.getTime() -
      start.getTime();

    const diffDays =
      Math.ceil(
        diffTime /
          (1000 * 60 * 60 * 24)
      ) + 1;

    if (diffDays > 0) {
      const priceNumber =
        parseInt(
          String(item.price || 0).replace(
            /[^0-9]/g,
            ''
          )
        ) || 0;

      setTotalDays(diffDays);
      setTotalAmount(
        diffDays * priceNumber
      );
    } else {
      setTotalDays(0);
      setTotalAmount(0);
    }
  }, [startDate, endDate, item]);

  // =========================
  // GET PRICE
  // =========================
  const getPrice = () => {
    return (
      parseInt(
        String(item?.price || 0).replace(
          /[^0-9]/g,
          ''
        )
      ) || 0
    );
  };

  // =========================
  // VEHICLE SPECS
  // =========================
  const getSeats = () => {
    return (
      item?.seats ||
      item?.specs?.seats ||
      item?.capacity ||
      5
    );
  };

  const getFuel = () => {
    return (
      item?.fuel ||
      item?.specs?.fuel ||
      'Petrol'
    );
  };

  const getMileage = () => {
    return (
      item?.mileage ||
      item?.specs?.mileage ||
      'N/A'
    );
  };

  const getTransmission = () => {
    return (
      item?.transmission ||
      item?.specs?.transmission ||
      'Manual'
    );
  };

  // =========================
  // TODAY
  // =========================
  const today = new Date()
    .toISOString()
    .split('T')[0];

  // =========================
  // CONFIRM BOOKING
  // =========================
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    // =========================
    // VALIDATION
    // =========================
    if (!startDate || !endDate) {
      alert(
        'Please select Pickup Date and Return Date!'
      );
      return;
    }

    if (startDate < today) {
      alert(
        'Pickup Date cannot be before today!'
      );
      return;
    }

    if (
      new Date(startDate) >
      new Date(endDate)
    ) {
      alert(
        'Return Date cannot be earlier than Pickup Date!'
      );
      return;
    }

    if (!pickupLocation.trim()) {
      alert(
        'Please enter Pickup Location!'
      );
      return;
    }

    if (!fullName.trim()) {
      alert(
        'Please enter your Full Name!'
      );
      return;
    }

    if (!email.trim()) {
      alert(
        'Please enter your Email Address!'
      );
      return;
    }

    if (!phone.trim()) {
      alert(
        'Please enter your Phone Number!'
      );
      return;
    }

    if (!city.trim()) {
      alert(
        'Please enter your City!'
      );
      return;
    }

    if (!state.trim()) {
      alert(
        'Please enter your State!'
      );
      return;
    }

    if (!zipCode.trim()) {
      alert(
        'Please enter ZIP / Postal Code!'
      );
      return;
    }

    if (!item) {
      alert('Vehicle not found!');
      return;
    }

    if (item.isBooked) {
      alert(
        'This vehicle is already booked.'
      );
      return;
    }

    setLoading(true);

    try {
      // =========================
      // CALCULATE DAYS
      // =========================
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diffTime =
        end.getTime() -
        start.getTime();

      const calculatedDays =
        Math.ceil(
          diffTime /
            (1000 * 60 * 60 * 24)
        ) + 1;

      const priceNumber = getPrice();

      const calculatedTotal =
        calculatedDays * priceNumber;

      // =========================
      // CLEAN EMAIL
      // =========================
      const cleanEmail =
        email.trim().toLowerCase();

      // =========================
      // BOOKING ID
      // =========================
      let bookingId =
        'BKG_' + Date.now();

      // =========================
      // SEND TO FASTAPI
      // =========================
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
              user_email:
                cleanEmail,

              user_name:
                fullName.trim(),

              phone:
                phone.trim(),

              vehicle_id:
                String(item.id),

              vehicle_name:
                item.name,

              vehicle_type:
                type,

              image:
                item.image ||
                FALLBACK_IMAGE,

              start_date:
                startDate,

              end_date:
                endDate,

              pickup_location:
                pickupLocation.trim(),

              city:
                city.trim(),

              state:
                state.trim(),

              zip_code:
                zipCode.trim(),

              total_days:
                calculatedDays,

              rate_per_day:
                priceNumber,

              total_price:
                calculatedTotal,

              // PAYMENT
              status:
                'Pending Payment',

              payment_status:
                'Pending',

              booking_status:
                'Pending Payment'
            })
          }
        );

        if (response.ok) {
          const data =
            await response.json();

          if (data.booking_id) {
            bookingId =
              data.booking_id;
          }
        }
      } catch (err) {
        console.log(
          'Backend offline, using local storage backup.'
        );
      }

      // =========================
      // COMPLETE BOOKING OBJECT
      // =========================
      const newBookingObj = {
        bookingId:
          bookingId,

        userEmail:
          cleanEmail,

        userName:
          fullName.trim(),

        phone:
          phone.trim(),

        vehicleId:
          String(item.id),

        vehicleName:
          item.name,

        vehicleType:
          type,

        image:
          item.image ||
          FALLBACK_IMAGE,

        startDate:
          startDate,

        endDate:
          endDate,

        pickupLocation:
          pickupLocation.trim(),

        city:
          city.trim(),

        state:
          state.trim(),

        zipCode:
          zipCode.trim(),

        totalDays:
          calculatedDays,

        ratePerDay:
          priceNumber,

        totalAmount:
          calculatedTotal,

        // =========================
        // PAYMENT STATUS
        // =========================
        status:
          'Pending Payment',

        paymentStatus:
          'Pending',

        bookingStatus:
          'Pending Payment',

        paymentId:
          null,

        paidAt:
          null,

        createdAt:
          new Date().toISOString()
      };

      // =========================
      // SAVE FOR ADMIN
      // =========================
      const existingAdminBookings =
        JSON.parse(
          localStorage.getItem(
            'allBookings'
          ) || '[]'
        );

      localStorage.setItem(
        'allBookings',
        JSON.stringify([
          newBookingObj,
          ...existingAdminBookings
        ])
      );

      // =========================
      // SAVE FOR USER
      // =========================
      const userKey =
        `userBookings_${cleanEmail}`;

      const existingUserBookings =
        JSON.parse(
          localStorage.getItem(
            userKey
          ) || '[]'
        );

      localStorage.setItem(
        userKey,
        JSON.stringify([
          newBookingObj,
          ...existingUserBookings
        ])
      );

      // =========================
      // ALSO UPDATE OLD userBookings
      // =========================
      const oldUserBookings =
        JSON.parse(
          localStorage.getItem(
            'userBookings'
          ) || '[]'
        );

      localStorage.setItem(
        'userBookings',
        JSON.stringify([
          newBookingObj,
          ...oldUserBookings
        ])
      );

      // =========================
      // UPDATE VEHICLE STATUS
      // IMPORTANT:
      // PAYMENT SE PEHLE BOOKED NAHI
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
          localStorage.getItem(
            listKey
          );

        savedList = saved
          ? JSON.parse(saved)
          : [];
      } catch (error) {
        savedList = [];
      }

      const updatedList =
        defaultList.map(
          (vehicle) => {
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

                // PAYMENT SE PEHLE
                // VEHICLE AVAILABLE
                isBooked: false,

                status:
                  'available',

                bookingDetails:
                  newBookingObj
              };
            }

            return finalVehicle;
          }
        );

      // =========================
      // CUSTOM VEHICLES
      // =========================
      const customVehicles =
        savedList.filter(
          (saved) =>
            !defaultList.some(
              (vehicle) =>
                String(vehicle.id) ===
                String(saved.id)
            )
        );

      // =========================
      // UPDATE RENT EASY LIST
      // =========================
      localStorage.setItem(
        listKey,
        JSON.stringify([
          ...updatedList,
          ...customVehicles
        ])
      );

      // =========================
      // UPDATE FLEET VEHICLES
      // PAYMENT SE PEHLE AVAILABLE
      // =========================
      try {
        const fleetData =
          localStorage.getItem(
            'fleetVehicles'
          );

        if (fleetData) {
          const fleetVehicles =
            JSON.parse(fleetData);

          if (
            Array.isArray(
              fleetVehicles
            )
          ) {
            const updatedFleet =
              fleetVehicles.map(
                (vehicle) => {
                  if (
                    String(
                      vehicle.id
                    ) ===
                    String(item.id)
                  ) {
                    return {
                      ...vehicle,

                      isBooked:
                        false,

                      status:
                        'available',

                      bookingDetails:
                        newBookingObj
                    };
                  }

                  return vehicle;
                }
              );

            localStorage.setItem(
              'fleetVehicles',
              JSON.stringify(
                updatedFleet
              )
            );
          }
        }
      } catch (error) {
        console.error(
          'Fleet update error:',
          error
        );
      }

      // =========================
      // REFRESH COMPONENTS
      // =========================
      window.dispatchEvent(
        new Event(
          type === 'car'
            ? 'rentEasyCarsUpdated'
            : 'rentEasyBikesUpdated'
        )
      );

      window.dispatchEvent(
        new Event(
          'fleetVehiclesUpdated'
        )
      );

      window.dispatchEvent(
        new Event(
          'bookingsUpdated'
        )
      );

      // =========================
      // GO TO PAYMENT
      // =========================
      navigate('/payment', {
        state: {
          booking:
            newBookingObj
        }
      });

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
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '30px'
        }}
      >
        <h2>
          Vehicle not found!
        </h2>

        <button
          onClick={() =>
            navigate(-1)
          }
          style={{
            marginTop: '15px',
            padding:
              '10px 20px',
            border: 'none',
            borderRadius:
              '8px',
            background:
              '#ff8a00',
            color: '#fff',
            cursor:
              'pointer'
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '1050px',
          margin: '0 auto'
        }}
      >

        {/* =======================
            BACK BUTTON
        ======================= */}
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          style={{
            width: '42px',
            height: '42px',
            borderRadius:
              '50%',
            border: 'none',
            background:
              '#17202b',
            color:
              '#ff8a00',
            fontSize:
              '22px',
            cursor:
              'pointer',
            marginBottom:
              '15px'
          }}
        >
          ←
        </button>

        {/* =======================
            MAIN GRID
        ======================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1.7fr) minmax(340px, 0.9fr)',
            gap: '25px',
            alignItems:
              'start'
          }}
        >

          {/* =====================
              LEFT SIDE
          ===================== */}
          <div>

            {/* VEHICLE IMAGE */}
            <div
              style={{
                background:
                  '#111820',
                border:
                  '1px solid #202b38',
                borderRadius:
                  '14px',
                overflow:
                  'hidden',
                position:
                  'relative'
              }}
            >
              <img
                src={
                  item.image ||
                  FALLBACK_IMAGE
                }
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src =
                    FALLBACK_IMAGE;
                }}
                style={{
                  width: '100%',
                  height: '310px',
                  objectFit:
                    'cover',
                  display:
                    'block'
                }}
              />

              <div
                style={{
                  position:
                    'absolute',
                  right: '15px',
                  bottom: '15px',
                  width: '11px',
                  height: '11px',
                  borderRadius:
                    '50%',
                  background:
                    '#ff8500'
                }}
              />
            </div>

            {/* VEHICLE NAME */}
            <h1
              style={{
                margin:
                  '18px 0 5px',
                fontSize:
                  '28px',
                color:
                  '#ff8500'
              }}
            >
              {item.name}
            </h1>

            {/* PRICE */}
            <div
              style={{
                fontSize:
                  '24px',
                fontWeight:
                  'bold',
                color:
                  '#20d77a',
                marginBottom:
                  '20px'
              }}
            >
              Rs {getPrice()}

              <span
                style={{
                  fontSize:
                    '14px',
                  color:
                    '#aaa',
                  marginLeft:
                    '6px'
                }}
              >
                / day
              </span>
            </div>

            {/* ===================
                VEHICLE SPECS
            =================== */}
            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                gap:
                  '12px'
              }}
            >

              {/* SEATS */}
              <div
                style={{
                  background:
                    '#111a23',
                  border:
                    '1px solid #263342',
                  borderRadius:
                    '10px',
                  padding:
                    '18px 10px',
                  textAlign:
                    'center'
                }}
              >
                <div
                  style={{
                    fontSize:
                      '22px'
                  }}
                >
                  👤
                </div>

                <div
                  style={{
                    color:
                      '#8993a1',
                    fontSize:
                      '12px',
                    marginTop:
                      '6px'
                  }}
                >
                  Seats
                </div>

                <strong>
                  {getSeats()}
                </strong>
              </div>

              {/* FUEL */}
              <div
                style={{
                  background:
                    '#111a23',
                  border:
                    '1px solid #263342',
                  borderRadius:
                    '10px',
                  padding:
                    '18px 10px',
                  textAlign:
                    'center'
                }}
              >
                <div
                  style={{
                    fontSize:
                      '22px'
                  }}
                >
                  ⛽
                </div>

                <div
                  style={{
                    color:
                      '#8993a1',
                    fontSize:
                      '12px',
                    marginTop:
                      '6px'
                  }}
                >
                  Fuel
                </div>

                <strong>
                  {getFuel()}
                </strong>
              </div>

              {/* MILEAGE */}
              <div
                style={{
                  background:
                    '#111a23',
                  border:
                    '1px solid #263342',
                  borderRadius:
                    '10px',
                  padding:
                    '18px 10px',
                  textAlign:
                    'center'
                }}
              >
                <div
                  style={{
                    fontSize:
                      '22px'
                  }}
                >
                  ◉
                </div>

                <div
                  style={{
                    color:
                      '#8993a1',
                    fontSize:
                      '12px',
                    marginTop:
                      '6px'
                  }}
                >
                  Mileage
                </div>

                <strong>
                  {getMileage()}
                </strong>
              </div>

              {/* TRANSMISSION */}
              <div
                style={{
                  background:
                    '#111a23',
                  border:
                    '1px solid #263342',
                  borderRadius:
                    '10px',
                  padding:
                    '18px 10px',
                  textAlign:
                    'center'
                }}
              >
                <div
                  style={{
                    fontSize:
                      '22px'
                  }}
                >
                  ⚙
                </div>

                <div
                  style={{
                    color:
                      '#8993a1',
                    fontSize:
                      '12px',
                    marginTop:
                      '6px'
                  }}
                >
                  Transmission
                </div>

                <strong>
                  {getTransmission()}
                </strong>
              </div>
            </div>

            {/* ===================
                ABOUT CAR
            =================== */}
            <div
              style={{
                marginTop:
                  '20px',
                background:
                  '#111a23',
                border:
                  '1px solid #263342',
                borderRadius:
                  '10px',
                padding:
                  '20px'
              }}
            >
              <h2
                style={{
                  marginTop: 0
                }}
              >
                About this{' '}
                {type === 'car'
                  ? 'car'
                  : 'bike'}
              </h2>

              <p
                style={{
                  color:
                    '#aeb6c2',
                  lineHeight:
                    '1.6'
                }}
              >
                {item.description ||
                  `Experience a comfortable and reliable journey with ${item.name}. This vehicle is available for rental and can be booked by selecting your pickup and return dates.`}
              </p>
            </div>
          </div>

          {/* =====================
              RIGHT BOOKING CARD
          ===================== */}
          <div
            style={{
              background:
                '#111a23',
              border:
                '1px solid #263342',
              borderRadius:
                '14px',
              padding:
                '20px',
              position:
                'sticky',
              top: '20px'
            }}
          >

            <h2
              style={{
                margin:
                  '0 0 5px',
                fontSize:
                  '21px'
              }}
            >
              Reserve{' '}
              <span
                style={{
                  color:
                    '#ff8500'
                }}
              >
                Your Drive
              </span>
            </h2>

            <p
              style={{
                color:
                  '#8993a1',
                fontSize:
                  '13px',
                marginBottom:
                  '20px'
              }}
            >
              Fast · Secure · Easy
            </p>

            {item.isBooked ? (

              <div
                style={{
                  background:
                    '#3b1b20',
                  border:
                    '1px solid #762f39',
                  color:
                    '#ff9aa5',
                  padding:
                    '15px',
                  borderRadius:
                    '8px',
                  textAlign:
                    'center',
                  fontWeight:
                    'bold'
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

                {/* =================
                    DATES
                ================= */}
                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '10px',
                    marginBottom:
                      '14px'
                  }}
                >

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      Pickup Date
                    </label>

                    <input
                      type="date"
                      min={today}
                      value={
                        startDate
                      }
                      onChange={(e) =>
                        setStartDate(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      Return Date
                    </label>

                    <input
                      type="date"
                      min={
                        startDate ||
                        today
                      }
                      value={
                        endDate
                      }
                      onChange={(e) =>
                        setEndDate(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>
                </div>

                {/* =================
                    PICKUP LOCATION
                ================= */}
                <div
                  style={{
                    marginBottom:
                      '14px'
                  }}
                >
                  <label
                    style={{
                      display:
                        'block',
                      color:
                        '#aeb6c2',
                      fontSize:
                        '12px',
                      marginBottom:
                        '6px'
                    }}
                  >
                    Pickup Location
                  </label>

                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={
                      pickupLocation
                    }
                    onChange={(e) =>
                      setPickupLocation(
                        e.target.value
                      )
                    }
                    required
                    style={{
                      width:
                        '100%',
                      boxSizing:
                        'border-box',
                      padding:
                        '11px',
                      background:
                        '#151e28',
                      color:
                        '#fff',
                      border:
                        '1px solid #334152',
                      borderRadius:
                        '7px',
                      outline:
                        'none'
                    }}
                  />
                </div>

                {/* =================
                    FULL NAME
                ================= */}
                <div
                  style={{
                    marginBottom:
                      '14px'
                  }}
                >
                  <label
                    style={{
                      display:
                        'block',
                      color:
                        '#aeb6c2',
                      fontSize:
                        '12px',
                      marginBottom:
                        '6px'
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your full name"
                    value={
                      fullName
                    }
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    required
                    style={{
                      width:
                        '100%',
                      boxSizing:
                        'border-box',
                      padding:
                        '11px',
                      background:
                        '#151e28',
                      color:
                        '#fff',
                      border:
                        '1px solid #334152',
                      borderRadius:
                        '7px',
                      outline:
                        'none'
                    }}
                  />
                </div>

                {/* =================
                    EMAIL + PHONE
                ================= */}
                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '10px',
                    marginBottom:
                      '14px'
                  }}
                >

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Your email"
                      value={
                        email
                      }
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={
                        phone
                      }
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>
                </div>

                {/* =================
                    CITY STATE ZIP
                ================= */}
                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr 0.9fr',
                    gap: '10px',
                    marginBottom:
                      '16px'
                  }}
                >

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      City
                    </label>

                    <input
                      type="text"
                      placeholder="Your city"
                      value={
                        city
                      }
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      State
                    </label>

                    <input
                      type="text"
                      placeholder="Your state"
                      value={
                        state
                      }
                      onChange={(e) =>
                        setState(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        color:
                          '#aeb6c2',
                        fontSize:
                          '12px',
                        marginBottom:
                          '6px'
                      }}
                    >
                      ZIP Code
                    </label>

                    <input
                      type="text"
                      placeholder="ZIP / Postal"
                      value={
                        zipCode
                      }
                      onChange={(e) =>
                        setZipCode(
                          e.target.value
                        )
                      }
                      required
                      style={{
                        width:
                          '100%',
                        boxSizing:
                          'border-box',
                        padding:
                          '11px',
                        background:
                          '#151e28',
                        color:
                          '#fff',
                        border:
                          '1px solid #334152',
                        borderRadius:
                          '7px',
                        outline:
                          'none'
                      }}
                    />
                  </div>
                </div>

                {/* =================
                    PRICE SUMMARY
                ================= */}
                <div
                  style={{
                    background:
                      '#1a2532',
                    border:
                      '1px solid #344255',
                    borderRadius:
                      '8px',
                    padding:
                      '12px',
                    marginBottom:
                      '14px'
                  }}
                >

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      color:
                        '#b8c0cc',
                      fontSize:
                        '13px',
                      marginBottom:
                        '8px'
                    }}
                  >
                    <span>
                      Rate/day
                    </span>

                    <span>
                      Rs {getPrice()}
                    </span>
                  </div>

                  {totalDays > 0 && (
                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        color:
                          '#b8c0cc',
                        fontSize:
                          '13px',
                        marginBottom:
                          '8px'
                      }}
                    >
                      <span>
                        Total Days
                      </span>

                      <span>
                        {totalDays}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      color:
                        '#fff',
                      fontWeight:
                        'bold',
                      fontSize:
                        '15px',
                      paddingTop:
                        '8px',
                      borderTop:
                        '1px solid #3b4654'
                    }}
                  >
                    <span>
                      Total
                    </span>

                    <span
                      style={{
                        color:
                          '#20d77a'
                      }}
                    >
                      Rs {totalAmount}
                    </span>
                  </div>
                </div>

                {/* =================
                    PAYMENT BUTTON
                ================= */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width:
                      '100%',
                    padding:
                      '13px',
                    border:
                      'none',
                    borderRadius:
                      '7px',
                    background:
                      loading
                        ? '#555'
                        : '#ff8500',
                    color:
                      '#fff',
                    fontSize:
                      '15px',
                    fontWeight:
                      'bold',
                    cursor:
                      loading
                        ? 'not-allowed'
                        : 'pointer',
                    transition:
                      '0.2s'
                  }}
                >
                  {loading
                    ? 'Preparing Payment...'
                    : '▣  Proceed to Payment'}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}