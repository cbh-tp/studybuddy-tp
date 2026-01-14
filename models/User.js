import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // No two users can have the same email
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Student', 'Tutor'], // Only allow these two values
        default: 'Student'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model
const User = mongoose.model('User', userSchema);

export default User;