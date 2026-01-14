import { Link, NavLink } from 'react-router-dom';

function Navbar({ user, logout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container-fluid px-5">
        <Link className="navbar-brand fw-bold" to="/">
          StudyBuddy TP
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            
            {/* HOME LINK */}
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? "text-warning fw-bold border-bottom border-warning" : "text-white"}`
                }
              >
                Home
              </NavLink>
            </li>

            {/* MY BOOKINGS LINK (Visible to everyone logged in) */}
            <li className="nav-item ms-3">
              <NavLink 
                to="/my-bookings" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? "text-warning fw-bold border-bottom border-warning" : "text-white"}`
                }
              >
                My Bookings
              </NavLink>
            </li>
            
            {/* ROLE-BASED LINK: Only for Tutors */}
            {user && user.role === "Tutor" && (
              <li className="nav-item ms-3">
                <NavLink 
                  to="/tutor-dashboard" 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? "text-warning fw-bold border-bottom border-warning" : "text-white"}`
                  }
                >
                  Tutor Dashboard
                </NavLink>
              </li>
            )}

            {/* USER SECTION */}
            <li className="nav-item ms-4">
              {user ? (
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-light text-primary">
                    {user.name} ({user.role})
                  </span>
                  <button onClick={logout} className="btn btn-sm btn-outline-light">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-sm btn-light text-primary fw-bold">
                  Login
                </Link>
              )}
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;