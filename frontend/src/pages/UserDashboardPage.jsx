import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchMyNotifications } from "../services/notificationApi";

function QuickAction({ title, description, to }) {
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

function UserDashboardPage() {
  const { currentUser } = useAuth();
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const loadRecentNotifications = async () => {
      try {
        const data = await fetchMyNotifications();
        setRecentNotifications(data.slice(0, 3));
      } catch {
        setRecentNotifications([]);
      }
    };

    loadRecentNotifications();
  }, []);

  return (
    <div className="grid gap-6">
      <section className="rounded-4xl bg-linear-to-r from-slate-900 to-slate-700 px-8 py-10 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
          Student portal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
          Welcome back, {currentUser?.fullName}.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
          Manage resource bookings, report issues and stay in
          touch with campus updates.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Signed in as {currentUser?.role}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <QuickAction
          title="Browse Resources"
          description="See available rooms, labs and shared equipment."
          to="/resources"
        />
        <QuickAction
          title="Manage Bookings"
          description="Submit new requests and review your current bookings."
          to="/bookings"
        />
        <QuickAction
          title="Open Tickets"
          description="Report maintenance issues or operational incidents."
          to="/tickets"
        />
        <QuickAction
          title="View Notifications"
          description="Check reminders, approvals and platform updates."
          to="/notifications"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#70071C]">
            Recent updates
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Enhanced Interactivity
          </h2>

          <div className="mt-6 grid gap-4">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-slate-500">
                No recent notifications available yet.
              </p>
            ) : (
              recentNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 ${
                    item.read
                      ? "border-slate-200 bg-slate-50"
                      : "border-[#70071C]/20 bg-[#70071C]/5"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#70071C]">
            Need help?
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Report issues quickly
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            If a facility is unavailable or an incident affects your work, raise
            a ticket so the operations team can respond faster.
          </p>

          <Link
            to="/tickets"
            className="mt-6 inline-flex rounded-2xl bg-[#70071C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0513]"
          >
            Go to tickets
          </Link>
        </div>
      </section>
    </div>
  );
}

export default UserDashboardPage;