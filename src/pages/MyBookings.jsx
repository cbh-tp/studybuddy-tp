import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // UPDATED URL
      fetch(`https://studybuddy-backend-67h9.onrender.com/api/bookings/${user.userId}`)
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
      // UPDATED URL
      const response = await fetch(`https://studybuddy-backend-67h9.onrender.com/api/bookings/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b._id !== id));
        alert("Booking cancelled.");
      } else {
        alert("Failed to cancel.");
      }
    } catch (err) {
      alert("Error cancelling booking.");
    }
  };

  if (!user) return <div className="p-5">Please Login to view bookings.</div>;
  if (loading) return <div className="p-5">Loading your bookings...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="alert alert-info">
          You have no upcoming sessions. <Link to="/">Find a Tutor</Link>
        </div>
      ) : (
        <div className="row">
          {bookings.map((booking) => (
            <div key={booking._id} className="col-md-6 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Session with {booking.tutorName}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{booking.module}</h6>
                  <p className="card-text">
                    <strong>Date:</strong> {booking.date}<br />
                    <strong>Time:</strong> {booking.time}<br />
                    <strong>Status:</strong> <span className="badge bg-success">{booking.status}</span>
                  </p>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancel(booking._id)}
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;