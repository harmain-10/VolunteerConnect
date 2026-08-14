import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Events.css";

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

const CATEGORIES = [
  "All",
  "Environment",
  "Education",
  "Food & Hunger",
  "Health",
  "Animals",
  "Community",
  "Arts"
];

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("soonest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEvents();
  }, [selectedCategory, sortBy, navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/events?sort=${sortBy}`;
      if (selectedCategory !== "All") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.events) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch events from database:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const getCategoryImage = (category) => {
    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Default;
  };

  const featuredEvent = events.length > 0 ? events[0] : null;
  const gridEvents = events.length > 1 ? events.slice(1) : events;

  return (
    <div className="public-events-page">

      {/* SUB-HEADER BREADCRUMB BAR */}
      <div className="sub-header-bar">
        <div className="sub-header-container">
          <div className="breadcrumbs">
            <span>VolunteerConnect</span>
            <span className="crumb-sep">›</span>
            <span className="crumb-active">Events Feed</span>
            <span className="crumb-sep">›</span>
            <span className="crumb-count">
              {events.length} events found in database
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="filter-bar-section">
        <div className="filter-bar-container">
          
          {/* SEARCH INPUT */}
          <form className="search-box" onSubmit={handleSearchSubmit}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search events, organizations, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  fetchEvents();
                }}
              >
                ✕
              </button>
            )}
          </form>

          {/* CATEGORY PILLS */}
          <div className="category-pills-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      <div className="events-feed-container">

        {/* FEATURED HERO EVENT BANNER CARD */}
        {featuredEvent && (
          <div className="featured-hero-card">
            <div
              className="featured-bg-overlay"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(12, 35, 34, 0.95) 0%, rgba(12, 35, 34, 0.75) 50%, rgba(12, 35, 34, 0.3) 100%), url(${getCategoryImage(
                  featuredEvent.category
                )})`,
              }}
            />

            <div className="featured-card-content">
              <div className="featured-badges">
                <span className="badge badge-featured">★ Featured Event</span>
                <span className="badge badge-category">{featuredEvent.category}</span>
              </div>

              <h1 className="featured-title">{featuredEvent.title}</h1>
              
              <p className="featured-org">
                {featuredEvent.organization?.name || "Community Partner"}
              </p>

              <p className="featured-description">
                {featuredEvent.description}
              </p>

              <div className="featured-meta">
                <span className="meta-item">
                  <span className="icon">📅</span>
                  {featuredEvent.eventDate
                    ? new Date(featuredEvent.eventDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Flexible"}
                  {featuredEvent.startTime && ` • ${featuredEvent.startTime}`}
                </span>

                <span className="meta-item">
                  <span className="icon">📍</span>
                  {featuredEvent.location || featuredEvent.city || "Islamabad"}
                </span>
              </div>

              <div className="featured-bottom-row">
                <button
                  className="featured-cta-btn"
                  onClick={() => navigate(`/events/${featuredEvent._id}`)}
                >
                  Register Now →
                </button>

                <div className="capacity-progress-inline">
                  <div className="capacity-labels">
                    <span>
                      <strong>{featuredEvent.registeredVolunteers || 0}</strong> /{" "}
                      {featuredEvent.requiredVolunteers || 20} filled
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          ((featuredEvent.registeredVolunteers || 0) /
                            (featuredEvent.requiredVolunteers || 20)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION HEADER & SORTING */}
        <div className="events-grid-header">
          <div className="grid-count">
            <h2>
              <span>{events.length}</span> Opportunities Available
            </h2>
          </div>

          <div className="sort-dropdown-container">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="soonest">Soonest First</option>
              <option value="urgent">Most Urgent</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="events-loading-state">
            <div className="spinner"></div>
            <p>Fetching events from database...</p>
          </div>
        )}

        {/* 3-COLUMN EVENT CARDS GRID */}
        {!loading && (
          <div className="events-cards-grid">
            {gridEvents.map((event) => {
              const totalNeeded = event.requiredVolunteers || 10;
              const currentJoined = event.registeredVolunteers || 0;
              const remaining = Math.max(0, totalNeeded - currentJoined);
              const percentFilled = Math.min(
                100,
                Math.round((currentJoined / totalNeeded) * 100)
              );

              return (
                <div className="event-card" key={event._id}>
                  {/* CARD MEDIA HEADER */}
                  <div className="event-card-media">
                    <img
                      src={getCategoryImage(event.category)}
                      alt={event.title}
                      loading="lazy"
                    />
                    <div className="card-media-overlay" />
                    
                    <span className="card-badge-category">
                      {event.category}
                    </span>

                    {remaining > 0 ? (
                      <span className="card-badge-left">
                        {remaining} left
                      </span>
                    ) : (
                      <span className="card-badge-full">Filled</span>
                    )}
                  </div>

                  {/* CARD BODY */}
                  <div className="event-card-body">
                    <p className="card-org-name">
                      {event.organization?.name || "Community Organization"}
                    </p>

                    <h3 className="card-event-title">{event.title}</h3>

                    <div className="card-meta-details">
                      <div className="meta-line">
                        <span className="meta-icon">📅</span>
                        <span>
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "Flexible Date"}
                          {event.startTime ? ` • ${event.startTime}` : ""}
                        </span>
                      </div>

                      <div className="meta-line">
                        <span className="meta-icon">📍</span>
                        <span>
                          {event.location || event.city || "Islamabad"}
                        </span>
                      </div>
                    </div>

                    {/* CAPACITY PROGRESS */}
                    <div className="card-capacity-section">
                      <div className="capacity-text-row">
                        <span className="joined-count">
                          <strong>{currentJoined}</strong> joined
                        </span>
                        <span className="open-count">
                          {remaining} open
                        </span>
                      </div>

                      <div className="capacity-bar-track">
                        <div
                          className="capacity-bar-fill"
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      className="card-register-btn"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      Register / View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && events.length === 0 && (
          <div className="empty-events-state">
            <div className="empty-icon font-teal">🌱</div>
            <h3>No events found</h3>
            <p>There are currently no events created matching your filters.</p>
            <div className="empty-actions">
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </button>
              <button
                className="reset-filters-btn"
                style={{ background: "#0d6b62", marginLeft: "10px" }}
                onClick={() => navigate("/organization/events/create")}
              >
                + Create Event as Organization
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Events;
