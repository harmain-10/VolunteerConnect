import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    role: "volunteer",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam === "organization" || roleParam === "volunteer") {
      setForm((prev) => ({ ...prev, role: roleParam }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
      server: "",
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.role) {
      newErrors.role = "Please select a role";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          city: form.city,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          server: data.message || "Registration failed",
        });
        return;
      }

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      setErrors({
        server: "Unable to connect to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      
      {/* LEFT INTRO PANEL */}
      <div className="signup-intro">
        <div className="signup-big-logo font-teal">V</div>
        <h1>
          Empower Change.
          <br />
          <span>Join the Movement.</span>
        </h1>
        <p>
          Find meaningful opportunities, connect with passionate organizations,
          and create lasting impact in local communities.
        </p>
      </div>

      {/* RIGHT CARD */}
      <div className="signup-card">
        <div className="signup-small-logo">V</div>
        <h2>Create Account</h2>
        <p className="signup-subtitle">
          Join your VolunteerConnect community today
        </p>

        {errors.server && <div className="server-error">{errors.server}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* ROLE SELECTOR CARDS */}
          <div className="signup-form-group">
            <label>I want to register as:</label>
            <div className="role-options">
              <label className={`role-card ${form.role === "volunteer" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="volunteer"
                  checked={form.role === "volunteer"}
                  onChange={handleChange}
                />
                <span className="role-icon">🙋</span>
                <span>Volunteer</span>
              </label>

              <label className={`role-card ${form.role === "organization" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="organization"
                  checked={form.role === "organization"}
                  onChange={handleChange}
                />
                <span className="role-icon">🏢</span>
                <span>Organization</span>
              </label>
            </div>
            {errors.role && <span className="error-text">{errors.role}</span>}
          </div>

          <div className="signup-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ali Khan"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="signup-form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="signup-form-row">
            <div className="signup-form-group flex-1">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="signup-form-group flex-1">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="signup-form-group">
            <label>City / Location</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Lahore, Karachi, Islamabad"
            />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

        </form>

        <div className="signup-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;