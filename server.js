import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// --- IMPORT MODELS ---
import User from './models/User.js';
import Tutor from './models/Tutor.js';
import Booking from './models/Booking.js';

const app = express();

app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ============================================
// API ROUTES
// ============================================

// 1. GET ALL TUTORS
app.get('/api/tutors', async (req, res) => {
    try {
        const tutors = await Tutor.find();
        res.json(tutors);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tutors" });
    }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ name: username }, { email: username }]
        });

        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            name: user.name,
            email: user.email,
            role: user.role,
            userId: user._id // We need this ID to link bookings!
        });

    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }
});

// --- 3. CREATE A BOOKING (With Slot Removal Logic) ---
app.post('/api/bookings', async (req, res) => {
    try {
        // We expect the frontend to send: { studentId, tutorId, date, time, ... }
        const { studentId, tutorId, tutorName, module, date, time, status } = req.body;

        // A. Create the Booking Record
        const newBooking = new Booking({
            studentId,
            tutorId,
            tutorName,
            module,
            date,
            time,
            status
        });
        const savedBooking = await newBooking.save();

        // B. (NEW) Remove the slot from the Tutor's availability
        // This prevents "Double Booking"
        await Tutor.findByIdAndUpdate(
            tutorId,
            {
                $pull: {
                    availability: { date: date, time: time }
                }
            }
        );

        res.status(201).json(savedBooking);
    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ message: "Failed to create booking" });
    }
});

// 4. GET MY BOOKINGS
app.get('/api/bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Find bookings where studentId matches the logged-in user
        const bookings = await Booking.find({ studentId: userId });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
});

// 5. CANCEL BOOKING (Delete)
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndDelete(id);
        res.json({ message: "Booking cancelled" });
    } catch (err) {
        res.status(500).json({ message: "Could not cancel booking" });
    }
});

// 6. RESCHEDULE BOOKING (Update)
app.put('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.body; // New date/time from frontend

        // Find the booking and update it
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { date, time, status: 'Rescheduled' },
            { new: true } // Return the updated version
        );

        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: "Could not reschedule booking" });
    }
});

// 7. REGISTER USER
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Create the User Login Account
        const newUser = new User({
            name,
            email,
            password,
            role: role || 'Student'
        });

        await newUser.save(); // Save the login info

        // 3. If they are a Tutor, Create a Blank Profile!
        if (role === 'Tutor') {
            const newTutorProfile = new Tutor({
                userId: newUser._id, // Link to the login account
                name: newUser.name,
                email: newUser.email,
                modules: [],       // Empty for now
                topics: [],
                bio: "New tutor ready to help!",
                hourlyRate: 0,
                availability: []
            });

            await newTutorProfile.save();
        }

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Error registering user" });
    }
});

// 8. UPDATE TUTOR PROFILE
app.put('/api/tutors/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body; // e.g. { bio: "...", hourlyRate: 50 }

        // Find the tutor profile linked to this User ID and update it
        const updatedTutor = await Tutor.findOneAndUpdate(
            { userId: userId },
            updates,
            { new: true } // Return the updated version
        );

        res.json(updatedTutor);
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});