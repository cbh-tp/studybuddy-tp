import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function TutorProfile({ user, tutors, refreshTutors }) {

  const { id } = useParams();
  const navigate = useNavigate();
  // Find tutor from the props passed down from App.jsx
  const tutor = tutors.find((t) => t._id === id);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const isOwnProfile = user && tutor && user.userId === tutor.userId;

  // UPDATED URL: Live Render Backend
  const API_URL = 'https://studybuddy-backend-67h9.onrender.com';

  if (!tutor) {
    return (
      <div className="container mt-5 text-center">
        <h2>Tutor not found!</h2>
        <Link to="/" className="btn btn-primary mt-3">Back to Search</Link>
      </div>
    );
  }

  const handleBookSession = async () => {
    if (isOwnProfile) return alert("You cannot book yourself!");

    if (!user) {
      alert("Please login to book a session!");
      navigate("/login");
      return;
    }

    if (selectedSlot) {
      // Find the specific slot object to get its details
      const slotDetails = tutor.availability.find(s => s.id === selectedSlot);
      
      const bookingData = {
        studentId: user.userId,
        tutorId: tutor._id,
        tutorName: tutor.name,
        module: tutor.modules[0] || "General",
        date: slotDetails.date,
        time: slotDetails.time,
        status: "Confirmed",
        // 🚨 CRITICAL FIX: Send the Unique Slot ID so backend deletes the right one!
        slotId: slotDetails.id 
      };

      try {
        const response = await fetch(`${API_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });

        if (response.ok) {
          setBookingSuccess(true);
          refreshTutors(); // Refresh the app data to show the slot is gone
        } else {
          const err = await response.json();
          alert(`Booking failed: ${err.message}`);
        }
      } catch (error) {
        console.error("Error booking:", error);
      }
    }
  };

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-outline-secondary mb-4">&larr; Back to Search</Link>

      <div className="row">
        {/* LEFT COLUMN: Avatar & Contact */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                {tutor.name.charAt(0)}
              </div>
              <h3 className="card-title">{tutor.name}</h3>
              <h4 className="text-success fw-bold">${tutor.hourlyRate}/hr</h4>

              {isOwnProfile ? (
                <Link to="/tutor-dashboard" className="btn btn-secondary w-100 mt-2 mb-3">
                  Edit My Profile
                </Link>
              ) : user ? (
                <button
                  className="btn btn-outline-primary w-100 mt-2 mb-3"
                  onClick={() => alert(`Contact ${tutor.name} at: ${tutor.email}`)}
                >
                  Contact Tutor
                </button>
              ) : (
                <div className="alert alert-warning mt-3 p-2" style={{ fontSize: '0.9rem' }}>
                  Please <Link to="/login">login</Link> to contact or book.
                </div>
              )}
              <hr />
              <div className="text-start">
                <p><strong>Modules:</strong> {tutor.modules.join(", ")}</p>
                <p><strong>Topics:</strong> {tutor.topics.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bio & Slots */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0 p-4">
            <h4 className="mb-3">About Me</h4>
            <p className="text-muted">{tutor.bio || "No bio provided."}</p>

            <h4 className="mt-4 mb-3">Available Slots</h4>

            {bookingSuccess ? (
              <div className="alert alert-success">
                <h4 className="alert-heading">Booking Confirmed!</h4>
                <p>You have successfully booked a session with {tutor.name}.</p>
                <div className="mt-3">
                  <Link to="/my-bookings" className="btn btn-success me-2">Go to My Bookings</Link>
                  <Link to="/" className="btn btn-outline-success">Find Another Tutor</Link>
                </div>
              </div>
            ) : isOwnProfile ? (
              <div className="alert alert-info border-info">
                <h5>👋 This is your profile.</h5>
                <p className="mb-0">You cannot book your own sessions. To manage these slots, go to your <Link to="/tutor-dashboard">Dashboard</Link>.</p>
              </div>
            ) : (
              <>
                {tutor.availability && tutor.availability.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {tutor.availability.map((slot) => (
                      <button
                        key={slot.id}
                        className={`btn ${selectedSlot === slot.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedSlot(slot.id)}
                      >
                        {slot.date} @ {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted fst-italic">This tutor has no available slots at the moment.</p>
                )}

                <button
                  className="btn btn-dark btn-lg w-100"
                  disabled={!selectedSlot}
                  onClick={handleBookSession}
                >
                  {selectedSlot ? "Confirm Booking" : "Select a Slot to Book"}
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfile;