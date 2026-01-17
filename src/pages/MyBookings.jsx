import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🛠️ TOGGLE: Keep this on Localhost for now while testing!
  // const API_URL = 'http://localhost:5000';
  const API_URL = 'https://studybuddy-backend-67h9.onrender.com';

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/bookings/${user.userId}`)
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setLoading(false);
        })
        .catch(err => console.error("Error fetching bookings:", err));
    }
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b._id !== id));
        alert("Booking cancelled and slot restored!");
        window.location.reload(); // Force refresh to see the green slot back on Home
      } else {
        alert("Failed to cancel.");
      }
    } catch (err) {
      alert("Error cancelling booking.");
    }
  };

  // --- 🧠 LOGIC: Separate Upcoming vs. Past ---
  const now = new Date();

  const isUpcoming = (dateStr, timeStr) => {
    // Combine date (YYYY-MM-DD) and time (HH:MM) into a real Date object
    // Note: This assumes time is in 24h format like "14:30"
    const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
    return bookingDateTime >= now;
  };

  const upcomingBookings = bookings.filter(b => isUpcoming(b.date, b.time));
  const pastBookings = bookings.filter(b => !isUpcoming(b.date, b.time));

  // --- RENDER HELPER: Card Component to reuse code ---
  const BookingCard = ({ booking, showCancel }) => (
    <div className="col-md-6 mb-3" key={booking._id}>
      <div className={`card shadow-sm ${!showCancel ? 'bg-light text-muted' : ''}`}>
        <div className="card-body">
          <h5 className="card-title">Session with {booking.tutorName}</h5>
          <h6 className="card-subtitle mb-2">{booking.module}</h6>
          <p className="card-text">
            <strong>Date:</strong> {booking.date}<br />
            <strong>Time:</strong> {booking.time}<br />
            <strong>Status:</strong> <span className={`badge ${showCancel ? 'bg-success' : 'bg-secondary'}`}>{booking.status}</span>
          </p>

          {showCancel && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleCancel(booking._id)}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) return <div className="p-5">Please Login to view bookings.</div>;
  if (loading) return <div className="p-5">Loading your bookings...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookings</h2>

      {/* SECTION 1: UPCOMING */}
      <h4 className="text-primary mb-3">📅 Upcoming Sessions</h4>
      {upcomingBookings.length === 0 ? (
        <p className="text-muted">No upcoming sessions. <Link to="/">Find a Tutor</Link></p>
      ) : (
        <div className="row">
          {upcomingBookings.map(b => <BookingCard booking={b} showCancel={true} />)}
        </div>
      )}

      <hr className="my-5" />

      {/* SECTION 2: PAST HISTORY */}
      <h4 className="text-secondary mb-3">📜 Past History</h4>
      {pastBookings.length === 0 ? (
        <p className="text-muted">No past history.</p>
      ) : (
        <div className="row">
          {pastBookings.map(b => <BookingCard booking={b} showCancel={false} />)}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
