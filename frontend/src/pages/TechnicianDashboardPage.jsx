import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchMyNotifications } from "../services/notificationApi";

function TechnicianDashboardPage() {
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
      <section className="rounded-4xl bg-linear-to-r from-[#212325] to-[#334155] px-8 py-10 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
          Technician workspace
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
          Operational work, organized clearly.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
          Stay updated with notifications, monitor support-related activity and
          move through incident workflows with less friction.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Signed in as {currentUser?.role}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          to="/tickets"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">Ticket Workspace</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Open tickets and continue issue-handling workflows.
          </p>
        </Link>

        <Link
          to="/notifications"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">Notifications</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Review updates that may affect operational tasks.
          </p>
        </Link>

        <Link
          to="/resources"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">Resources</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Check campus facilities and related operational context.
          </p>
        </Link>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#70071C]">
          Recent updates
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          Notifications relevant to your work
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
      </section>
    </div>
  );
}

export default TechnicianDashboardPage;