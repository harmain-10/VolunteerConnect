import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      
      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        <span className="logo-mark font-teal">V</span>
        <span className="logo-text">
          Volunteer<span>Connect</span>
        </span>
      </Link>

      {/* NAVIGATION LINKS */}
      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Home
        </NavLink>

        {user && (
          <>
            <NavLink
              to="/events"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              Events Feed
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              My Dashboard
            </NavLink>

            {user.role === "organization" && (
              <NavLink
                to="/organization/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Organization
              </NavLink>
            )}

            {user.role === "admin" && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Admin Panel
              </NavLink>
            )}
          </>
        )}
      </div>

      {/* RIGHT SIDE USER / AUTH ACTIONS */}
      <div className="navbar-actions">
        {!user ? (
          <div className="nav-auth-group">
            <NavLink
              to="/login"
              className={({ isActive }) => `login-link ${isActive ? "active" : ""}`}
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) => `signup-btn ${isActive ? "active" : ""}`}
            >
              Sign Up
            </NavLink>
          </div>
        ) : (
          <div className="profile-area">
            <div className="profile">
              <div className="profile-avatar font-teal">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>

              <span className="profile-name">
                {user.name || "User"}
              </span>

              <button className="nav-logout-btn" onClick={handleLogout} title="Log Out">
                Logout 🚪
              </button>
            </div>
          </div>
        )}
      </div>

    </nav>
  );
}

export default Navbar;