import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // pending | all | volunteers
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      navigate("/");
      return;
    }
    setUser(parsedUser);
    setToken(storedToken);
  }, [navigate]);

  // Fetch data when token is ready
  useEffect(() => {
    if (!token) return;
    fetchStats();
    fetchPendingOrgs();
    fetchAllOrgs();
    fetchVolunteers();
  }, [token]);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchPendingOrgs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/pendingorganizations", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setPendingOrgs(data.pendingOrgs || []);
    } catch (err) {
      console.error("Failed to fetch pending orgs:", err);
    }
  };

  const fetchAllOrgs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/organizations", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setAllOrgs(data.organizations || []);
    } catch (err) {
      console.error("Failed to fetch all orgs:", err);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/volunteers", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setVolunteers(data.volunteers || []);
    } catch (err) {
      console.error("Failed to fetch volunteers:", err);
    }
  };

  const handleApprove = async (orgId) => {
    setLoadingAction(orgId);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve/${orgId}`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${data.org.name} has been approved.`);
        fetchStats();
        fetchPendingOrgs();
        fetchAllOrgs();
      } else {
        setError(data.message || "Failed to approve organization.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoadingAction(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleReject = async (orgId) => {
    setLoadingAction(orgId);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reject/${orgId}`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${data.org.name} has been rejected.`);
        fetchStats();
        fetchPendingOrgs();
        fetchAllOrgs();
      } else {
        setError(data.message || "Failed to reject organization.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoadingAction(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-left">
            <div className="admin-avatar font-teal">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h1>Admin Control Panel</h1>
              <p className="admin-subtitle">System governance, organization approvals & volunteer tracking.</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </header>

        {/* STATS ROW */}
        <section className="admin-stats-row">
          <div className="admin-stat-card accent">
            <div className="stat-icon font-teal">⏳</div>
            <div>
              <p className="stat-label">Pending Approval</p>
              <h2 className="stat-value">{stats ? stats.pendingCount : "—"}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon font-teal">🏢</div>
            <div>
              <p className="stat-label">Total Organizations</p>
              <h2 className="stat-value">{stats ? stats.totalOrgs : "—"}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon font-teal">✅</div>
            <div>
              <p className="stat-label">Approved Orgs</p>
              <h2 className="stat-value">{stats ? stats.approvedOrgs : "—"}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon font-teal">🙋</div>
            <div>
              <p className="stat-label">Registered Volunteers</p>
              <h2 className="stat-value">{stats ? stats.totalVolunteers : volunteers.length}</h2>
            </div>
          </div>
        </section>

        {/* SUCCESS / ERROR */}
        {successMsg && <div className="admin-success-bar">{successMsg}</div>}
        {error && <div className="admin-error-bar">{error}</div>}

        {/* TAB SWITCHER */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Approvals
            {pendingOrgs.length > 0 && (
              <span className="tab-count">{pendingOrgs.length}</span>
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Organizations ({allOrgs.length})
          </button>

          <button
            className={`tab-btn ${activeTab === "volunteers" ? "active" : ""}`}
            onClick={() => setActiveTab("volunteers")}
          >
            Volunteers Tracking ({volunteers.length})
          </button>
        </div>

        {/* PENDING ORGANIZATIONS TAB */}
        {activeTab === "pending" && (
          <section className="admin-section">
            {pendingOrgs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon font-teal">✨</div>
                <h3>All caught up!</h3>
                <p>No organizations are pending approval right now.</p>
              </div>
            ) : (
              <div className="org-cards-grid">
                {pendingOrgs.map((org) => (
                  <div className="org-card" key={org._id}>
                    <div className="org-card-top">
                      <div className="org-avatar">
                        {org.profileImage ? (
                          <img src={org.profileImage} alt={org.name} />
                        ) : (
                          <span>{org.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="org-info">
                        <h4>{org.name}</h4>
                        <p className="org-email">{org.email}</p>
                        <p className="org-city">📍 {org.city}</p>
                      </div>
                      <span className="status-pill pending">PENDING</span>
                    </div>

                    {org.description && (
                      <p className="org-description">{org.description}</p>
                    )}
                    {org.website && (
                      <p className="org-website">
                        🔗 <a href={org.website} target="_blank" rel="noopener noreferrer">{org.website}</a>
                      </p>
                    )}

                    <div className="org-card-actions">
                      <button
                        className="approve-btn"
                        disabled={loadingAction === org._id}
                        onClick={() => handleApprove(org._id)}
                      >
                        {loadingAction === org._id ? "Processing..." : "✓ Approve"}
                      </button>
                      <button
                        className="reject-btn"
                        disabled={loadingAction === org._id}
                        onClick={() => handleReject(org._id)}
                      >
                        {loadingAction === org._id ? "Processing..." : "✕ Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ALL ORGANIZATIONS TAB */}
        {activeTab === "all" && (
          <section className="admin-section">
            {allOrgs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon font-teal">🏢</div>
                <h3>No organizations yet</h3>
                <p>Organizations that register will appear here.</p>
              </div>
            ) : (
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrgs.map((org) => (
                      <tr key={org._id}>
                        <td>
                          <div className="table-org-name">
                            <div className="table-avatar">
                              {org.profileImage ? (
                                <img src={org.profileImage} alt={org.name} />
                              ) : (
                                <span>{org.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            {org.name}
                          </div>
                        </td>
                        <td>{org.email}</td>
                        <td>{org.city}</td>
                        <td>
                          <span className={`status-pill ${org.status}`}>
                            {org.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                        <td>
                          {org.status === "pending" && (
                            <div className="table-actions">
                              <button
                                className="small-approve-btn"
                                disabled={loadingAction === org._id}
                                onClick={() => handleApprove(org._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="small-reject-btn"
                                disabled={loadingAction === org._id}
                                onClick={() => handleReject(org._id)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {org.status === "approved" && (
                            <span className="action-done font-teal">Active</span>
                          )}
                          {org.status === "rejected" && (
                            <span className="action-done rejected-text">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* VOLUNTEERS TRACKING TAB */}
        {activeTab === "volunteers" && (
          <section className="admin-section">
            <div className="section-note-bar">
              <p>💡 <em>Note: Individual event applications are reviewed and accepted/rejected directly by host organizations. Admin tracks overall volunteer user registrations and system participation.</em></p>
            </div>

            {volunteers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon font-teal">🙋</div>
                <h3>No volunteers registered yet</h3>
                <p>Volunteers who sign up will be listed here for system tracking.</p>
              </div>
            ) : (
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Volunteer Name</th>
                      <th>Email Address</th>
                      <th>City</th>
                      <th>Skills</th>
                      <th>Bio / Summary</th>
                      <th>Joined Date</th>
                      <th>System Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((vol) => (
                      <tr key={vol._id}>
                        <td>
                          <div className="table-org-name">
                            <div className="table-avatar font-teal">
                              {vol.profileImage ? (
                                <img src={vol.profileImage} alt={vol.name} />
                              ) : (
                                <span>{vol.name ? vol.name.charAt(0).toUpperCase() : "V"}</span>
                              )}
                            </div>
                            <strong>{vol.name}</strong>
                          </div>
                        </td>
                        <td>{vol.email}</td>
                        <td>📍 {vol.city || "Not set"}</td>
                        <td>
                          {vol.skills && vol.skills.length > 0 ? (
                            <div className="skills-tags-row">
                              {vol.skills.map((s, idx) => (
                                <span key={idx} className="mini-skill-tag">{s}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="muted-text">None listed</span>
                          )}
                        </td>
                        <td className="bio-cell">{vol.bio || "No bio provided"}</td>
                        <td>{new Date(vol.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className="status-pill approved">ACTIVE VOLUNTEER</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
