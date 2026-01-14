import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
    // Link this profile to a specific User account
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true },

    modules: [String], // Array of strings e.g., ["CIT2C20", "CIT2C21"]
    topics: [String],  // Array of strings e.g., ["React", "Agile"]

    hourlyRate: { type: Number, default: 0 },
    bio: { type: String },

    ratingAvg: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 },

    availability: [{
        id: String, // We'll generate a unique ID for each slot
        date: String,
        time: String,
        status: {
            type: String,
            enum: ['Available', 'Booked'],
            default: 'Available'
        }
    }]
});

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;