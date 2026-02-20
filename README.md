# TravelMate 🌍

TravelMate is a modern, AI-powered travel companion application built to provide travelers with intelligent tools, local verified guides, real-time safety tracking, and automated emergency features. 

The platform connects wanderlust-driven users with knowledgeable locals, ensuring memorable and secure journeys through innovative safety mechanisms like SOS alerts and live location sharing.

---

## 🚀 Features

### For Travelers
* **AI Travel Assistant:** Intelligent conversational AI for trip planning and real-time guidance.
* **Verified Local Guides:** Browse and book curated, verified local experts and translators.
* **Safety First:** Live location sharing with trusted contacts.
* **Emergency SOS:** Instant SOS button that immediately alerts the admin dashboard and dispatches verified guides.
* **Booking Management:** Keep track of upcoming trips and previous tour histories.

### For Admins
* **Admin Dashboard:** A centralized control hub.
* **Guide Verification:** Review pending guides and verify them for Safety Mode dispatches.
* **SOS Alert Management:** Instantly acknowledge passive or active SOS triggers with real-time audio and location data.
* **Guide Dispatch:** Assign verified local guides directly to active traveler emergencies.
* **Platform Analytics:** Monitor revenue, bookings, cancellations, and user activity.

---

## 🛠 Tech Stack

* **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion, Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose for schemas and modeling)
* **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` for security
* **Real-Time:** Socket.io (for live SOS alerts and chat)

---

## 🔒 Default Admin Credentials

To access the Admin Dashboard at `/admin`, please login using the following credentials:

* **Email:** `admin@travelmate.com`
* **Password:** `admin123`

*(Note: If these credentials do not work, please ensure the database seed scripts have been successfully executed or create a new user manually and assign the `ADMIN` role via MongoDB Compass).*

---

## 📂 Project Structure

\`\`\`
TravelMate/
├── client/                 # Next.js Frontend Application
│   ├── app/                # App Router (Pages & Layouts)
│   ├── components/         # Reusable React Components
│   ├── context/            # Global React Contexts (Auth, Journey)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Utilities and API config
│   └── public/             # Static frontend assets
│
└── server/                 # Express.js Backend Application
    ├── controllers/        # Route logic and handlers (Auth, Admin, Guides...)
    ├── middleware/         # Auth verification and file upload interceptors
    ├── models/             # Mongoose Schemas (User, Guide, Booking, Incident)
    ├── routes/             # API Endpoints
    ├── scripts/            # Database initialization and seeding scripts
    └── uploads/            # Local storage for user avatars and SOS audio
\`\`\`

---

## ⚙️ Getting Started

### 1. Requirements
* Node.js (v18+)
* MongoDB (Local instance or Atlas URI)

### 2. Installation
Install dependencies for both the frontend and backend:

\`\`\`bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
\`\`\`

### 3. Environment Variables
Create a `.env` file in the **server** directory:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travelmate
JWT_SECRET=your_super_secret_jwt_key
\`\`\`

Create a `.env.local` file in the **client** directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

### 4. Running the Application
You will need two separate terminal windows.

**Terminal 1 (Backend):**
\`\`\`bash
cd server
npm start
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd client
npm run dev
\`\`\`

Open your browser and navigate to `http://localhost:3000`.

---

© 2026 TravelMate. Built for the modern traveler.
