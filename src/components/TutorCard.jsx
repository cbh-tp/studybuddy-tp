import { Link } from 'react-router-dom';

function TutorCard({ tutor }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            {/* Avatar Circle */}
            <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
              style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
              {tutor.name.charAt(0)}
            </div>
            <div>
              <h5 className="card-title mb-0">{tutor.name}</h5>
              <div className="text-warning small">
                {'★'.repeat(Math.round(tutor.ratingAvg))}
                <span className="text-muted ms-1">({tutor.ratingCount})</span>
              </div>
            </div>
          </div>

          <p className="card-text text-muted small mb-2">
            <strong>Modules:</strong> {tutor.modules.join(", ")}
          </p>

          <div className="mb-3">
            {tutor.topics.map((topic, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {topic}
              </span>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="fw-bold text-success">${tutor.hourlyRate}/hr</span>

            {/* ✅ FIXED: Use _id (MongoDB) instead of profileId */}
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