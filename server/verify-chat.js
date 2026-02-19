const io = require("socket.io-client");
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Guide = require('./models/Guide');
const Message = require('./models/Message');

// Load .env
try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
} catch (e) {
    console.warn('.env file not found');
}

async function verifyChat() {
    console.log("🚀 Starting Chat Verification...");

    try {
        console.log("Connecting to MongoDB at", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database Connected");

        // 1. Setup Test Data
        const user = await User.findOne({ email: "user@travelmate.com" }); // Traveler
        const guideUser = await User.findOne({ email: "guide@travelmate.com" }); // Guide

        if (!user || !guideUser) throw new Error("Test users not found. Run seed-accounts.js first.");

        const guideProfile = await Guide.findOne({ userId: guideUser._id });
        if (!guideProfile) throw new Error("Guide profile not found.");

        // Find or Create a Booking
        let booking = await Booking.findOne({ userId: user._id, guideId: guideProfile._id });
        if (!booking) {
            booking = await Booking.create({
                userId: user._id,
                guideId: guideProfile._id,
                tourName: "Chat Test Tour",
                date: new Date(),
                time: "10:00 AM",
                duration: "2 hours",
                totalPrice: 200,
                status: "ACCEPTED",
                paymentStatus: "PAID"
            });
            console.log("✅ Created Test Booking");
        } else {
            console.log("✅ Found Existing Booking");
        }

        const bookingId = booking._id.toString();

        // 2. Connect Sockets
        const socketTraveler = io("http://localhost:5000", { forceNew: true });
        const socketGuide = io("http://localhost:5000", { forceNew: true });

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for connection

        console.log("✅ Sockets Connected");

        // 3. Join Room
        socketTraveler.emit("join_chat", bookingId);
        socketGuide.emit("join_chat", bookingId);

        // 4. Listeners
        const messagePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject("Message receive timeout"), 5000);
            socketGuide.on("new_message", (msg) => {
                clearTimeout(timeout);
                if (msg.content === "Hello Guide! 🚀" && msg.senderId === user._id.toString()) {
                    console.log("✅ Guide Received Message via Socket");
                    resolve();
                } else {
                    reject("Received incorrect message: " + JSON.stringify(msg));
                }
            });
        });

        const typingPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject("Typing receive timeout"), 5000);
            socketGuide.on("typing", () => {
                clearTimeout(timeout);
                console.log("✅ Guide Received Typing Indicator");
                resolve();
            });
        });

        // 5. Simulate Interaction

        // Test Typing
        console.log("👉 Traveler start typing...");
        socketTraveler.emit("typing", `chat_${bookingId}`);
        await typingPromise;

        // Test Sending Message (via API, as per new design)
        // We need to simulate the API call here using fetch/axios or just assume the API works 
        // asking the controller directly is hard in a discrete script without importing app.
        // Let's use axios if installed, or specific http request.
        // Or better, since we modified the controller to emit, we need to call the API.

        // Simulating API call via http
        console.log("👉 Traveler sending message via API...");
        const axios = require('axios');
        // We need a token for the traveler. 
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        try {
            const apiRes = await axios.post(`http://localhost:5000/api/chat/${bookingId}`, {
                content: "Hello Guide! 🚀"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("✅ API Response Status:", apiRes.status);
        } catch (apiErr) {
            console.error("❌ API Call Failed:", apiErr.message);
            if (apiErr.response) {
                console.error("Status:", apiErr.response.status);
                console.error("Data:", apiErr.response.data);
            }
            throw apiErr;
        }

        await messagePromise;

        // 6. Verify DB Persistence
        const dbMessage = await Message.findOne({
            bookingId: bookingId,
            content: "Hello Guide! 🚀"
        });

        if (dbMessage) {
            console.log("✅ Message Persisted in Database");
        } else {
            throw new Error("Message not found in DB");
        }

        console.log("🎉 Verification Successful!");

        socketTraveler.disconnect();
        socketGuide.disconnect();
        await mongoose.disconnect();

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}


process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});

verifyChat();
