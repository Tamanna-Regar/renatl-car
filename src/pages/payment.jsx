import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const API_URL = 'https://renatl-car-ie8p.onrender.com';

const stripePromise = loadStripe(
  'pk_test_51U8au0RpTYjY22GQmZBP4Nl3Fpm1ViqKc3uar6MXnNOxWFDZuY9nFu5zg7ngNfI7at0QRheOiLaBshU6lEWcURXy00webCuwwb'
);

// PAYMENT FORM

function CheckoutForm({ booking }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: 'if_required'
        });

      if (error) {
        console.error('Stripe Payment Error:', error);
        setMessage(
          error.message ||
            'Payment failed. Please try again.'
        );
        setLoading(false);
        return;
      }

      if (
        paymentIntent &&
        paymentIntent.status === 'succeeded'
      ) {
        const paidAt = new Date().toISOString();

        const paidBooking = {
          ...booking,
          paymentStatus: 'Paid',
          bookingStatus: 'Payment Received',
          status: 'Payment Received',
          paymentId: paymentIntent.id,
          paidAt: paidAt
        };

        const currentBookingId = booking?.bookingId || booking?._id;

        if (!currentBookingId) {
          throw new Error(
            'Booking ID is missing. Cannot update booking.'
          );
        }

        const dbResponse = await fetch(
          `${API_URL}/api/bookings/${currentBookingId}/payment`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              payment_status: 'Paid',
              booking_status: 'Payment Received',
              payment_id: paymentIntent.id,
              paid_at: paidAt
            })
          }
        );

        if (!dbResponse.ok) {
          const dbError = await dbResponse
            .json()
            .catch(() => ({}));

          throw new Error(
            dbError.detail ||
              'MongoDB booking update failed.'
          );
        }

        const allBookings = JSON.parse(
          localStorage.getItem('allBookings') || '[]'
        );

        const updatedAllBookings = allBookings.map((b) =>
          String(b.bookingId || b._id) ===
          String(currentBookingId)
            ? paidBooking
            : b
        );

        localStorage.setItem(
          'allBookings',
          JSON.stringify(updatedAllBookings)
        );

        const userEmail = booking?.userEmail
          ?.trim()
          .toLowerCase();

        if (userEmail) {
          const userKey = `userBookings_${userEmail}`;
          const userBookings = JSON.parse(
            localStorage.getItem(userKey) || '[]'
          );

          const updatedUserBookings =
            userBookings.map((b) =>
              String(b.bookingId || b._id) ===
              String(currentBookingId)
                ? paidBooking
                : b
            );

          localStorage.setItem(
            userKey,
            JSON.stringify(updatedUserBookings)
          );
        }

        const normalUserBookings = JSON.parse(
          localStorage.getItem('userBookings') || '[]'
        );

        const updatedNormalUserBookings =
          normalUserBookings.map((b) =>
            String(b.bookingId || b._id) ===
            String(currentBookingId)
              ? paidBooking
              : b
          );

        localStorage.setItem(
          'userBookings',
          JSON.stringify(updatedNormalUserBookings)
        );

        window.dispatchEvent(
          new Event('bookingsUpdated')
        );

        window.dispatchEvent(
          new Event('paymentUpdated')
        );

        try {
          await fetch(`${API_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: currentBookingId,
              user_email: booking?.userEmail || '',
              type: 'payment_success',
              title: 'Payment Successful',
              message: `Payment of Rs ${booking.totalAmount} received successfully for your booking.`,
              channel: 'email'
            })
          });
        } catch (notificationError) {
          console.error('Notification send failed:', notificationError);
        }

        alert(
          'Payment Successful!\n\n' +
            `Amount: Rs ${booking.totalAmount}\n` +
            `Booking ID: ${currentBookingId}\n\n` +
            'Your booking will be confirmed by our admin shortly.'
        );

        navigate('/my-bookings');
      } else {
        setMessage(
          'Payment is not completed yet.'
        );
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setMessage(
        error?.message ||
          'Something went wrong while processing payment.'
      );
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handlePayment}
      style={{
        marginTop: '20px'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '18px',
          color: '#111'
        }}
      >
        <PaymentElement />
      </div>

      {message && (
        <div
          style={{
            marginTop: '15px',
            padding: '12px',
            borderRadius: '8px',
            background: '#3b1b20',
            color: '#ff9aa5',
            fontSize: '14px'
          }}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        style={{
          width: '100%',
          marginTop: '18px',
          padding: '14px',
          border: 'none',
          borderRadius: '8px',
          background: loading ? '#666' : '#ff8500',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading
            ? 'not-allowed'
            : 'pointer'
        }}
      >
        {loading
          ? 'Processing Payment...'
          : `Pay Rs ${booking.totalAmount}`}
      </button>
    </form>
  );
}

// PAYMENT PAGE

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  const [clientSecret, setClientSecret] =
    useState('');
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!booking) {
      setLoading(false);
      return;
    }

    const createPayment = async () => {
      try {
        const currentBookingId = booking?.bookingId || booking?._id;

        if (!currentBookingId) {
          throw new Error(
            'Booking ID is missing.'
          );
        }

        if (
          !booking?.totalAmount ||
          Number(booking.totalAmount) <= 0
        ) {
          throw new Error(
            'Invalid booking amount.'
          );
        }

        const response = await fetch(
          `${API_URL}/api/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              booking_id: currentBookingId,
              amount: Number(
                booking.totalAmount
              ),
              security_deposit: Number(booking.securityDeposit || booking.security_deposit || 0),
              currency: 'inr',
              email: booking.userEmail || ''
            })
          }
        );

        if (!response.ok) {
          const errorData =
            await response
              .json()
              .catch(() => ({}));

          throw new Error(
            errorData.detail ||
              `Payment server error: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.client_secret) {
          throw new Error(
            'Stripe client secret not received.'
          );
        }

        setClientSecret(
          data.client_secret
        );
      } catch (err) {
        console.error(
          'Payment setup error FULL:',
          err
        );
        setError(
          err?.message ||
            'Payment setup failed.'
        );
      } finally {
        setLoading(false);
      }
    };

    createPayment();
  }, [booking]);

  if (!booking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <h2>No booking found</h2>
        <button
          onClick={() =>
            navigate('/my-bookings')
          }
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: '#ff8500',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <h2>Preparing Payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <h2>Payment Error</h2>
        <p
          style={{
            color: '#ff8b8b',
            textAlign: 'center'
          }}
        >
          {error}
        </p>
        <button
          onClick={() =>
            navigate(-1)
          }
          style={{
            padding: '11px 20px',
            background: '#ff8500',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#ff8500',
        borderRadius: '8px'
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        padding: '30px 20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >
        <button
          onClick={() =>
            navigate(-1)
          }
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: 'none',
            background: '#17202b',
            color: '#ff8500',
            fontSize: '22px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ←
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
            gap: '30px',
            alignItems: 'start'
          }}
        >
          <div>
            <div
              style={{
                background: '#111a23',
                border:
                  '1px solid #263342',
                borderRadius: '14px',
                padding: '25px'
              }}
            >
              <div
                style={{
                  color: '#8993a1',
                  fontSize: '13px',
                  marginBottom: '8px'
                }}
              >
                Your Booking
              </div>

              <h1
                style={{
                  margin: '0 0 10px',
                  color: '#ff8500'
                }}
              >
                {booking.vehicleName}
              </h1>

              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#20d77a',
                  marginBottom: '20px'
                }}
              >
                Rs {booking.totalAmount}
              </div>

              <div
                style={{
                  borderTop:
                    '1px solid #303b49',
                  paddingTop: '15px'
                }}
              >
                <p>
                  <strong>Pickup:</strong>{' '}
                  {booking.startDate}
                </p>
                <p>
                  <strong>Return:</strong>{' '}
                  {booking.endDate}
                </p>
                <p>
                  <strong>Days:</strong>{' '}
                  {booking.totalDays}
                </p>
                <p>
                  <strong>Pickup Location:</strong>{' '}
                  {booking.pickupLocation}
                </p>
                <p>
                  <strong>Customer:</strong>{' '}
                  {booking.userName}
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  {booking.userEmail}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#111a23',
              border:
                '1px solid #263342',
              borderRadius: '14px',
              padding: '25px'
            }}
          >
            <h2
              style={{
                marginTop: 0
              }}
            >
              Complete{' '}
              <span
                style={{
                  color: '#ff8500'
                }}
              >
                Payment
              </span>
            </h2>

            <p
              style={{
                color: '#8993a1',
                fontSize: '14px'
              }}
            >
              Pay securely to confirm
              your booking.
            </p>

            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={options}
              >
                <CheckoutForm
                  booking={booking}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}