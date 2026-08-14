import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrganizationEvents.css";

const CATEGORY_IMAGES = {
  Environment: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
  Education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
  "Food & Hunger": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
  Health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
  Animals: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&q=80&w=800",
  Community: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
  Arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800",
  Default: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800"
};

function OrganizationEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventApplicants, setSelectedEventApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/events/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicants = async (eventObj) => {
    setSelectedEventApplicants(eventObj);
    setLoadingApplicants(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/application/event/${eventObj._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplicantsList(data.application || []);
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleAcceptVolunteer = async (appId) => {
    setActionLoading(appId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/application/${appId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplicantsList((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: "accepted" } : a))
        );
        fetchMyEvents();
      } else {
        alert(data.message || "Failed to accept");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVolunteer = async (appId) => {
    setActionLoading(appId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/application/${appId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplicantsList((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: "rejected" } : a))
        );
        fetchMyEvents();
      } else {
        alert(data.message || "Failed to reject");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryImage = (category) => {
    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Default;
  };

  return (
    <div className="organization-events-page">

      <div className="organization-events-container">

        {/* HEADER */}
        <div className="events-page-header">

          <div>
            <p className="page-label">ORGANIZATION DASHBOARD</p>
            <h1>My Posted Events</h1>
            <p className="page-subtitle">
              Manage the volunteer opportunities created by your organization and process volunteer applications.
            </p>
          </div>

          <div className="header-buttons">
            <button
              onClick={() => navigate("/organization/events/create")}
              className="create-event-btn"
            >
              + Create New Event
            </button>

            <Link
              to="/organization/dashboard"
              className="dashboard-btn"
            >
              Back to Dashboard
            </Link>
          </div>

        </div>

        {/* EVENT COUNT BAR */}
        {!loading && (
          <div className="events-count-bar">
            <span>{events.length}</span>
            {events.length === 1 ? " Opportunity Posted" : " Opportunities Posted"}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="events-loading">
            <div className="spinner"></div>
            <p>Loading your events...</p>
          </div>
        )}

        {/* EVENTS LIST */}
        {!loading && events.length > 0 && (
          <div className="organization-event-grid">

            {events.map((event) => {
              const joined = event.registeredVolunteers || 0;
              const capacity = event.requiredVolunteers || 10;
              const percent = Math.min(100, Math.round((joined / capacity) * 100));

              return (
                <div className="organization-event-card" key={event._id}>

                  {/* TOP BANNER */}
                  <div className="event-card-banner">
                    <img src={getCategoryImage(event.category)} alt={event.title} />
                    <div className="banner-overlay" />

                    <span className="category-pill-badge">{event.category}</span>

                    <span className={`status-badge-pill ${event.status}`}>
                      {event.status === "open" ? "Active" : "Closed"}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="organization-event-content">

                    <h2>{event.title}</h2>

                    <p className="event-description">
                      {event.description}
                    </p>

                    <div className="event-info">
                      <div>
                        <span className="info-icon">📅</span>
                        <span>
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString()
                            : "Flexible Date"}
                          {event.startTime ? ` • ${event.startTime}` : ""}
                        </span>
                      </div>

                      <div>
                        <span className="info-icon">📍</span>
                        <span>{event.location || event.city}</span>
                      </div>
                    </div>

                    {/* VOLUNTEER CAPACITY BAR */}
                    <div className="org-capacity-section">
                      <div className="capacity-text">
                        <span>Capacity Status</span>
                        <strong>{joined} / {capacity} Registered</strong>
                      </div>
                      <div className="track-bar">
                        <div className="fill-bar" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="event-card-footer">
                      <button
                        className="applicants-btn"
                        onClick={() => handleViewApplicants(event)}
                      >
                        👥 Manage Applicants
                      </button>

                      <Link
                        to={`/events/${event._id}`}
                        className="view-event-btn"
                      >
                        Public Preview →
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && events.length === 0 && (
          <div className="empty-events">
            <div className="empty-v font-teal">🌱</div>
            <h2>No events posted yet</h2>
            <p>
              You haven't created any volunteer opportunities yet. Click below to publish your first event!
            </p>

            <button
              onClick={() => navigate("/organization/events/create")}
              className="create-first-event-btn"
            >
              + Create Your First Event
            </button>
          </div>
        )}

      </div>

      {/* APPLICANTS MANAGEMENT MODAL */}
      {selectedEventApplicants && (
        <div className="applicants-modal-overlay" onClick={() => setSelectedEventApplicants(null)}>
          <div className="applicants-modal-card" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <h3>Applicants for {selectedEventApplicants.title}</h3>
                <p className="sub">Review and accept or reject volunteer applications.</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedEventApplicants(null)}>✕</button>
            </div>

            <div className="modal-body">
              {loadingApplicants ? (
                <div className="modal-loading">Loading applicants...</div>
              ) : applicantsList.length === 0 ? (
                <div className="modal-empty">
                  <p>No applications received for this event yet.</p>
                </div>
              ) : (
                <div className="applicants-list">
                  {applicantsList.map((app) => {
                    const vol = app.volunteer || {};
                    const name = app.fullName || vol.name || "Volunteer";
                    const email = app.email || vol.email || "";
                    const city = app.city || vol.city || "";
                    const phone = app.phone || "";
                    const bio = vol.bio || "";
                    const skills = app.skills || (vol.skills ? vol.skills.join(", ") : "");
                    const message = app.message || "";
                    const profileImg = vol.profileImage || "";

                    return (
                      <div className="applicant-item-card" key={app._id}>
                        <div className="applicant-top-row">
                          <div className="vol-avatar font-teal">
                            {profileImg ? (
                              <img src={profileImg} alt={name} />
                            ) : (
                              <span>{name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>

                          <div className="applicant-info">
                            <strong>{name}</strong>
                            <p className="contact-sub">
                              📧 {email} {phone ? `• 📞 ${phone}` : ""} • 📍 {city}
                            </p>
                          </div>

                          <span className={`status-pill ${app.status}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>

                        {bio && (
                          <div className="vol-detail-block">
                            <strong>Bio:</strong>
                            <p className="detail-text">{bio}</p>
                          </div>
                        )}

                        {skills && (
                          <div className="vol-detail-block">
                            <strong>Skills & Experience:</strong>
                            <div className="applicant-skills">
                              {skills.split(",").map((s, idx) => (
                                <span key={idx} className="skill-chip">
                                  ✓ {s.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {message && (
                          <div className="app-message-box">
                            <strong>Message to Host:</strong>
                            <p>"{message}"</p>
                          </div>
                        )}

                        {app.status === "pending" && (
                          <div className="btn-group">
                            <button
                              className="accept-btn"
                              disabled={actionLoading === app._id}
                              onClick={() => handleAcceptVolunteer(app._id)}
                            >
                              {actionLoading === app._id ? "Processing..." : "✓ Accept Volunteer"}
                            </button>
                            <button
                              className="reject-btn"
                              disabled={actionLoading === app._id}
                              onClick={() => handleRejectVolunteer(app._id)}
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
      )}

    </div>
  );
}

export default OrganizationEvents;