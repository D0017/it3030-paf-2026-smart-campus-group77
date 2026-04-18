import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchMyNotifications,
  markNotificationAsRead,
  deleteNotification,
  broadcastNotification,
} from "../services/notificationApi";

function StatusBanner({ status }) {
  if (!status.text) return null;

  const styles =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${styles}`}>
      {status.text}
    </div>
  );
}

function StatPill({ label, value, accent = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
        accent
          ? "bg-[#70071C] text-white"
          : "border border-slate-200 bg-white text-slate-700"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function NotificationCard({
  notification,
  activeActionId,
  onMarkAsRead,
  onDelete,
}) {
  const isBusy = activeActionId === notification.id;

  return (
    <div
      className={`rounded-[1.75rem] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        notification.read
          ? "border-slate-200"
          : "border-[#70071C]/20 ring-1 ring-[#70071C]/10"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                notification.read
                  ? "bg-slate-100 text-slate-600"
                  : "bg-[#70071C]/10 text-[#70071C]"
              }`}
            >
              {notification.read ? "Read" : "Unread"}
            </span>

            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              {notification.type}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-900">
            {notification.title}
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {notification.message}
          </p>

          <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              disabled={isBusy}
              className={`inline-flex min-w-37.5 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
                isBusy
                  ? "cursor-not-allowed bg-sky-400"
                  : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {isBusy ? "Working..." : "Mark as read"}
            </button>
          )}

          <button
            onClick={() => onDelete(notification.id)}
            disabled={isBusy}
            className={`inline-flex min-w-30 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
              isBusy
                ? "cursor-not-allowed bg-red-400"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isBusy ? "Working..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState({ type: "", text: "" });

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

  const [activeActionId, setActiveActionId] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const setStatusMessage = (type, text) => {
    setStatus({ type, text });
  };

  useEffect(() => {
    if (!status.text) return;

    const timer = setTimeout(() => {
      setStatus({ type: "", text: "" });
    }, 3500);

    return () => clearTimeout(timer);
  }, [status]);

  const notifyLayout = () => {
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyNotifications();
      setNotifications(data);
      notifyLayout();
    } catch {
      setStatusMessage("error", "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActiveActionId(notificationId);
      await markNotificationAsRead(notificationId);
      await loadNotifications();
      setStatusMessage("success", "Notification marked as read.");
    } catch {
      setStatusMessage("error", "Failed to mark notification as read.");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      setActiveActionId(notificationId);
      await deleteNotification(notificationId);
      await loadNotifications();
      setStatusMessage("success", "Notification deleted.");
    } catch {
      setStatusMessage("error", "Failed to delete notification.");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();

    const trimmedTitle = broadcastTitle.trim();
    const trimmedMessage = broadcastMessage.trim();

    if (trimmedTitle.length < 5) {
      setStatusMessage("error", "Broadcast title must be at least 5 characters.");
      return;
    }

    if (trimmedMessage.length < 10) {
      setStatusMessage("error", "Broadcast message must be at least 10 characters.");
      return;
    }

    try {
      setBroadcastSubmitting(true);

      await broadcastNotification({
        title: trimmedTitle,
        message: trimmedMessage,
        recipientRole: recipientRole || null,
      });

      setBroadcastTitle("");
      setBroadcastMessage("");
      setRecipientRole("");
      setStatusMessage("success", "Broadcast notification sent successfully.");
      await loadNotifications();
    } catch (error) {
      if (error.message === "FORBIDDEN") {
        setStatusMessage("error", "Only admins can broadcast notifications.");
      } else {
        setStatusMessage("error", "Failed to send broadcast notification.");
      }
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-4xl bg-linear-to-r from-[#212325] via-[#0f172a] to-[#334155] px-6 py-8 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Communication hub
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              Notifications
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Review updates, track unread items and stay connected with campus
              operational activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill label="Unread" value={unreadCount} accent />
            <StatPill label="Total" value={notifications.length} />
            <button
              onClick={loadNotifications}
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/15"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <StatusBanner status={status} />

      {currentUser?.role === "ADMIN" && (
        <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
              Admin tools
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900">
              Broadcast notification
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              Send a targeted update to all users or to a specific role group.
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="mt-6 grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_220px]">
              <input
                type="text"
                placeholder="Broadcast title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
              />

              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
              >
                <option value="">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
              </select>
            </div>

            <textarea
              placeholder="Write your broadcast message..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={5}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={broadcastSubmitting}
                className={`inline-flex min-w-45 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
                  broadcastSubmitting
                    ? "cursor-not-allowed bg-[#70071C]/60"
                    : "bg-[#70071C] hover:bg-[#4A0513]"
                }`}
              >
                {broadcastSubmitting ? "Sending..." : "Send broadcast"}
              </button>
            </div>
          </form>
        </section>
      )}

      {notifications.length === 0 ? (
        <section className="rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No notifications yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Updates will appear here when booking, ticket or admin activity affects you.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              activeActionId={activeActionId}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default NotificationsPage;