import { Link } from 'react-router-dom';

function TutorCard({ tutor }) {
  return (
    // Bootstrap Grid Column: Occupies 4 columns on medium screens (3 cards per row)
    <div className="col-md-4 mb-4">

      {/* CARD CONTAINER */}
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body">

          {/* --- HEADER: AVATAR & NAME --- */}
          <div className="d-flex align-items-center mb-3">

            {/* Dynamic Avatar: Displays the first letter of the tutor's name */}
            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
              style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
            >
              {tutor.name.charAt(0)}
            </div>

            {/* Name & Rating Section */}
            <div>
              <h5 className="card-title mb-0">{tutor.name}</h5>
              <div className="text-warning small">
                {/* Visual Logic: Repeats the '★' character based on the rating number */}
                {'★'.repeat(Math.round(tutor.ratingAvg))}
                <span className="text-muted ms-1">({tutor.ratingCount})</span>
              </div>
            </div>
          </div>

          {/* --- MODULES SECTION --- */}
          <p className="card-text text-muted small mb-2">
            <strong>Modules:</strong> {tutor.modules.join(", ")}
          </p>

          {/* --- TOPICS BADGES --- */}
          <div className="mb-3">
            {/* Array Mapping: Creates a badge for every topic in the list */}
            {tutor.topics.map((topic, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {topic}
              </span>
            ))}
          </div>

          {/* --- FOOTER: PRICE & ACTION BUTTON --- */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="fw-bold text-success">${tutor.hourlyRate}/hr</span>

            {/* NAVIGATION LINK */}
            {/* Uses MongoDB's unique '_id' to create the URL (e.g., /tutor/65a...) */}
            <Link to={`/tutor/${tutor._id}`} className="btn btn-outline-primary btn-sm">
              View Profile
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TutorCard;