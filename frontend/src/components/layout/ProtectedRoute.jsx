import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user = null;
  try {
    user = JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect user to their own role-appropriate dashboard if they try to access unauthorized routes
      if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user.role === "organization") {
        return <Navigate to="/organization/dashboard" replace />;
      } else if (user.role === "volunteer") {
        return <Navigate to="/volunteer/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
}

export default ProtectedRoute;
