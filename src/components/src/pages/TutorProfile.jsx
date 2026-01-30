import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function TutorProfile({ user, tutors, refreshTutors }) {
  // --- URL PARAMETERS ---
  // If URL is /tutor/123, then id = "123"
  const { id } = useParams();
  const navigate = useNavigate();

  // --- DATA LOOKUP ---
  // Find the specific tutor from the list using the ID from the URL
  const tutor = tutors.find((t) => t._id === id);

  // --- STATE MANAGEMENT ---
  const [selectedSlot, setSelectedSlot] = useState(null); // Which time slot did the user click?
  const [bookingSuccess, setBookingSuccess] = useState(false); // Did the API say "OK"?

  // --- SAFETY CHECK ---
  // Check if the logged-in user is looking at their OWN profile.
  const isOwnProfile = user && tutor && user.userId === tutor.userId;

  // 🚀 API CONFIGURATION
  const API_URL = 'https://studybuddy-backend-67h9.onrender.com';

  // --- ERROR HANDLING ---
  // If someone types a random URL ID that doesn't exist
  if (!tutor) {
    return (
      <div className="container mt-5 text-center">
        <h2>Tutor not found!</h2>
        <Link to="/" className="btn btn-primary mt-3">Back to Search</Link>
      </div>
    );
  }

  // --- BOOKING LOGIC ---
  const handleBookSession = async () => {
    // 1. Validation Checks
    if (isOwnProfile) return alert("You cannot book yourself!");

    if (!user) {
      alert("Please login to book a session!");
      navigate("/login");
      return;
    }

    if (selectedSlot) {
      // Find the full details of the chosen slot
      const slotDetails = tutor.availability.find(s => s.id === selectedSlot);

      // Prepare the data packet for the API
      const bookingData = {
        studentId: user.userId,
        tutorId: tutor._id,
        tutorName: tutor.name,
        module: tutor.modules[0] || "General", // Default to first module if not specified
        date: slotDetails.date,
        time: slotDetails.time,
        status: "Pending", // Default status is Pending until Tutor approves
        slotId: slotDetails.id // 🚨 CRITICAL: Send this so Backend knows which slot to hide/remove
      };

      try {
        const response = await fetch(`${API_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });

        if (response.ok) {
          setBookingSuccess(true);
          refreshTutors(); // Refresh global data to update slot availability
        } else {
          alert("Booking failed! Server error.");
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
        {/* --- LEFT COLUMN: PROFILE CARD --- */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              {/* Avatar */}
              <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                {tutor.name.charAt(0)}
              </div>
              <h3 className="card-title">{tutor.name}</h3>
              <h4 className="text-success fw-bold">${tutor.hourlyRate}/hr</h4>

              {/* Action Buttons: Edit (if self) or Contact (if other) */}
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

              {/* Skills List */}
              <div className="text-start">
                <p><strong>Modules:</strong> {tutor.modules.join(", ")}</p>
                <p><strong>Topics:</strong> {tutor.topics.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: BIO & BOOKING --- */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0 p-4">
            <h4 className="mb-3">About Me</h4>
            <p className="text-muted">{tutor.bio || "No bio provided."}</p>

            <h4 className="mt-4 mb-3">Available Slots</h4>

            {/* CONDITIONAL RENDER: Success Message OR Booking Interface */}
            {bookingSuccess ? (
              <div className="alert alert-success">
                <h4 className="alert-heading">Booking Requested!</h4>
                <p>Your request has been sent to {tutor.name}. Check "My Bookings" for updates.</p>
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
                {/* SLOT SELECTION BUTTONS */}
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

                {/* CONFIRM BUTTON */}
                <button
                  className="btn btn-dark btn-lg w-100"
                  disabled={!selectedSlot} // Disable if no slot is picked
                  onClick={handleBookSession}
                >
                  {selectedSlot ? "Confirm Booking Request" : "Select a Slot to Book"}
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