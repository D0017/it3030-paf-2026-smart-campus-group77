import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchDashboardSummary } from "../services/dashboardApi";

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
      }}
    >
      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>{title}</p>
      <h2 style={{ margin: "10px 0 0 0" }}>{value}</h2>
    </div>
  );
}

function DashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSummary = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (error) {
      if (error.message === "FORBIDDEN") {
        setErrorMessage("You do not have admin access to view dashboard summary data.");
      } else {
        setErrorMessage("Failed to load dashboard summary.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser?.role === "ADMIN") {
      loadSummary();
    } else {
      setLoading(false);
    }
  }, [authLoading, currentUser]);

  if (authLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (!currentUser) {
    return <p>No user session found.</p>;
  }

  if (currentUser.role !== "ADMIN") {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {currentUser.fullName}.</p>

        <div
          style={{
            marginTop: "20px",
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Your Account</h3>
          <p><strong>Name:</strong> {currentUser.fullName}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Role:</strong> {currentUser.role}</p>
          <p>
            Use the sidebar to access resources, bookings, tickets, and notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            Overview of users and your notification status.
          </p>
        </div>

        <button
          onClick={loadSummary}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: "#111827",
            color: "white",
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading summary...</p>}

      {errorMessage && (
        <p style={{ color: "red", marginBottom: "16px" }}>{errorMessage}</p>
      )}

      {!loading && summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <StatCard title="Total Users" value={summary.totalUsers} />
          <StatCard title="Admins" value={summary.totalAdmins} />
          <StatCard title="Regular Users" value={summary.totalRegularUsers} />
          <StatCard title="Technicians" value={summary.totalTechnicians} />
          <StatCard title="My Notifications" value={summary.myNotifications} />
          <StatCard title="Unread Notifications" value={summary.myUnreadNotifications} />
        </div>
      )}
    </div>
  );
}

export default DashboardPage;