import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CreateEvent.css";

const CATEGORIES = [
  "Environment",
  "Education",
  "Food & Hunger",
  "Health",
  "Animals",
  "Community",
  "Arts",
];

function CreateEvent() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "Environment",
    description: "",
    location: "",
    eventDate: "",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    requiredVolunteers: 15,
    requiredSkills: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "organization") {
      navigate("/");
      return;
    }

    setUser(parsed);
    setToken(storedToken);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "", server: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Event title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.eventDate) newErrors.eventDate = "Event date is required";
    if (form.requiredVolunteers <= 0)
      newErrors.requiredVolunteers = "Number of volunteers must be at least 1";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setLoading(true);

    const skillsArray = form.requiredSkills
      ? form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      location: form.location.trim(),
      city: user?.city || "Islamabad",
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: form.endTime,
      requiredVolunteers: Number(form.requiredVolunteers),
      requiredSkills: skillsArray,
    };

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ server: data.message || "Failed to create event" });
        return;
      }

      alert("Event created successfully!");
      navigate("/organization/events");
    } catch (err) {
      setErrors({ server: "Unable to connect to server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        
        {/* HEADER */}
        <div className="create-event-header">
          <div>
            <p className="page-label">ORGANIZATION PANEL</p>
            <h1>Create Volunteer Opportunity</h1>
            <p className="page-subtitle">
              Post a new event to connect with passionate volunteers in your community.
            </p>
          </div>

          <Link to="/organization/events" className="back-link-btn">
            ← Back to My Events
          </Link>
        </div>

        {/* FORM CARD */}
        <div className="create-event-card">
          {errors.server && <div className="server-error-banner">{errors.server}</div>}

          <form onSubmit={handleSubmit}>
            
            {/* TITLE & CATEGORY */}
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Clean & Green Pakistan Plantation Drive"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
              </div>

              <div className="form-group flex-1">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label>Event Description *</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe the opportunity, responsibilities, what volunteers should bring, and impact..."
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            {/* DATE & TIME */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Event Date *</label>
                <input
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                />
                {errors.eventDate && <span className="error-msg">{errors.eventDate}</span>}
              </div>

              <div className="form-group flex-1">
                <label>Start Time</label>
                <input
                  type="text"
                  name="startTime"
                  placeholder="e.g. 09:00 AM"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group flex-1">
                <label>End Time</label>
                <input
                  type="text"
                  name="endTime"
                  placeholder="e.g. 01:00 PM"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* LOCATION & VOLUNTEER CAPACITY */}
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Exact Location / Venue *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Fatima Jinnah Park (F-9), Islamabad"
                  value={form.location}
                  onChange={handleChange}
                />
                {errors.location && <span className="error-msg">{errors.location}</span>}
              </div>

              <div className="form-group flex-1">
                <label>Volunteers Needed *</label>
                <input
                  type="number"
                  name="requiredVolunteers"
                  min="1"
                  value={form.requiredVolunteers}
                  onChange={handleChange}
                />
                {errors.requiredVolunteers && (
                  <span className="error-msg">{errors.requiredVolunteers}</span>
                )}
              </div>
            </div>

            {/* REQUIRED SKILLS */}
            <div className="form-group">
              <label>Required Skills (Comma-separated)</label>
              <input
                type="text"
                name="requiredSkills"
                placeholder="e.g. Teamwork, Event Support, Physical Fitness, Tutoring"
                value={form.requiredSkills}
                onChange={handleChange}
              />
              <small className="help-note">Separate skills with commas (optional)</small>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="form-submit-row">
              <button type="submit" disabled={loading} className="publish-event-btn">
                {loading ? "Publishing Opportunity..." : "🚀 Publish Volunteer Event"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default CreateEvent;
