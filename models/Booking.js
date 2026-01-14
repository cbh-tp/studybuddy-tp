import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true
    },
    tutorName: { type: String, required: true }, // Saved for convenience
    module: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },

    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed', 'Rescheduled'],
        default: 'Confirmed'
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;