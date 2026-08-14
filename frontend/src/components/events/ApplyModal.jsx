import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ApplyModal.css";

function ApplyModal({ event, onClose, onSuccess }) {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    skills: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        skills: user.skills ? (Array.isArray(user.skills) ? user.skills.join(", ") : user.skills) : "",
        message: "",
      });
    }
  }, []);

  // Require login if guest or non-volunteer
  if (!user || !token) {
    return (
      <div className="apply-modal-overlay" onClick={onClose}>
        <div className="apply-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Volunteer Login Required</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body auth-prompt">
            <div className="auth-icon font-teal">🔒</div>
            <h4>Sign in to Register for Events</h4>
            <p>Please log in with a Volunteer account to complete your registration for <strong>{event.title}</strong>.</p>
            <div className="auth-actions">
              <button className="primary-btn" onClick={() => navigate("/login")}>
                Log In
              </button>
              <button className="secondary-btn" onClick={() => navigate("/signup?role=volunteer")}>
                Create Volunteer Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", server: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.city.trim()) newErrors.city = "City is required";
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
    setErrors({});

    try {
      const response = await fetch(
        `http://localhost:5000/api/application/${event._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ server: data.message || "Failed to submit application" });
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ server: "Unable to connect to server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-modal-overlay" onClick={onClose}>
      <div className="apply-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* MODAL HEADER */}
        <div className="modal-header">
          <div>
            <span className="modal-badge">{event.category || "Volunteer Opportunity"}</span>
            <h3>Event Registration Form</h3>
            <p className="modal-sub">{event.title} • Hosted by {event.organization?.name || "Organization"}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body">
          {success ? (
            <div className="success-view">
              <div className="check-icon">✓</div>
              <h4>Registration Submitted Successfully!</h4>
              <p>Your application and volunteer details have been submitted to the event host.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {errors.server && <div className="modal-error">{errors.server}</div>}

              {/* FULL NAME & EMAIL */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              {/* PHONE & CITY */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. 0300 1234567 or +92 300 1234567"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>City / Location *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={form.city}
                    onChange={handleChange}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
              </div>

              {/* SKILLS */}
              <div className="form-group">
                <label>Your Skills & Relevant Experience</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g. Tutoring, First Aid, Event Support, Communication"
                  value={form.skills}
                  onChange={handleChange}
                />
              </div>

              {/* MOTIVATION / MESSAGE */}
              <div className="form-group">
                <label>Why do you want to join this event? (Optional)</label>
                <textarea
                  name="message"
                  placeholder="Share a brief message with the organization about your interest..."
                  value={form.message}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              {/* ACTIONS */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Submitting Registration..." : "Complete & Submit Application"}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default ApplyModal;
