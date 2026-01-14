import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ login }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // 1. Send POST request to Backend
      // We send the username/password to your Node.js server
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Success! Backend returns user info
        // We update the App state and go to Home
        login(data);
        navigate("/");
      } else {
        // 3. Failure (e.g. "User not found")
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Is the backend running?");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Welcome Back</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name or Email</label>
            <input
              type="text" className="form-control" placeholder="e.g. Student Sam"
              value={username} onChange={(e) => setUsername(e.target.value)} required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-control" placeholder="Enter password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="mt-3 text-center">
          <p>Don't have an account? <Link to="/register" className="btn btn-outline-secondary btn-sm">Register Here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;