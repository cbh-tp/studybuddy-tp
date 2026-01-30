import { Link, NavLink } from 'react-router-dom';

function Navbar({ user, logout }) {
  return (
    // Bootstrap Navbar: Dark theme with primary blue background
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container-fluid px-5">

        {/* --- BRAND LOGO --- */}
        {/* Clicking this always takes you back to the Home Page */}
        <Link className="navbar-brand fw-bold" to="/">
          StudyBuddy TP
        </Link>

        {/* --- MOBILE TOGGLE BUTTON --- */}
        {/* This appears only on small screens (phones) to open the menu */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* --- NAVIGATION LINKS --- */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">

            {/* 1. HOME LINK */}
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  // If active, show yellow text + underline. If not, show white text.
                  `nav-link ${isActive ? "text-warning fw-bold border-bottom border-warning" : "text-white"}`
                }
              >
                Home
              </NavLink>
            </li>

            {/* 2. MY BOOKINGS LINK (Visible to all logged-in users) */}
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

            {/* 3. TUTOR DASHBOARD (Protected Route) */}
            {/* LOGIC: Only show this link if User exists AND User is a 'Tutor' */}
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

            {/* 4. USER PROFILE / LOGIN BUTTON */}
            <li className="nav-item ms-4">
              {user ? (
                // STATE A: User is Logged In -> Show Name + Logout Button
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-light text-primary">
                    {user.name} ({user.role})
                  </span>
                  <button onClick={logout} className="btn btn-sm btn-outline-light">
                    Logout
                  </button>
                </div>
              ) : (
                // STATE B: User is Guest -> Show Login Button
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