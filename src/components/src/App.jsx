import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// --- COMPONENT IMPORTS ---
import Navbar from './components/NavBar';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import TutorProfile from './pages/TutorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorDashboard from './pages/TutorDashboard';

function App() {

  // --- 1. GLOBAL STATE: USER AUTHENTICATION ---
  // We initialize the user state by checking LocalStorage.
  // This ensures that if you refresh the page, you stay logged in.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- 2. GLOBAL STATE: TUTOR DATA ---
  // We store the list of tutors here so we can pass it down to multiple pages
  // (Home, TutorProfile, etc.) without fetching it over and over.
  const [tutors, setTutors] = useState([]);

  // 🚀 API CONFIGURATION
  const API_URL = 'https://studybuddy-backend-67h9.onrender.com';

  // --- 3. DATA FETCHING FUNCTION ---
  // This function grabs the latest list of tutors from the database.
  // We pass this function down to child components (like TutorDashboard)
  // so they can tell App.jsx to "refresh the data" after making changes.
  const fetchTutors = () => {
    fetch(`${API_URL}/api/tutors`)
      .then(res => res.json())
      .then(data => {
        setTutors(data);
      })
      .catch(err => console.error("Failed to fetch tutors:", err));
  };

  // Run this once when the app starts
  useEffect(() => {
    fetchTutors();
  }, []);

  // --- 4. AUTHENTICATION HANDLERS ---

  // Called by Login.jsx when the server says "Success"
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    // Save to browser storage so it survives page reloads
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  // Called by Navbar.jsx when clicking "Logout"
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Optional: Redirect to home
    window.location.href = "/";
  };

  // Placeholder: Registration logic is handled inside Register.jsx
  const handleRegister = (formData) => {
    console.log("Register logic is handled inside the Register component.");
  };

  return (
    <>
      {/* NAVIGATION BAR (Always Visible) */}
      <Navbar user={user} logout={handleLogout} />

      {/* PAGE ROUTING SYSTEM */}
      <Routes>

        {/* HOME PAGE: Needs the list of tutors to display cards */}
        <Route path="/" element={<Home tutors={tutors} />} />

        {/* AUTH PAGES */}
        <Route path="/login" element={<Login login={handleLogin} />} />
        <Route path="/register" element={<Register registerUser={handleRegister} />} />

        {/* STUDENT PAGES */}
        <Route path="/my-bookings" element={<MyBookings user={user} />} />

        {/* DYNAMIC TUTOR PROFILE */}
        {/* We pass 'refreshTutors' so that if a booking happens, 
            we can update the slot availability immediately. */}
        <Route
          path="/tutor/:id"
          element={
            <TutorProfile
              user={user}
              tutors={tutors}
              refreshTutors={fetchTutors}
            />
          }
        />

        {/* TUTOR DASHBOARD (Protected) */}
        <Route
          path="/tutor-dashboard"
          element={<TutorDashboard user={user} refreshTutors={fetchTutors} />}
        />

      </Routes>
    </>
  );
}

export default App;