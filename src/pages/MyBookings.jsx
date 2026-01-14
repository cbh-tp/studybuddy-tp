import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FOR MODAL ---
  const [editingBooking, setEditingBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // 1. FETCH BOOKINGS (Read)
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/bookings/${user.userId}`)
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setLoading(false);
        })
        .catch(err => console.error("Error fetching bookings:", err));
    }
  }, [user]);

  // 2. CANCEL BOOKING (Delete)
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;

    try {
      await fetch(`http://localhost:5000/api/bookings/${id}`, { method: 'DELETE' });
      // Remove from UI immediately
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };

  // 3. OPEN MODAL
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  // 4. RESCHEDULE (Update)
  const handleSave = async () => {
    if (!newDate || !newTime) return alert("Pick a date and time!");

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${editingBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, time: newTime })
      });

      if (response.ok) {
        // Update UI locally
        setBookings(bookings.map(b =>
          b._id === editingBooking._id
            ? { ...b, date: newDate, time: newTime, status: 'Rescheduled' }
            : b
        ));
        setEditingBooking(null); // Close modal
      }
    } catch (err) {
      alert("Failed to reschedule.");
    }
  };

  // --- RENDER ---
  if (!user) return <div className="text-center mt-5">Please <Link to="/login">Login</Link> to see bookings.</div>;
  if (loading) return <div className="text-center mt-5">Loading your bookings...</div>;

  return (
    <div className="container mt-4 position-relative">
      <h1 className="mb-4">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <h4>No upcoming sessions.</h4>
          <Link to="/" className="btn btn-primary mt-3">Find a Tutor</Link>
        </div>
      ) : (
        <div className="row">
          {bookings.map((booking) => (
            <div key={booking._id} className="col-md-6 mb-3">
              <div className={`card shadow-sm border-start border-4 ${booking.status === "Completed" ? "border-success" : "border-primary"}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">{booking.tutorName}</h5>
                    <span className="badge bg-primary">{booking.status}</span>
                  </div>
                  <p className="card-text text-muted mb-1"><strong>Module:</strong> {booking.module}</p>
                  <p className="card-text">📅 {booking.date} &nbsp; | &nbsp; ⏰ {booking.time}</p>

                  <div className="mt-3">
                    <button className="btn btn-sm btn-outline-danger me-2" onClick={() => handleCancel(booking._id)}>Cancel</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditClick(booking)}>Reschedule</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL (Same as before) */}
      {editingBooking && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Session</h5>
                <button type="button" className="btn-close" onClick={() => setEditingBooking(null)}></button>
              </div>
              <div className="modal-body">
                <input type="date" className="form-control mb-3" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                <input type="time" className="form-control" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditingBooking(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;