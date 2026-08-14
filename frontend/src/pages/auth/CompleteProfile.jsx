import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CompleteProfile.css";

function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [form, setForm] = useState({
    city: "",
    profileImage: "",
    bio: "",
    skills: "",
    website: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setToken(storedToken);

    setForm({
      city: parsedUser.city || "",
      profileImage: parsedUser.profileImage || "",
      bio: parsedUser.bio || "",
      skills: parsedUser.skills ? parsedUser.skills.join(", ") : "",
      website: parsedUser.website || "",
      description: parsedUser.description || "",
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      server: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (user?.role === "organization") {
      if (form.website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(form.website.trim())) {
        newErrors.website = "Enter a valid website URL starting with http:// or https://";
      }
    }

    if (form.profileImage && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(form.profileImage.trim())) {
      newErrors.profileImage = "Enter a valid image URL starting with http:// or https://";
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
    setSuccessMsg("");

    try {
      const payload = {
        city: form.city.trim(),
        profileImage: form.profileImage.trim(),
      };

      if (user.role === "volunteer") {
        payload.bio = form.bio.trim();
        payload.skills = form.skills; // Will be split on comma by backend, but we pass it as string
      } else if (user.role === "organization") {
        payload.website = form.website.trim();
        payload.description = form.description.trim();
      }

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          server: data.message || "Failed to update profile",
        });
        return;
      }

      // Update local storage
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMsg("Profile updated successfully!");

      // Wait a bit to show success message, then redirect
      setTimeout(() => {
        if (data.user.role === "organization") {
          navigate("/organization/dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/volunteer/dashboard");
        }
      }, 1500);
    } catch (err) {
      setErrors({
        server: "Unable to connect to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-card">
        <h2>Complete Your Profile</h2>
        <p className="subtitle">
          Please provide additional details to get the most out of VolunteerConnect
        </p>

        {successMsg && <div className="success-banner">{successMsg}</div>}
        {errors.server && <div className="server-error">{errors.server}</div>}

        <form onSubmit={handleSubmit}>
          {/* PROFILE IMAGE URL WITH PREVIEW */}
          <div className="form-group-with-preview">
            <div className="avatar-preview-container">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Profile Preview"
                  className="avatar-preview-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"; // fallback avatar
                  }}
                />
              ) : (
                <div className="avatar-preview-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>

            <div className="profile-input-group">
              <label>Profile Image URL</label>
              <input
                type="text"
                name="profileImage"
                value={form.profileImage}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.profileImage && <span className="error-text">{errors.profileImage}</span>}
              <small className="help-text">Paste an image address from the web.</small>
            </div>
          </div>

          {/* CITY (Pre-filled, editable) */}
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Islamabad, Lahore, Karachi, Rawalpindi"
            />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          {/* VOLUNTEER SPECIFIC FIELDS */}
          {user.role === "volunteer" && (
            <>
              {/* BIO */}
              <div className="form-group">
                <label>Short Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell organizations a bit about yourself..."
                  rows="3"
                />
              </div>

              {/* SKILLS */}
              <div className="form-group">
                <label>Skills (Comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Event Management, Tutoring, Communication"
                />
                <small className="help-text">Separate skills with commas (e.g. teaching, design).</small>
              </div>
            </>
          )}

          {/* ORGANIZATION SPECIFIC FIELDS */}
          {user.role === "organization" && (
            <>
              {/* WEBSITE */}
              <div className="form-group">
                <label>Website URL</label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://www.yourorganization.pk"
                />
                {errors.website && <span className="error-text">{errors.website}</span>}
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label>Organization Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Explain your organization's mission and impact..."
                  rows="4"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;
