import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carsList } from './Cars';
import { bikesList } from './Bikes';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_URL = 'http://127.0.0.1:8000';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition, setPickupLocation }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setPickupLocation(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function Booking() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);

  // BOOKING DATES

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupBranch, setPickupBranch] = useState('Delhi Central');
  const [dropoffBranch, setDropoffBranch] = useState('Delhi Central');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [oneWay, setOneWay] = useState(false);

  // CUSTOMER DETAILS

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // TOTAL

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [pricingBreakdown, setPricingBreakdown] = useState({
    baseSubtotal: 0,
    weekendSurcharge: 0,
    peakSurcharge: 0,
    addonsCost: 0,
    discountAmount: 0,
    subtotal: 0
  });

  // ADD-ONS (FEATURE 4)
  const [addons, setAddons] = useState({ helmet: false, gps: false, insurance: false });
  const ADDON_PRICES = { helmet: 50, gps: 100, insurance: 200 };

  // PROMO & MAP
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [predictedPricing, setPredictedPricing] = useState(null);
  const [geofenceCheck, setGeofenceCheck] = useState(null);

  const [loading, setLoading] = useState(false);

  // LOAD LOGGED-IN USER

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

  // LOAD VEHICLE

  useEffect(() => {
    const defaultList =
      type === 'car' ? carsList : bikesList;

    const listKey =
      type === 'car'
        ? 'rentEasyCarsList'
        : 'rentEasyBikesList';

    let currentList = [...defaultList];

    // LOAD SAVED CARS / BIKES

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

    // LOAD ADMIN FLEET VEHICLES

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

    // FIND VEHICLE

    const found = currentList.find(
      (vehicle) =>
        String(vehicle.id) ===
        String(id)
    );

    setItem(found || null);
  }, [type, id]);

  // CALCULATE PRICE

  useEffect(() => {
    if (!startDate || !endDate || !item) {
      setTotalAmount(0);
      setTotalDays(0);
      setPricingBreakdown({
        baseSubtotal: 0,
        weekendSurcharge: 0,
        peakSurcharge: 0,
        addonsCost: 0,
        discountAmount: 0,
        subtotal: 0
      });
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

      let baseSubtotal = diffDays * priceNumber;
      let weekendSurcharge = 0;
      let peakSurcharge = 0;
      let addonsCost = 0;

      for (let i = 0; i < diffDays; i += 1) {
        const currentDay = new Date(start);
        currentDay.setDate(start.getDate() + i);

        if (currentDay.getDay() === 0 || currentDay.getDay() === 6) {
          weekendSurcharge += priceNumber * 0.10;
        }

        const month = currentDay.getMonth() + 1;
        if ([10, 11, 12, 1, 2].includes(month)) {
          peakSurcharge += priceNumber * 0.15;
        }
      }

      if (addons.helmet) addonsCost += ADDON_PRICES.helmet * diffDays;
      if (addons.gps) addonsCost += ADDON_PRICES.gps * diffDays;
      if (addons.insurance) addonsCost += ADDON_PRICES.insurance * diffDays;

      const subtotal = baseSubtotal + weekendSurcharge + peakSurcharge + addonsCost;
      const discountAmount = discountPercent > 0 ? subtotal * (discountPercent / 100) : 0;
      const calculatedTotal = subtotal - discountAmount;

      setTotalDays(diffDays);
      setPricingBreakdown({
        baseSubtotal,
        weekendSurcharge,
        peakSurcharge,
        addonsCost,
        discountAmount,
        subtotal
      });
      setTotalAmount(calculatedTotal);
    } else {
      setTotalDays(0);
      setTotalAmount(0);
      setPricingBreakdown({
        baseSubtotal: 0,
        weekendSurcharge: 0,
        peakSurcharge: 0,
        addonsCost: 0,
        discountAmount: 0,
        subtotal: 0
      });
    }
  }, [startDate, endDate, item, discountPercent, addons]);

  useEffect(() => {
    if (!startDate || !endDate || !item) {
      setPredictedPricing(null);
      return;
    }

    const runPredictivePricing = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pricing/predictive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_id: String(item.id),
            vehicle_type: type || 'car',
            start_date: startDate,
            end_date: endDate,
            base_price: getPrice(),
            city: city || 'Delhi'
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setPredictedPricing(data);
        } else {
          setPredictedPricing(null);
        }
      } catch (error) {
        console.error('Predictive pricing fetch failed:', error);
        setPredictedPricing(null);
      }
    };

    runPredictivePricing();
  }, [startDate, endDate, item, type, city]);

  // GET PRICE

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

  // VEHICLE SPECS

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

  // TODAY

  const today = new Date()
    .toISOString()
    .split('T')[0];

  // APPLY PROMO

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() })
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountPercent(data.discount_percentage);
        setPromoMessage(`Promo applied! ${data.discount_percentage}% off`);
      } else {
        setDiscountPercent(0);
        setPromoMessage(data.message || 'Invalid Promo');
      }
    } catch (e) {
      setDiscountPercent(0);
      setPromoMessage('Error validating promo');
    }
  };

  const checkVehicleAvailability = async () => {
    if (!item || !startDate || !endDate) {
      return true;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/${encodeURIComponent(item.id)}/availability?start_date=${startDate}&end_date=${endDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to verify availability');
      }

      if (!data.available) {
        alert(
          'This vehicle is already booked for the selected dates. Please choose another date range.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Availability check failed:', error);
      alert(
        'Unable to verify vehicle availability right now. Please try again.'
      );
      return false;
    }
  };

  const checkPickupGeofence = async () => {
    try {
      const response = await fetch(`${API_URL}/api/geofence/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.trim(),
          state: state.trim(),
          vehicle_id: String(item?.id || ''),
          latitude: mapPosition?.lat ?? null,
          longitude: mapPosition?.lng ?? null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Unable to validate pickup location');
      }
      setGeofenceCheck(data);
      if (!data.allowed) {
        alert(data.message || 'This pickup location is not allowed.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Geofence check failed:', error);
      alert('Unable to validate pickup location right now. Please try again.');
      return false;
    }
  };

  // CONFIRM BOOKING

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    // VALIDATION

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

    const isAvailable = await checkVehicleAvailability();
    if (!isAvailable) {
      return;
    }

    const isPickupAllowed = await checkPickupGeofence();
    if (!isPickupAllowed) {
      return;
    }

    setLoading(true);

    try {

      // CALCULATE DAYS

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

      // CLEAN EMAIL

      const cleanEmail =
        email.trim().toLowerCase();

      // BOOKING ID
      // Yeh sirf FALLBACK hai agar backend call fail ho jaye.
      // NOTE: Yeh valid MongoDB ObjectId NAHI hai, isliye agar
      // yehi ID Payment page tak pahunchi, toh payment-intent
      // banate waqt "Invalid booking ID" error aayega.

      let bookingId =
        'BKG_' + Date.now();

      let bookingSavedOnServer = false;

      // SEND TO FASTAPI

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

              pickup_latitude:
                mapPosition?.lat ?? null,

              pickup_longitude:
                mapPosition?.lng ?? null,

              geofence_status:
                geofenceCheck?.status || 'approved',

              geofence_message:
                geofenceCheck?.message || '',

              pickup_branch: pickupBranch,
              dropoff_branch: oneWay ? dropoffBranch : pickupBranch,
              pickup_time: pickupTime,
              return_time: returnTime,
              one_way: oneWay,
              late_fee: 0,

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
            bookingSavedOnServer = true;

              await fetch(`${API_URL}/api/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  booking_id: bookingId,
                  user_email: cleanEmail,
                  type: 'booking_created',
                  title: 'Booking Confirmed',
                  message: `Your booking for ${item.name} has been created successfully.`,
                  channel: 'email'
                })
              });
            }
          } else {
          // Server ne response diya, lekin error status ke saath
          // (jaise 422, 500, etc). Yeh ab silently ignore nahi hoga.

          const errData = await response
            .json()
            .catch(() => ({}));

          console.error(
            'Booking API failed. Status:',
            response.status,
            'Response:',
            errData
          );
        }
      } catch (err) {
        // Network/CORS/connection error — server tak request
        // pahunchi hi nahi.

        console.error(
          'Booking creation network error:',
          err
        );
      }

      // Agar backend par booking save NAHI hui, toh user ko
      // clearly bata do, kyunki fake local ID ke saath Payment
      // page kaam nahi karega (booking DB mein exist nahi karti).

      if (!bookingSavedOnServer) {
        alert(
          'Booking could not be saved to the server. ' +
          'Please check your internet/server connection and try again. ' +
          '(Payment cannot proceed without a valid server booking.)'
        );
        setLoading(false);
        return;
      }

      // COMPLETE BOOKING OBJECT

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

        pickupBranch,
        dropoffBranch: oneWay ? dropoffBranch : pickupBranch,
        pickupTime,
        returnTime,
        oneWay,

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

        // PAYMENT STATUS

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

      // SAVE FOR ADMIN

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

      // SAVE FOR USER

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

      // ALSO UPDATE OLD userBookings

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

      // UPDATE VEHICLE STATUS

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
                isBooked: true,

                status:
                  'booked',

             bookingDetails: {
                  bookingId: newBookingObj.bookingId,
                  userEmail: cleanEmail,
                  userName: fullName.trim(),
                  startDate: startDate,
                  endDate: endDate,
                  totalAmount: calculatedTotal,
                  status: 'Pending Payment',
                  image: item.image || FALLBACK_IMAGE
                }
              };
            }

            return finalVehicle;
          }
        );

      // CUSTOM VEHICLES

      const customVehicles =
        savedList.filter(
          (saved) =>
            !defaultList.some(
              (vehicle) =>
                String(vehicle.id) ===
                String(saved.id)
            )
        );

      // UPDATE RENT EASY LIST

      localStorage.setItem(
        listKey,
        JSON.stringify([
          ...updatedList,
          ...customVehicles
        ])
      );

      // UPDATE FLEET VEHICLES
      // PAYMENT SE PEHLE AVAILABLE

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

      // REFRESH COMPONENTS

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

      // GO TO PAYMENT

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

  // ITEM NOT FOUND

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

  // UI

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

        {/* BACK BUTTON */}
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

        {/* MAIN GRID */}
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

          {/* LEFT SIDE */}
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

            {/* VEHICLE SPECS */}
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

            {/* ABOUT CAR */}
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

          {/* RIGHT BOOKING CARD */}
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

                {/* DATES */}
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

                <div style={{ marginBottom: '14px', background: '#182534', padding: '14px', borderRadius: '8px', border: '1px solid #334152' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
                    <input type="checkbox" checked={oneWay} onChange={(e) => setOneWay(e.target.checked)} />
                    One-way rental (different return branch)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                    <label style={{ color: '#aeb6c2', fontSize: '12px' }}>
                      Pickup branch
                      <select value={pickupBranch} onChange={(e) => setPickupBranch(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '10px', background: '#151e28', color: '#fff', border: '1px solid #334152', borderRadius: '7px' }}>
                        <option>Delhi Central</option><option>Noida Sector 18</option><option>Gurgaon Cyber Hub</option><option>Jaipur Airport</option>
                      </select>
                    </label>
                    <label style={{ color: '#aeb6c2', fontSize: '12px' }}>
                      Return branch
                      <select value={dropoffBranch} onChange={(e) => setDropoffBranch(e.target.value)} disabled={!oneWay} style={{ width: '100%', marginTop: '6px', padding: '10px', background: '#151e28', color: '#fff', border: '1px solid #334152', borderRadius: '7px' }}>
                        <option>Delhi Central</option><option>Noida Sector 18</option><option>Gurgaon Cyber Hub</option><option>Jaipur Airport</option>
                      </select>
                    </label>
                    <label style={{ color: '#aeb6c2', fontSize: '12px' }}>
                      Pickup time
                      <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '10px', boxSizing: 'border-box', background: '#151e28', color: '#fff', border: '1px solid #334152', borderRadius: '7px' }} />
                    </label>
                    <label style={{ color: '#aeb6c2', fontSize: '12px' }}>
                      Return time
                      <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '10px', boxSizing: 'border-box', background: '#151e28', color: '#fff', border: '1px solid #334152', borderRadius: '7px' }} />
                    </label>
                  </div>
                </div>

                {/* PICKUP LOCATION WITH MAP */}
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
                    Select Pickup Location on Map
                  </label>

                  <div style={{ height: '200px', width: '100%', borderRadius: '7px', overflow: 'hidden', border: '1px solid #334152', marginBottom: '10px' }}>
                    <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker position={mapPosition} setPosition={setMapPosition} setPickupLocation={setPickupLocation} />
                    </MapContainer>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter pickup location or click on map"
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

                {geofenceCheck && (
                  <div
                    style={{
                      marginBottom: '14px',
                      padding: '10px 12px',
                      borderRadius: '7px',
                      border: `1px solid ${geofenceCheck.allowed ? '#2563eb' : '#dc2626'}`,
                      background: geofenceCheck.allowed ? '#10233f' : '#3a1717',
                      color: '#dbeafe',
                      fontSize: '12px',
                    }}
                  >
                    <strong>
                      {geofenceCheck.allowed ? 'Location check passed' : 'Location blocked'}
                    </strong>
                    <div style={{ marginTop: '4px' }}>{geofenceCheck.message}</div>
                    {geofenceCheck.warnings?.map((warning, index) => (
                      <div key={`${warning}-${index}`} style={{ marginTop: '4px', color: '#fde68a' }}>
                        {warning}
                      </div>
                    ))}
                  </div>
                )}

                {/* FULL NAME */}
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

                {/* EMAIL + PHONE */}
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

                {/* CITY STATE ZIP */}
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

                {/* ADD-ONS SECTION (FEATURE 4) */}
                <div style={{ marginBottom: '16px', background: '#1a2430', padding: '15px', borderRadius: '8px', border: '1px solid #334152' }}>
                  <label style={{ display: 'block', color: '#aeb6c2', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
                    Extras & Add-ons (Per Day)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={addons.helmet} 
                        onChange={(e) => setAddons({ ...addons, helmet: e.target.checked })} 
                      />
                      ⛑️ Helmet (+₹{ADDON_PRICES.helmet}/day)
                    </label>
                    <label style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={addons.gps} 
                        onChange={(e) => setAddons({ ...addons, gps: e.target.checked })} 
                      />
                      📍 GPS Navigation (+₹{ADDON_PRICES.gps}/day)
                    </label>
                    <label style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={addons.insurance} 
                        onChange={(e) => setAddons({ ...addons, insurance: e.target.checked })} 
                      />
                      🛡️ Premium Insurance (+₹{ADDON_PRICES.insurance}/day)
                    </label>
                  </div>
                </div>

                {/* PROMO CODE SECTION */}
                <div style={{ marginBottom: '14px', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{ flex: 1, padding: '11px', background: '#151e28', color: '#fff', border: '1px solid #334152', borderRadius: '7px' }}
                  />
                  <button type="button" onClick={handleApplyPromo} style={{ padding: '0 15px', background: '#ff8500', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>Apply</button>
                </div>
                {promoMessage && <p style={{ color: discountPercent > 0 ? '#20d77a' : '#ff9aa5', fontSize: '13px', marginTop: '-10px', marginBottom: '14px' }}>{promoMessage}</p>}

                {predictedPricing && (
                  <div style={{ marginBottom: '14px', background: '#182534', border: '1px solid #2c4d72', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#8ad5ff', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Pricing Signal</span>
                      <span style={{ color: '#20d77a', fontWeight: '700', fontSize: '12px' }}>{predictedPricing.forecast_label}</span>
                    </div>
                    <div style={{ color: '#ebf3ff', fontSize: '14px', marginBottom: '6px' }}>
                      Suggested rate: <strong>Rs {predictedPricing.recommended_rate_per_day}</strong> / day
                    </div>
                    <div style={{ color: '#b8c0cc', fontSize: '12px' }}>
                      Demand forecast: {predictedPricing.adjustment_percent > 0 ? '+' : ''}{predictedPricing.adjustment_percent}% vs base fare for {predictedPricing.city}
                    </div>
                  </div>
                )}

                {/* PRICE SUMMARY */}
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
                    <>
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

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          color:
                            '#b8c0cc',
                          fontSize:
                            '12px',
                          marginBottom:
                            '6px'
                        }}
                      >
                        <span>
                          Base fare
                        </span>

                        <span>
                          Rs {pricingBreakdown.baseSubtotal}
                        </span>
                      </div>

                      {pricingBreakdown.weekendSurcharge > 0 && (
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            color:
                              '#b8c0cc',
                            fontSize:
                              '12px',
                            marginBottom:
                              '6px'
                          }}
                        >
                          <span>
                            Weekend surcharge
                          </span>

                          <span>
                            +Rs {pricingBreakdown.weekendSurcharge}
                          </span>
                        </div>
                      )}

                      {pricingBreakdown.peakSurcharge > 0 && (
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            color:
                              '#b8c0cc',
                            fontSize:
                              '12px',
                            marginBottom:
                              '6px'
                          }}
                        >
                          <span>
                            Peak season charge
                          </span>

                          <span>
                            +Rs {pricingBreakdown.peakSurcharge}
                          </span>
                        </div>
                      )}

                      {pricingBreakdown.addonsCost > 0 && (
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            color:
                              '#b8c0cc',
                            fontSize:
                              '12px',
                            marginBottom:
                              '6px'
                          }}
                        >
                          <span>
                            Add-ons
                          </span>

                          <span>
                            +Rs {pricingBreakdown.addonsCost}
                          </span>
                        </div>
                      )}

                      {pricingBreakdown.discountAmount > 0 && (
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            color:
                              '#b8c0cc',
                            fontSize:
                              '12px',
                            marginBottom:
                              '8px'
                          }}
                        >
                          <span>
                            Discount
                          </span>

                          <span>
                            -Rs {pricingBreakdown.discountAmount}
                          </span>
                        </div>
                      )}
                    </>
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

                {/* PAYMENT BUTTON */}
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