import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]); // List for dropdown
  const [selectedSlotId, setSelectedSlotId] = useState(""); // The chosen slot ID

  // 🚀 LIVE URL (Make sure this matches your App.jsx)
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

  // --- CANCEL LOGIC ---
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Booking cancelled.");
        window.location.reload();
      }
    } catch (err) { alert("Error cancelling."); }
  };

  // --- MODAL: OPEN & FETCH SLOTS ---
  const openRescheduleModal = async (booking) => {
    setSelectedBooking(booking);
    setAvailableSlots([]); // Clear old list
    setSelectedSlotId(""); // Reset selection
    setShowModal(true);

    // 1. Fetch the Tutor's latest slots for the dropdown
    try {
        const res = await fetch(`${API_URL}/api/tutors/${booking.tutorId}`);
        const tutorData = await res.json();
        
        if (tutorData.availability && tutorData.availability.length > 0) {
            setAvailableSlots(tutorData.availability);
        } else {
            alert("This tutor has no other slots available.");
            setShowModal(false);
        }
    } catch (err) {
        console.error("Failed to load slots", err);
        alert("Could not load tutor slots.");
        setShowModal(false);
    }
  };

  // --- MODAL: SUBMIT ---
  const submitReschedule = async () => {
    if (!selectedSlotId) {
        alert("Please select a slot.");
        return;
    }

    // Find the full slot object based on ID to get date/time text
    const targetSlot = availableSlots.find(s => s.id === selectedSlotId);
    if (!targetSlot) return; 

    try {
      const response = await fetch(`${API_URL}/api/bookings/${selectedBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            newSlotId: selectedSlotId, // Send ID for removal
            newDate: targetSlot.date,  // Send Text for booking ticket
            newTime: targetSlot.time 
        })
      });

      if (response.ok) {
        alert("Reschedule Successful!");
        window.location.reload();
      } else {
        alert("Reschedule Failed.");
      }
    } catch (err) {
      alert("Server Error.");
    }
  };

  // --- HELPERS ---
  const isUpcoming = (dateStr, timeStr) => {
    let cleanTime = timeStr;
    // Simple fix for "1400" format legacy data
    if (!timeStr.includes(':') && timeStr.length === 4) {
        cleanTime = timeStr.slice(0, 2) + ":" + timeStr.slice(2);
    }
    const bookingTime = new Date(`${dateStr}T${cleanTime}`);
    return bookingTime >= new Date();
  };

  const upcoming = bookings.filter(b => isUpcoming(b.date, b.time));
  const past = bookings.filter(b => !isUpcoming(b.date, b.time));

  const BookingCard = ({ booking, showActions }) => (
    <div className="col-md-6 mb-3" key={booking._id}>
      <div className={`card shadow-sm ${!showActions ? 'bg-light text-muted' : ''}`}>
        <div className="card-body">
          <h5 className="card-title">Session with {booking.tutorName}</h5>
          <h6 className="card-subtitle mb-2">{booking.module}</h6>
          <p className="card-text">
            <strong>Date:</strong> {booking.date}<br />
            <strong>Time:</strong> {booking.time}<br />
            <strong>Status:</strong> <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success' : 'bg-warning'}`}>{booking.status}</span>
          </p>
          {showActions && (
            <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => openRescheduleModal(booking)}>Reschedule</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(booking._id)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) return <div className="p-5">Please Login.</div>;
  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookings</h2>

      <h4 className="text-primary mb-3">📅 Upcoming Sessions</h4>
      <div className="row">{upcoming.length ? upcoming.map(b => <BookingCard booking={b} showActions={true} />) : <p>No upcoming sessions.</p>}</div>

      <hr className="my-5" />

      <h4 className="text-secondary mb-3">📜 Past History</h4>
      <div className="row">{past.length ? past.map(b => <BookingCard booking={b} showActions={false} />) : <p>No history.</p>}</div>

      {/* --- DROPDOWN MODAL --- */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select New Slot</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Choose an available time for <strong>{selectedBooking?.tutorName}</strong>:</p>
                
                <select 
                    className="form-select" 
                    value={selectedSlotId} 
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                >
                    <option value="">-- Select a Slot --</option>
                    {availableSlots.map(slot => (
                        <option key={slot.id || slot._id} value={slot.id || slot._id}>
                            {slot.date} at {slot.time}
                        </option>
                    ))}
                </select>

              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button className="btn btn-primary" onClick={submitReschedule}>Confirm Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;