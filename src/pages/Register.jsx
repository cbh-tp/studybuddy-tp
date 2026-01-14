import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Student" // Default role
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 1. Send data to Backend
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // 2. Success! Redirect to Login page
                alert("Registration Successful! Please Login.");
                navigate("/login");
            } else {
                // 3. Show error (e.g., "Email already exists")
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <div className="card shadow p-4">
                <h2 className="text-center mb-4">Create Account</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text" name="name" className="form-control" required
                            value={formData.name} onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email" name="email" className="form-control" required
                            value={formData.email} onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password" name="password" className="form-control" required
                            value={formData.password} onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">I am a...</label>
                        <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                            <option value="Student">Student</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-success w-100">Register</button>
                </form>

                <div className="mt-3 text-center">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;