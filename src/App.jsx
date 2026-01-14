import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// --- COMPONENT IMPORTS ---
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import TutorProfile from './pages/TutorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorDashboard from './pages/TutorDashboard';

function App() {
  // =========================================
  // 1. GLOBAL STATE MANAGEMENT
  // =========================================

  // FIX 1: Load user from LocalStorage if available (Persist Login)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tutors, setTutors] = useState([]);

  // =========================================
  // 2. FETCH DATA FUNCTION
  // =========================================

  // FIX 2: We make this a reusable function so we can call it after updates
  const fetchTutors = () => {
    fetch('http://localhost:5000/api/tutors')
      .then(res => res.json())
      .then(data => {
        console.log("Data loaded from Backend:", data);
        setTutors(data);
      })
      .catch(err => console.error("Failed to fetch tutors:", err));
  };

  // Run fetch once on app start
  useEffect(() => {
    fetchTutors();
  }, []);

  // =========================================
  // 3. AUTHENTICATION LOGIC
  // =========================================

  const handleRegister = (formData) => {
    console.log("Register logic handled in component");
  };

  const handleLogin = (loggedInUser) => {
    // Save to State AND LocalStorage
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    // Clear State AND LocalStorage
    setUser(null);
    localStorage.removeItem('user');
  };

  // =========================================
  // 4. BOOKING LOGIC
  // =========================================
  const addBooking = (newBooking) => console.log("Booking added via API");

  // =========================================
  // 5. RENDER
  // =========================================
  return (
    <>
      <Navbar user={user} logout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home tutors={tutors} />} />

        <Route path="/login" element={<Login login={handleLogin} />} />

        <Route path="/register" element={<Register registerUser={handleRegister} />} />

        <Route path="/my-bookings" element={<MyBookings user={user} />} />

        <Route
          path="/tutor/:id"
          element={
            <TutorProfile
              addBooking={addBooking}
              user={user}
              tutors={tutors}
              refreshTutors={fetchTutors} // <--- PASS THE REFRESH FUNCTION HERE
            />
          }
        />

        {/* FIX 2: Pass 'fetchTutors' so Dashboard can tell App to reload data */}
        <Route path="/tutor-dashboard" element={<TutorDashboard user={user} refreshTutors={fetchTutors} />} />
      </Routes>
    </>
  );
}

export default App;