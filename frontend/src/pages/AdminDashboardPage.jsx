import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboardSummary } from "../services/dashboardApi";

function StatCard({ title, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <h3 className="mt-3 text-4xl font-semibold text-slate-900">{value}</h3>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function QuickLink({ title, description, to }) {
  return (
    <Link
      to={to}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </Link>
  );
}

function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSummary = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch {
      setErrorMessage("Failed to load dashboard summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="grid gap-6">
      <section className="rounded-4xl bg-linear-to-r from-[#70071C] to-[#4A0513] px-8 py-10 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
          Admin workspace
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
          Oversee campus operations with clarity.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
          Review account distribution, monitor notifications and move quickly to
          user and communication tools from one central dashboard.
        </p>

        <button
          onClick={loadSummary}
          className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#70071C] transition hover:bg-slate-100"
        >
          Refresh summary
        </button>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Loading summary...
          </p>
        </div>
      ) : (
        summary && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Total Users"
                value={summary.totalUsers}
                helper="All authenticated users in the platform"
              />
              <StatCard
                title="Admins"
                value={summary.totalAdmins}
                helper="Users with administrative access"
              />
              <StatCard
                title="Regular Users"
                value={summary.totalRegularUsers}
                helper="Standard student and staff accounts"
              />
              <StatCard
                title="Technicians"
                value={summary.totalTechnicians}
                helper="Operational and support users"
              />
              <StatCard
                title="My Notifications"
                value={summary.myNotifications}
                helper="All notifications currently assigned to you"
              />
              <StatCard
                title="Unread Notifications"
                value={summary.myUnreadNotifications}
                helper="Updates that still need your attention"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <QuickLink
                title="Manage Users"
                description="Promote authenticated users to technician or admin roles."
                to="/users"
              />
              <QuickLink
                title="Review Notifications"
                description="Send announcements and manage broadcast communication."
                to="/notifications"
              />
              <QuickLink
                title="Browse Resources"
                description="Check facilities and assets available in the system."
                to="/resources"
              />
            </section>
          </>
        )
      )}
    </div>
  );
}

export default AdminDashboardPage;