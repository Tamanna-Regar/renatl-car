# 🚗 Rental Car Booking Platform

A full-stack car rental platform with real-time fleet tracking, secure payments, and digital vehicle inspection — built independently as part of my Software Development Internship.

## Features

- **User & Admin Authentication** — Secure login/register system with role-based access
- **Vehicle Booking Management** — Create, extend, cancel, and track bookings with real-time status updates
- **Live Fleet Tracking** — Real-time GPS tracking via WebSocket, route history, and geofencing for active rentals
- **Digital Vehicle Inspection** — Pickup and drop-off inspection with photo-based damage comparison
- **Payments & Deposits** — Stripe payment gateway integration with deposit ledger, automated late-fee calculation, and refund handling
- **Wallet & Loyalty System** — In-app wallet with credit/redeem functionality and loyalty points
- **Dynamic Pricing Engine** — Predictive and demand-based pricing calculation
- **Fraud Risk Detection** — Automated risk scoring for bookings
- **SOS / Emergency Alerts** — In-trip emergency notification system
- **Fleet Health Monitoring** — Maintenance work orders and fleet health alerts
- **Marketplace Listings** — Peer-to-peer vehicle listing support
- **Corporate Bookings** — Dedicated booking flow for corporate clients
- **Admin Dashboard** — Branch-wise analytics, vehicle management, and user verification
- **Reviews & Ratings** — Customer feedback system

## Tech Stack

**Frontend:** React.js, Vite  
**Backend:** Python (FastAPI), MongoDB (Motor - async driver)  
**Real-time:** WebSockets  
**Payments:** Stripe API  
**Auth:** JWT-based authentication

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a `.env` file in the `server` folder (see `.env.example`) with your own credentials — never commit real API keys or secrets.

## Author

**Tamanna Regar**  
[GitHub](https://github.com/Tamanna-Regar) | [LinkedIn](https://linkedin.com/in/tamanna-regar-139a21382)

##fronted
https://ridehub-rental-car.netlify.app/

###backend
https://renatl-car-ie8p.onrender.com
