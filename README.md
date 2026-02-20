---

# 🌍 TravelMate — AI-Powered Local Travel & Safety Platform
Smart Travel Companion with AI Planning, Verified Local Guides & Real-Time Safety System

---

## 🚀 Live Deployment

* 🌐 **Frontend (Vercel):** [https://travel-mate-seven-nu.vercel.app](https://travel-mate-seven-nu.vercel.app)
* ⚙️ **Backend:** Deployed on Render Cloud  (https://travelmate-hxlu.onrender.com)
* 🗂 **Monorepo Structure:** `client/` + `server/`

---

## 📌 Overview

TravelMate is a full-stack AI-powered travel platform designed to help users explore new cities **safely, intelligently, and efficiently**.

It combines:

* 🧠 AI-based day planning
* 👨‍🏫 Verified local guide booking
* 📡 Real-time safety alerts
* 🚨 SOS emergency system
* 📊 Admin monitoring dashboard
* 🔐 Multi-role authentication

The platform focuses on **safe, personalized, and intelligent urban exploration**.

---

# 🎯 Key Features

---

## 👤 Multi-Role Authentication System

The platform supports three distinct user roles:

### 1️⃣ Traveler Login

* Explore destinations
* AI “Plan My Day” feature
* Book verified guides
* Real-time chat with guide
* Safety tools (SOS, fake call, siren)
* Booking history & ratings

---

### 2️⃣ Guide Login

* Accept / Reject bookings
* View pending & completed sessions
* Earnings dashboard
* Availability management
* Real-time chat with travelers
* Profile & pricing management

---

### 3️⃣ Admin Login

* Approve / Reject guide registrations
* Monitor active users
* View safety alerts
* Manage destinations & places
* Analytics dashboard
* System health monitoring

---

# 🧠 AI Travel Orchestrator

AI Companion provides:

* ✨ “Plan My Day” itinerary generation
* 🍽 Restaurant recommendations
* 🏛 Tourist attraction suggestions
* 🗓 Timeline-based structured planning
* 🌍 Personalized city recommendations
* 📍 Location-based exploration

---

# 📍 Smart Location System

* Destination-based search
* Auto-detect user location (Geolocation API)
* Nearby places suggestions
* Map integration (Leaflet + OpenStreetMap)
* Booking conflict detection

If a guide is already booked at selected date & time →
❌ **“Guide is Occupied”** message is displayed

---

# 🛡 Safety & Emergency System

TravelMate includes advanced safety mechanisms:

* 🚨 SOS Emergency Button
* 🔊 Loud Siren Activation
* 📞 Fake Call Simulation
* 🚓 Nearby Police Lookup
* 📡 Real-time admin alert monitoring
* 📍 Location-based safety tracking

Admin dashboard displays:

* Active Alerts
* User Coordinates
* Real-time acknowledgment

---

# 📊 Admin Analytics Dashboard

Includes:

* ✅ Total Bookings
* 💰 Revenue Generated
* 🌍 Most Booked City
* 🏆 Top Performing Guide
* ❌ Cancellation Rate
* 📈 User Activity Trends
* 📡 Active Safety Alerts

---

# 💼 Guide Earnings Dashboard

Each guide can view:

* Total Bookings
* Completed Sessions
* Total Earnings
* Upcoming Bookings
* Cancellation Statistics

---

# 💬 Real-Time Communication

* User ↔ Guide live chat
* Instant booking updates
* Real-time status changes
* Notification system for:

  * New booking
  * Booking accepted
  * Booking rejected
  * Safety alert triggered

---

# 💳 Payment System (Demo Mode)

Currently implemented as:

* Simulated payment flow
* Booking confirmation after mock payment
* Architecture ready for **Stripe integration**

---

# 🏗 Tech Stack

## Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Framer Motion
* Leaflet + OpenStreetMap
* Context API

## Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* REST APIs
* Role-based Middleware

## Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

# 📂 Project Structure

```
TravelMate/
│
├── client/       # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   └── lib/
│
├── server/       # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
```

---

# 🔐 Environment Variables

## Frontend (.env)

```
NEXT_PUBLIC_API_URL=
```

## Backend (.env)

```
PORT=
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
```

---

# 📦 Installation & Setup

## Clone Repository

```
git clone https://github.com/your-username/travelmate.git
cd travelmate
```

## Setup Backend

```
cd server
npm install
npm run dev
```

## Setup Frontend

```
cd client
npm install
npm run dev
```

---

# 🧪 Demo Accounts (For Evaluation)

## 👨‍💼 Admin

Email: [admin@travelmate.com]
Password: Admin@123

## 🧑‍🏫 Guide

Email: [r@gmail.com]
Password:123456

## 🧳 Traveler

Email: [y@gmail.com]
Password: 123456

---

# 📈 System Workflow

1. User registers as Traveler or Guide
2. Guide requires Admin approval
3. Traveler books guide
4. Guide accepts/rejects
5. Booking confirmed
6. Payment simulated
7. Session completed
8. Rating & revenue updated
9. Analytics dashboard updated

---

# 🔮 Future Enhancements

* Stripe Live Payment Integration
* AI-powered personalized recommendations
* Mobile App (React Native)
* Real-time Socket.io notifications
* Multi-language support
* AI-based risk zone prediction

---

# 🧑‍💻 Author

**Rohit M Naik**

# 🏁 Conclusion

TravelMate demonstrates:

* Full-stack development
* Role-based authentication
* Real-time safety systems
* AI-powered itinerary planning
* Admin analytics dashboards
* Booking conflict resolution
* Cloud deployment & SaaS architecture

This project reflects **modern scalable SaaS architecture** and real-world engineering practices.

---
