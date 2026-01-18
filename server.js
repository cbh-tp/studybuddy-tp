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

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ----------------------------------------------------
// 1. GET ALL TUTORS (Strict Clean-up)
// ----------------------------------------------------
app.get('/api/tutors', async (req, res) => {
    try {
        const tutors = await Tutor.find().lean();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cleanedTutors = tutors.map(tutor => {
            // Filter out past slots OR broken data
            const validSlots = tutor.availability.filter(slot => {
                if (!slot.date) return false; // Garbage data check
                const slotDate = new Date(slot.date);
                // If date is invalid (NaN) or older than today, hide it
                return !isNaN(slotDate) && slotDate >= today;
            });
            // Sort by Date then Time
            validSlots.sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
            return { ...tutor, availability: validSlots };
        });

        res.json(cleanedTutors);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tutors" });
    }
});

// ----------------------------------------------------
// 2. GET SINGLE TUTOR (For Dropdown Logic) - NEW!
// ----------------------------------------------------
app.get('/api/tutors/:id', async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id).lean();
        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        // Same strict filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        tutor.availability = tutor.availability.filter(slot => {
            const slotDate = new Date(slot.date);
            return !isNaN(slotDate) && slotDate >= today;
        });
        
        // Sort for the dropdown
        tutor.availability.sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));

        res.json(tutor);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tutor details" });
    }
});

// Login (Unchanged)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ name: username }, { email: username }] });
        if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
        res.json({ name: user.name, email: user.email, role: user.role, userId: user._id });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ----------------------------------------------------
// 3. CREATE BOOKING (ID-Based Removal)
// ----------------------------------------------------
app.post('/api/bookings', async (req, res) => {
    try {
        // We now expect 'slotId' from the frontend!
        const { studentId, tutorId, tutorName, module, date, time, slotId } = req.body;

        const newBooking = new Booking({
            studentId, tutorId, tutorName, module, date, time, status: "Confirmed"
        });
        const savedBooking = await newBooking.save();

        // REMOVE BY ID (Reliable)
        if (slotId) {
            await Tutor.findByIdAndUpdate(tutorId, {
                $pull: { availability: { id: slotId } } // Match the unique slot ID
            });
        } else {
            // Fallback for old data if slotId is missing
            await Tutor.findByIdAndUpdate(tutorId, {
                $pull: { availability: { date: date, time: time } }
            });
        }

        res.status(201).json(savedBooking);
    } catch (err) { res.status(500).json({ message: "Failed to create booking" }); }
});

// Get My Bookings (Unchanged)
app.get('/api/bookings/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ studentId: req.params.userId });
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ----------------------------------------------------
// 5. CANCEL BOOKING (Unchanged - Logic is fine)
// ----------------------------------------------------
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Not found" });

        // Return slot to tutor with a NEW ID
        await Tutor.findByIdAndUpdate(booking.tutorId, {
            $push: {
                availability: {
                    $each: [{
                        id: new mongoose.Types.ObjectId().toString(),
                        date: booking.date,
                        time: booking.time,
                        status: "Available"
                    }],
                    $sort: { date: 1, time: 1 }
                }
            }
        });
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Cancelled" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ----------------------------------------------------
// 6. RESCHEDULE (Dropdown Logic / ID Swap)
// ----------------------------------------------------
app.put('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { newSlotId, newDate, newTime } = req.body; // Expecting slot ID now

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // 1. Remove the NEW slot using its ID (Prevents "Replicating Slots")
        const updateResult = await Tutor.findByIdAndUpdate(booking.tutorId, {
            $pull: { availability: { id: newSlotId } }
        });

        // 2. Return the OLD slot
        await Tutor.findByIdAndUpdate(booking.tutorId, {
            $push: {
                availability: {
                    $each: [{
                        id: new mongoose.Types.ObjectId().toString(),
                        date: booking.date,
                        time: booking.time,
                        status: "Available"
                    }],
                    $sort: { date: 1, time: 1 }
                }
            }
        });

        // 3. Update Ticket
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { date: newDate, time: newTime, status: 'Rescheduled' },
            { new: true }
        );

        res.json({ message: "Success", updatedBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Reschedule failed" });
    }
});

// Register (Unchanged)
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User({
            name,
            email,
            password,
            role: role || 'Student'
        });
        await newUser.save();
        if (role === 'Tutor') {
            const newTutorProfile = new Tutor({
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
                modules: [],
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

// Update Tutor Profile (Keep the filter)
app.put('/api/tutors/:userId', async (req, res) => {
    try {
        const updates = req.body;
        if (updates.availability) {
            const today = new Date();
            today.setHours(0,0,0,0);
            updates.availability = updates.availability.filter(slot => {
                const d = new Date(slot.date);
                return !isNaN(d) && d >= today;
            });
        }
        const updated = await Tutor.findOneAndUpdate({ userId: req.params.userId }, updates, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });