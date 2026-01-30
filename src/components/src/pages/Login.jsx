import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ login }) {
  // --- STATE MANAGEMENT ---
  // Stores the user's input for username and password
  const [formData, setFormData] = useState({ username: "", password: "" });

  // Stores any error messages (e.g., "Wrong password") to display to the user
  const [error, setError] = useState("");

  // Hook to redirect the user after a successful login
  const navigate = useNavigate();

  // --- INPUT HANDLER ---
  // Updates the state dynamically as the user types.
  // [e.target.name] matches the input's "name" attribute (username or password).
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing automatically
    setError(""); // Clear any old errors

    try {
      // 1. SEND LOGIN REQUEST TO BACKEND
      const response = await fetch('https://studybuddy-backend-67h9.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // 2. CHECK RESPONSE
      if (response.ok) {
        // SUCCESS: Call the login function passed from App.jsx to update the global user state
        login(data);
        // Redirect the user to the Home Page
        navigate("/");
      } else {
        // FAILURE: Show the error message from the server (e.g., "User not found")
        setError(data.message || "Login failed");
      }
    } catch (err) {
      // NETWORK ERROR: Show a generic message if the server is down
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Login</h2>

        {/* ERROR ALERT: Only shows if 'error' state is not empty */}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* USERNAME INPUT */}
          <div className="mb-3">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              required
              value={formData.username}
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

          {/* SUBMIT BUTTON */}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        {/* REGISTER LINK */}
        <div className="mt-3 text-center">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;