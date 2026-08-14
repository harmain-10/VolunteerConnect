import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import EventDetails from "./pages/public/EventDetails";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import CompleteProfile from "./pages/auth/CompleteProfile";
import DashboardRedirect from "./pages/auth/DashboardRedirect";
import VolunteerDashboard from "./pages/volunteer/Dashboard";
import OrganizationDashboard from "./pages/organization/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import CreateEvent from "./pages/organization/CreateEvent";
import OrganizationEvents from "./pages/organization/OrganizationEvents";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Authenticated General Routes */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Volunteer Routes */}
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Organization Routes */}
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/events"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <OrganizationEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/events/create"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/create-event"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;