import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchDashboardSummary } from "../services/dashboardApi";

function StatCard({ title, value, helper }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
      }}
    >
      <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{title}</p>
      <h2 style={{ margin: "10px 0 8px 0" }}>{value}</h2>
      {helper && <small style={{ color: "#64748b" }}>{helper}</small>}
    </div>
  );
}

function QuickLinkCard({ title, description, to }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "inherit",
        background: "white",
        padding: "18px",
        borderRadius: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
        display: "block",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ marginBottom: 0, color: "#64748b" }}>{description}</p>
    </Link>
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
      <div style={{ display: "grid", gap: "20px" }}>
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Welcome back, {currentUser.fullName}</h1>
          <p style={{ color: "#64748b" }}>
            You are signed in as <strong>{currentUser.role}</strong>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <QuickLinkCard
            title="Resources"
            description="Browse campus facilities and assets."
            to="/resources"
          />
          <QuickLinkCard
            title="Bookings"
            description="View or manage your bookings."
            to="/bookings"
          />
          <QuickLinkCard
            title="Tickets"
            description="Track maintenance and incident requests."
            to="/tickets"
          />
          <QuickLinkCard
            title="Notifications"
            description="Check unread updates and alerts."
            to="/notifications"
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ marginTop: "8px", color: "#64748b" }}>
            Overview of users, roles, and notification status.
          </p>
        </div>

        <button
          onClick={loadSummary}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            background: "#0f172a",
            color: "white",
          }}
        >
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div
          style={{
            background: "white",
            borderLeft: "4px solid #dc2626",
            padding: "14px 16px",
            borderRadius: "10px",
            color: "#b91c1c",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          {errorMessage}
        </div>
      )}

      {loading && <p>Loading summary...</p>}

      {!loading && summary && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <StatCard title="Total Users" value={summary.totalUsers} helper="All accounts in the system" />
            <StatCard title="Admins" value={summary.totalAdmins} helper="Accounts with admin access" />
            <StatCard title="Regular Users" value={summary.totalRegularUsers} helper="Default student/staff users" />
            <StatCard title="Technicians" value={summary.totalTechnicians} helper="Support and operations users" />
            <StatCard title="My Notifications" value={summary.myNotifications} helper="All notifications received by you" />
            <StatCard title="Unread Notifications" value={summary.myUnreadNotifications} helper="Items that still need your attention" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <QuickLinkCard
              title="Manage Users"
              description="Promote users to technician or admin roles."
              to="/users"
            />
            <QuickLinkCard
              title="Manage Notifications"
              description="Send broadcast alerts and review updates."
              to="/notifications"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;