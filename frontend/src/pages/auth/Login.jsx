import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
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
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          server: data.message || "Invalid email or password",
        });
        return;
      }

      // Token save
      localStorage.setItem("token", data.token);

      // User information save if backend sends it
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

        // Role ke according dashboard
        if (data.user.role !== "admin" && (!data.user?.city || !data.user?.name)) {
          // Incomplete profile, redirect to edit profile page
          navigate("/editprofile");
        } else {
          if (data.user.role === "organization") {
            navigate("/organization/dashboard");
          } else if (data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/volunteer/dashboard");
          }
        }

    } catch (error) {
      setErrors({
        server: "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-intro">

        <div className="login-big-logo">
          V
        </div>

        <h1>
          Never miss an
          <br />
          opportunity.
        </h1>

        <p>
          Find meaningful opportunities, connect with people,
          <br />
          and create a difference in your community.
        </p>

      </div>


      {/* RIGHT CARD */}

      <div className="login-card">

        <div className="login-small-logo">
          V
        </div>

        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Log in to your VolunteerConnect account
        </p>


        {errors.server && (
          <div className="server-error">
            {errors.server}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="login-form-group">

            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            {errors.email && (
              <span>{errors.email}</span>
            )}

          </div>


          {/* PASSWORD */}

          <div className="login-form-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            {errors.password && (
              <span>{errors.password}</span>
            )}

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>


        <div className="login-footer">

          New to VolunteerConnect?

          <Link to="/signup">
            Sign Up
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;