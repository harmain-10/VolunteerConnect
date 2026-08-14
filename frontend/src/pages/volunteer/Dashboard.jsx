import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VolunteerPassModal from "../../components/volunteer/VolunteerPassModal";
import "./Dashboard.css";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedPassApp, setSelectedPassApp] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "volunteer") {
      navigate("/");
      return;
    }
    setUser(parsedUser);
    setToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    if (token) {
      fetchMyApplications();
    }
  }, [token]);

  const fetchMyApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/application/myapplications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setApplications(data.application || []);
      }
    } catch (err) {
      console.error("Error fetching volunteer applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  if (!user) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="dashboard-container volunteer-dashboard">
      
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="welcome-banner">
          <h1>Welcome back, {user.name}!</h1>
          <p>Ready to make a difference in your community today?</p>
        </div>

        <Link to="/events" className="browse-events-btn">
          🔍 Browse Events Feed
        </Link>
      </header>
      {(!user.city || !user.name || !user.bio || !user.skills || user.skills.length === 0) && (
        <div className="warning-bar volunteer-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Please complete your volunteer profile (Bio & Skills) before applying for events. A complete profile helps host organizations review and approve your application faster.
          </span>
          <button className="primary-btn" onClick={() => navigate("/complete-profile")}>
            Complete Profile
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        
        {/* PROFILE STATUS CARD */}
        <div className="dashboard-card status-card">
          <div className="card-header">
            <h3>Your Profile</h3>
            <span className="badge approved-badge">Active Volunteer</span>
          </div>

          <div className="profile-preview">
            <div className="avatar-large font-teal">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="avatar-img" />
              ) : (
                <span className="avatar-text-large">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="profile-details">
              <h4>{user.name}</h4>
              <p className="detail-item"><strong>Email:</strong> {user.email}</p>
              <p className="detail-item"><strong>City:</strong> {user.city}</p>
              {user.bio && <p className="detail-item bio-preview"><strong>Bio:</strong> {user.bio}</p>}
              {user.skills && user.skills.length > 0 && (
                <div className="skills-tags">
                  <strong>Skills: </strong>
                  {user.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card-actions">
            <Link to="/complete-profile" className="secondary-btn">
              Edit Profile
            </Link>
          </div>
        </div>

        {/* APPLICATIONS & PARTICIPATION PASS CARD */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>My Event Applications ({applications.length})</h3>
            <span className="sub-count font-teal">
              {applications.filter((a) => a.status === "accepted").length} Accepted
            </span>
          </div>

          {loadingApps ? (
            <p className="card-text">Loading your applications...</p>
          ) : applications.length === 0 ? (
            <div className="empty-apps-box">
              <p className="card-text">
                You haven't applied to any volunteer events yet. Explore open opportunities in your area to get started!
              </p>
              <Link to="/events" className="primary-btn">
                Discover Events
              </Link>
            </div>
          ) : (
            <div className="volunteer-apps-list">
              {applications.map((app) => {
                const evt = app.event || {};
                const isAccepted = app.status === "accepted";

                return (
                  <div className="volunteer-app-item" key={app._id}>
                    <div className="app-item-main">
                      <div className="app-info">
                        <span className="event-cat-badge">{evt.category || "Volunteer Service"}</span>
                        <h4>{evt.title || "Volunteer Opportunity"}</h4>
                        <p className="meta-text">
                          📅 {evt.eventDate ? new Date(evt.eventDate).toLocaleDateString() : "Flexible Date"} • 📍 {evt.location || evt.city || "Islamabad"}
                        </p>
                        {evt.organization?.name && (
                          <p className="org-text">Hosted by <strong>{evt.organization.name}</strong></p>
                        )}
                      </div>

                      <div className="app-status-column">
                        <span className={`status-pill ${app.status}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* PASS DOWNLOAD BUTTON WHEN ACCEPTED */}
                    {isAccepted && (
                      <div className="pass-banner">
                        <div className="pass-banner-text">
                          <span className="ticket-icon">🎟️</span>
                          <span>Participation Approved! Print or save your event pass for check-in.</span>
                        </div>
                        <button
                          className="view-pass-btn"
                          onClick={() => setSelectedPassApp(app)}
                        >
                          🎟️ View & Print Pass
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* PRINTABLE PASS MODAL */}
      {selectedPassApp && (
        <VolunteerPassModal
          application={selectedPassApp}
          onClose={() => setSelectedPassApp(null)}
        />
      )}

    </div>
  );
}

export default VolunteerDashboard;
