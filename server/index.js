require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const User = require('./models/User');


const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", "PATCH"]
    }
});

// Socket instance shared with controllers
app.set('socketio', io);

const PORT = process.env.PORT || 5000;

// Middleware
app.enable('trust proxy');
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('TravelMate Server is running');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/places', require('./routes/placesRoutes'));
app.use('/api/guides', require('./routes/guidesRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));

// Updated Socket handling for Chat
io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);

    socket.on('join_user', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('join_chat', (bookingId) => {
        socket.join(`chat_${bookingId}`);
        console.log(`User joined chat room: chat_${bookingId}`);
    });

    socket.on('send_message', (data) => {
        // data: { bookingId, senderId, content, timestamp }
        io.to(`chat_${data.bookingId}`).emit('new_message', data);
    });

    // Typing Indicators
    socket.on('typing', (roomId) => {
        socket.to(roomId).emit('typing');
    });

    socket.on('stop_typing', (roomId) => {
        socket.to(roomId).emit('stop_typing');
    });

    socket.on('update_location', async (data) => {
        // data: { userId, name, location: { lat, lng }, address }
        console.log(`📍 Location update from ${data.name}:`, data.location);
        io.emit('admin_location_update', data);

        // Persistent storage
        try {
            await User.findByIdAndUpdate(data.userId, {
                lastKnownLocation: {
                    lat: data.location.lat,
                    lng: data.location.lng,
                    address: data.address,
                    updatedAt: new Date()
                },
                isLocationSharing: true
            });
        } catch (err) {
            console.error('Failed to persist location:', err);
        }
    });

    socket.on('stop_sharing', async (userId) => {
        try {
            await User.findByIdAndUpdate(userId, { isLocationSharing: false });
            console.log(`🛑 User ${userId} stopped sharing.`);
        } catch (err) {
            console.error('Failed to update sharing status:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// AI Planner Routes (uses free OpenStreetMap services)
app.use('/api/ai-planner', require('./routes/aiPlannerRoutes'));

// Free OpenStreetMap API Routes
app.use('/api/openmap', require('./routes/openMapRoutes'));
app.use('/api/safety', require('./routes/safetyRoutes'));

// Global Error Handler to ensure JSON responses
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Initialize Cron Jobs
        require('./services/cronService')(io);

    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

// Start Server
if (process.env.MONGODB_URI) {
    connectDB().then(() => {
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
} else {
    console.log('MONGODB_URI not found in .env, starting server without DB connection for now.');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
