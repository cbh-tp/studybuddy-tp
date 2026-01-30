import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    // --- STATE MANAGEMENT ---
    // Stores all the input fields in a single object
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Student" // Default role is Student
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    // --- INPUT HANDLER ---
    // Updates the state dynamically as the user types.
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            // 1. SEND REGISTRATION DATA TO BACKEND
            const response = await fetch('https://studybuddy-backend-67h9.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // 2. CHECK RESPONSE
            if (response.ok) {
                // SUCCESS: Show a popup and send them to the Login page
                alert("Registration Successful! Please Login.");
                navigate("/login");
            } else {
                // FAILURE: Show the error from the server (e.g. "Email already exists")
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            // NETWORK ERROR
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <div className="card shadow p-4">
                <h2 className="text-center mb-4">Create Account</h2>

                {/* ERROR ALERT */}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* NAME INPUT */}
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* EMAIL INPUT */}
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* PASSWORD INPUT */}
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* ROLE SELECTION */}
                    <div className="mb-3">
                        <label className="form-label">I am a...</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="Student">Student</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button type="submit" className="btn btn-success w-100">Register</button>
                </form>

                {/* LOGIN LINK */}
                <div className="mt-3 text-center">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;