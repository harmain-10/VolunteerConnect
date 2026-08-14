import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role === "organization") {
        navigate("/organization/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "volunteer") {
        navigate("/volunteer/dashboard");
      } else {
        navigate("/login");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  return <div style={{ padding: "50px", textAlign: "center", color: "#159e90" }}>Redirecting to your dashboard...</div>;
}

export default DashboardRedirect;
