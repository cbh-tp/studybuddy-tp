import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import TutorProfile from './pages/TutorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorDashboard from './pages/TutorDashboard';

function App() {
  // 1. GLOBAL STATE
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tutors, setTutors] = useState([]);

  // 2. FETCH DATA FUNCTION (Updated URL)
  const fetchTutors = () => {
    fetch('https://studybuddy-backend-67h9.onrender.com/api/tutors')
      .then(res => res.json())
      .then(data => {
        setTutors(data);
      })
      .catch(err => console.error("Failed to fetch tutors:", err));
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // 3. AUTH LOGIC
  const handleRegister = (formData) => {
    console.log("Register logic handled in component");
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addBooking = (newBooking) => console.log("Booking added via API");

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
              refreshTutors={fetchTutors}
            />
          }
        />

        <Route path="/tutor-dashboard" element={<TutorDashboard user={user} refreshTutors={fetchTutors} />} />
      </Routes>
    </>
  );
}

export default App;