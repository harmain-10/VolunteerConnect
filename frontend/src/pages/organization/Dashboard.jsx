import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function OrganizationDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [myEvents, setMyEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter tab state for applications: "pending" | "accepted" | "rejected" | "all"
  const [appFilter, setAppFilter] = useState("pending");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "organization") {
      navigate("/");
      return;
    }
    setUser(parsedUser);
    setToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    if (token) {
      fetchMyEvents();
      fetchOrgApplications();
    }
  }, [token]);

  const fetchMyEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("http://localhost:5000/api/events/my-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to fetch organization events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchOrgApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/application/organization/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        const fetchedApps = data.applications || [];
        setApplications(fetchedApps);

        // If there are pending apps, default filter tab to pending; otherwise all
        const pendingCount = fetchedApps.filter((a) => a.status === "pending").length;
        if (pendingCount > 0) {
          setAppFilter("pending");
        } else {
          setAppFilter("all");
        }
      }
    } catch (err) {
      console.error("Failed to fetch organization applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleAccept = async (appId) => {
    setActionLoading(appId);
    try {
      const res = await fetch(
        `http://localhost:5000/api/application/${appId}/accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, status: "accepted" } : app
          )
        );
        fetchMyEvents();
      } else {
        alert(data.message || "Failed to accept application");
      }
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId) => {
    setActionLoading(appId);
    try {
      const res = await fetch(
        `http://localhost:5000/api/application/${appId}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, status: "rejected" } : app
          )
        );
        fetchMyEvents();
      } else {
        alert(data.message || "Failed to reject application");
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return <div className="loading-screen">Loading...</div>;

  const isApproved = user.status === "approved";
  const pendingApps = applications.filter((a) => a.status === "pending");
  const acceptedApps = applications.filter((a) => a.status === "accepted");
  const rejectedApps = applications.filter((a) => a.status === "rejected");

  // Filter list based on selected appFilter tab
  let displayedApplications = applications;
  if (appFilter === "pending") {
    displayedApplications = pendingApps;
  } else if (appFilter === "accepted") {
    displayedApplications = acceptedApps;
  } else if (appFilter === "rejected") {
    displayedApplications = rejectedApps;
  }

  return (
    <div className="dashboard-container organization-dashboard">
      
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="welcome-banner">
          <h1>{user.name}</h1>
          <p>Organization Dashboard • Review volunteer profiles and manage event applications.</p>
        </div>

        <div className="header-quick-actions">
          <button
            className={`primary-btn ${!isApproved ? "disabled-lock-btn" : ""}`}
            disabled={!isApproved}
            onClick={() => navigate("/organization/events/create")}
            title={!isApproved ? "Event creation will be unlocked once approved by Admin" : "Create new volunteer event"}
          >
            {isApproved ? "+ Create New Event" : "🔒 Create Event (Approval Pending)"}
          </button>
          <button
            className="secondary-btn"
            onClick={() => navigate("/organization/events")}
          >
            My Events Feed ({myEvents.length})
          </button>
        </div>
      </header>

        {/* PROFILE COMPLETION WARNING */}
        {(!user.city || !user.name || !user.website || !user.description) && (
          <div className="warning-bar organization-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">Please complete your organization profile first — the admin needs your details to approve your account.</span>
            <button className="primary-btn" onClick={() => navigate("/complete-profile")}>Complete Profile</button>
          </div>
        )}

      {/* APPROVAL STATUS NOTIFICATION BAR */}
      {!isApproved && (
        <div className={`status-notification-bar ${user.status}`}>
          <div className="status-icon">⚠️</div>
          <div className="status-content">
            <h4>Account Approval Pending</h4>
            <p>
              Your organization account is currently waiting for administrator approval. 
              Event creation and applicant approvals will be unlocked once approved by Admin.
            </p>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW CARDS (CLICKABLE FILTERS) */}
      <div className="org-stats-row">
        <div className="stat-box accent">
          <span className="stat-icon font-teal">🏢</span>
          <div>
            <h3>{myEvents.length}</h3>
            <p>Posted Events</p>
          </div>
        </div>

        <div
          className={`stat-box clickable ${appFilter === "all" ? "active-stat" : ""}`}
          onClick={() => setAppFilter("all")}
        >
          <span className="stat-icon font-teal">📩</span>
          <div>
            <h3>{applications.length}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div
          className={`stat-box clickable ${appFilter === "pending" ? "active-stat" : ""}`}
          onClick={() => setAppFilter("pending")}
        >
          <span className="stat-icon font-teal">⏳</span>
          <div>
            <h3>{pendingApps.length}</h3>
            <p>Pending Reviews</p>
          </div>
        </div>

        <div
          className={`stat-box clickable ${appFilter === "accepted" ? "active-stat" : ""}`}
          onClick={() => setAppFilter("accepted")}
        >
          <span className="stat-icon font-teal">✅</span>
          <div>
            <h3>{acceptedApps.length}</h3>
            <p>Accepted Volunteers</p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN DASHBOARD SECTIONS */}
      <div className="org-dashboard-main-grid">
        
        {/* LEFT SECTION: ORGANIZATIONS SPECIFIC EVENTS */}
        <div className="dashboard-section-box">
          <div className="section-title-bar">
            <h2>🏢 My Events</h2>
            <Link to="/organization/events" className="view-all-link">
              Manage All Events ({myEvents.length}) →
            </Link>
          </div>

          {loadingEvents ? (
            <div className="section-loading">Loading events...</div>
          ) : myEvents.length === 0 ? (
            <div className="empty-section">
              <p>You haven't posted any events yet.</p>
              <button
                className={`small-btn primary ${!isApproved ? "disabled-lock-btn" : ""}`}
                disabled={!isApproved}
                onClick={() => navigate("/organization/events/create")}
                title={!isApproved ? "Event creation will be unlocked once approved by Admin" : "Create new volunteer event"}
              >
                {isApproved ? "Create Your First Event" : "🔒 Create Event (Approval Pending)"}
              </button>
            </div>
          ) : (
            <div className="events-mini-list">
              {myEvents.map((evt) => {
                const joined = evt.registeredVolunteers || 0;
                const capacity = evt.requiredVolunteers || 10;
                const percent = Math.min(100, Math.round((joined / capacity) * 100));

                return (
                  <div className="mini-event-card" key={evt._id}>
                    <div className="mini-event-header">
                      <div>
                        <span className="cat-badge">{evt.category}</span>
                        <h4>{evt.title}</h4>
                      </div>
                      <span className={`status-pill ${evt.status}`}>
                        {evt.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mini-event-meta">
                      <span>📅 {evt.eventDate ? new Date(evt.eventDate).toLocaleDateString() : "Flexible"}</span>
                      <span>📍 {evt.location || evt.city}</span>
                    </div>

                    <div className="mini-capacity-bar">
                      <div className="cap-label">
                        <span>Capacity</span>
                        <strong>{joined} / {capacity} Registered</strong>
                      </div>
                      <div className="track">
                        <div className="fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SECTION: INCOMING VOLUNTEER APPLICATIONS & DETAILS */}
        <div className="dashboard-section-box">
          <div className="section-title-bar">
            <h2>📩 Volunteer Applications</h2>
          </div>

          {/* APPLICATION TAB FILTERS */}
          <div className="app-filter-tabs">
            <button
              className={`app-tab-btn ${appFilter === "pending" ? "active" : ""}`}
              onClick={() => setAppFilter("pending")}
            >
              ⏳ Pending Reviews ({pendingApps.length})
            </button>

            <button
              className={`app-tab-btn ${appFilter === "accepted" ? "active" : ""}`}
              onClick={() => setAppFilter("accepted")}
            >
              ✅ Accepted ({acceptedApps.length})
            </button>

            <button
              className={`app-tab-btn ${appFilter === "rejected" ? "active" : ""}`}
              onClick={() => setAppFilter("rejected")}
            >
              ✕ Rejected ({rejectedApps.length})
            </button>

            <button
              className={`app-tab-btn ${appFilter === "all" ? "active" : ""}`}
              onClick={() => setAppFilter("all")}
            >
              All ({applications.length})
            </button>
          </div>

          {loadingApps ? (
            <div className="section-loading">Loading volunteer applications...</div>
          ) : displayedApplications.length === 0 ? (
            <div className="empty-section">
              {appFilter === "pending" ? (
                <p>✨ Clear! No pending volunteer applications to review right now.</p>
              ) : appFilter === "accepted" ? (
                <p>No accepted volunteers yet.</p>
              ) : appFilter === "rejected" ? (
                <p>No rejected applications.</p>
              ) : (
                <p>No volunteer applications received yet.</p>
              )}
            </div>
          ) : (
            <div className="applications-vertical-list">
              {displayedApplications.map((app) => {
                const vol = app.volunteer || {};
                const name = app.fullName || vol.name || "Volunteer";
                const email = app.email || vol.email || "";
                const city = app.city || vol.city || "";
                const phone = app.phone || "";
                const bio = vol.bio || "";
                const skills = app.skills || (vol.skills ? vol.skills.join(", ") : "");
                const message = app.message || "";
                const eventTitle = app.event?.title || "Volunteer Event";
                const profileImg = vol.profileImage || "";

                return (
                  <div className="app-card-item" key={app._id}>
                    <div className="app-card-top-row">
                      <div className="vol-avatar font-teal">
                        {profileImg ? (
                          <img src={profileImg} alt={name} />
                        ) : (
                          <span>{name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="vol-header-info">
                        <span className="event-for-tag">Applied for: {eventTitle}</span>
                        <h3>{name}</h3>
                        <p className="contact-line">
                          📧 {email} {phone ? `• 📞 ${phone}` : ""} • 📍 {city}
                        </p>
                      </div>

                      <span className={`status-pill ${app.status}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    {/* VOLUNTEER BIO */}
                    {bio && (
                      <div className="vol-detail-block">
                        <strong>Volunteer Bio:</strong>
                        <p className="detail-text">{bio}</p>
                      </div>
                    )}

                    {/* VOLUNTEER SKILLS */}
                    {skills && (
                      <div className="vol-detail-block">
                        <strong>Skills & Experience:</strong>
                        <div className="skills-chips-row">
                          {skills.split(",").map((s, idx) => (
                            <span key={idx} className="skill-chip-pill">
                              ✓ {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* APPLICANT MESSAGE / MOTIVATION NOTE */}
                    {message && (
                      <div className="app-message-box">
                        <strong>Message to Host:</strong>
                        <p>"{message}"</p>
                      </div>
                    )}

                    {/* DECISION BUTTONS FOR PENDING APPLICATIONS */}
                    {app.status === "pending" && (
                      <div className="app-action-btns">
                        <button
                          className="accept-btn"
                          disabled={actionLoading === app._id || !isApproved}
                          onClick={() => handleAccept(app._id)}
                        >
                          {actionLoading === app._id ? "Processing..." : "✓ Accept Volunteer"}
                        </button>

                        <button
                          className="reject-btn"
                          disabled={actionLoading === app._id || !isApproved}
                          onClick={() => handleReject(app._id)}
                        >
                          {actionLoading === app._id ? "Processing..." : "✕ Reject"}
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

    </div>
  );
}

export default OrganizationDashboard;
