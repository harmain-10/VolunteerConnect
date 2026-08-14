import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ApplyModal from "../../components/events/ApplyModal";
import "./EventDetails.css";

const CATEGORY_IMAGES = {
  Environment: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200",
  Education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200",
  "Food & Hunger": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
  Health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200",
  Animals: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&q=80&w=1200",
  Community: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200",
  Arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200",
  Default: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1200"
};

// Fallback detail mock if ID is sample or backend event is offline
const SAMPLE_DETAILS = {
  _id: "sample-1",
  title: "Riverside Park Cleanup Drive",
  category: "Environment",
  description: `Join us for a morning of environmental restoration work along the beautiful river trail. Volunteers will assist with collecting plastic waste, clearing invasive plant species, and restoring indigenous habitats.

What to Bring:
• Comfortable clothes you don't mind getting a bit dirty
• Closed-toe shoes or work boots
• Reusable water bottle

We will provide sturdy work gloves, trash grabbers, recycling bags, and morning light snacks & refreshments.`,
  eventDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  startTime: "08:00 AM",
  endTime: "12:00 PM",
  location: "Fatima Jinnah Park (F-9), North Entrance",
  city: "Islamabad",
  requiredVolunteers: 30,
  registeredVolunteers: 18,
  requiredSkills: ["Teamwork", "Physical Activity", "Environmental Passion"],
  organization: {
    name: "Clean & Green Pakistan Foundation",
    city: "Islamabad",
    website: "https://cleangreenpakistan.org",
    description: "Empowering local communities across Pakistan through environmental education, urban forestry, and watershed preservation programs."
  }
};

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEventDetails();
  }, [id, navigate]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`);
      const data = await response.json();

      if (response.ok && data.event) {
        setEvent(data.event);
      } else {
        setEvent(null);
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (category) => {
    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Default;
  };

  if (loading) {
    return (
      <div className="event-details-page loading-view">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page error-view">
        <h2>Event Not Found</h2>
        <p>The volunteer opportunity you are looking for does not exist or has been removed.</p>
        <Link to="/events" className="back-btn">← Back to Events Feed</Link>
      </div>
    );
  }

  const totalVolunteers = event.requiredVolunteers || 10;
  const joinedVolunteers = event.registeredVolunteers || 0;
  const openSpots = Math.max(0, totalVolunteers - joinedVolunteers);
  const percentFilled = Math.min(100, Math.round((joinedVolunteers / totalVolunteers) * 100));

  return (
    <div className="event-details-page">

      {/* BREADCRUMB NAV */}
      <div className="details-sub-header">
        <div className="details-container">
          <div className="breadcrumbs">
            <Link to="/events">Events Feed</Link>
            <span className="sep">›</span>
            <span>{event.category}</span>
            <span className="sep">›</span>
            <span className="active">{event.title}</span>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div
        className="details-hero-banner"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(12, 35, 34, 0.4) 0%, rgba(12, 35, 34, 0.92) 100%), url(${getCategoryImage(
            event.category
          )})`,
        }}
      >
        <div className="details-container hero-content-inner">
          <div className="hero-tags">
            <span className="category-tag">{event.category}</span>
            {event.status === "closed" || openSpots === 0 ? (
              <span className="status-tag status-closed">Event Full / Closed</span>
            ) : (
              <span className="status-tag status-open">● Open for Registration</span>
            )}
          </div>

          <h1 className="event-main-title">{event.title}</h1>

          <div className="hero-org-info">
            <div className="org-avatar-badge">
              {event.organization?.name
                ? event.organization.name.charAt(0).toUpperCase()
                : "O"}
            </div>
            <div>
              <p className="org-label">Hosted by</p>
              <h3 className="org-name-text">{event.organization?.name || "Community Partner"}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT AREA */}
      <div className="details-container main-layout">
        
        {/* LEFT COLUMN: DETAILS & ABOUT */}
        <div className="details-left-column">
          
          <section className="details-card-box">
            <h2>About this Opportunity</h2>
            <div className="description-content">
              {event.description.split("\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </section>

          {/* REQUIRED SKILLS */}
          {event.requiredSkills && event.requiredSkills.length > 0 && (
            <section className="details-card-box">
              <h2>Required Skills & Competencies</h2>
              <div className="skills-tags-grid">
                {event.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="skill-badge-item">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ABOUT THE ORGANIZATION */}
          {event.organization && (
            <section className="details-card-box org-card-box">
              <h2>About the Host Organization</h2>
              <div className="org-details-row">
                <div className="org-large-avatar">
                  {event.organization.profileImage ? (
                    <img src={event.organization.profileImage} alt={event.organization.name} />
                  ) : (
                    <span>{event.organization.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="org-info-block">
                  <h3>{event.organization.name}</h3>
                  <p className="org-location">📍 {event.organization.city || "Islamabad"}</p>
                  {event.organization.description && (
                    <p className="org-desc-text">{event.organization.description}</p>
                  )}
                  {event.organization.website && (
                    <a
                      href={event.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="org-website-link"
                    >
                      🌐 Visit Official Website →
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: ACTION SIDEBAR CARD */}
        <div className="details-right-sidebar">
          <div className="sidebar-action-card">

            {/* CAPACITY PROGRESS */}
            <div className="sidebar-capacity">
              <div className="capacity-header">
                <span>Volunteer Slots</span>
                <span className="open-badge">{openSpots} spots remaining</span>
              </div>

              <div className="capacity-bar-track">
                <div
                  className="capacity-bar-fill"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>

              <p className="capacity-summary">
                <strong>{joinedVolunteers}</strong> of {totalVolunteers} volunteers registered
              </p>
            </div>

            <hr className="divider" />

            {/* EVENT METADATA LIST */}
            <div className="sidebar-meta-list">
              <div className="meta-row">
                <span className="meta-icon font-teal">📅</span>
                <div>
                  <strong>Date & Time</strong>
                  <p>
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Flexible Date"}
                  </p>
                  <p className="sub-time">
                    {event.startTime} - {event.endTime || "Flexible"}
                  </p>
                </div>
              </div>

              <div className="meta-row">
                <span className="meta-icon font-teal">📍</span>
                <div>
                  <strong>Location</strong>
                  <p>{event.location}</p>
                  <p className="sub-time">{event.city || "Islamabad"}</p>
                </div>
              </div>
            </div>

            {/* CTA BUTTON */}
            <button
              className="register-primary-btn"
              disabled={event.status === "closed" || openSpots === 0}
              onClick={() => setShowApplyModal(true)}
            >
              {openSpots === 0 ? "Event Full" : "Register / Apply Now →"}
            </button>

            <button
              className="secondary-outline-btn"
              onClick={() => navigate("/events")}
            >
              ← Browse More Events
            </button>

          </div>
        </div>

      </div>

      {/* REGISTRATION / APPLY MODAL */}
      {showApplyModal && (
        <ApplyModal
          event={event}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            fetchEventDetails();
          }}
        />
      )}

    </div>
  );
}

export default EventDetails;
