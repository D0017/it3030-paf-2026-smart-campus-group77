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
      ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-emerald-100/60"
      : "border-red-200/80 bg-red-50 text-red-700 shadow-red-100/60";

  return (
    <div
      className={`rounded-3xl border px-5 py-4 text-sm font-semibold shadow-sm ${styles}`}
    >
      {status.text}
    </div>
  );
}

function StatPill({ label, value, accent = false }) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] shadow-sm ${
        accent
          ? "bg-[#70071C] text-white shadow-[#70071C]/20"
          : "border border-white/20 bg-white/95 text-[#212325]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          accent ? "bg-white/15 text-white" : "bg-[#F4F4F4] text-[#70071C]"
        }`}
      >
        {value}
      </span>
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
      className={`group overflow-hidden rounded-4xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(33,35,37,0.10)] ${
        notification.read
          ? "border-slate-200"
          : "border-[#70071C]/20 ring-1 ring-[#70071C]/10"
      }`}
    >
      <div className="flex">
        <div
          className={`hidden w-1.5 shrink-0 sm:block ${
            notification.read ? "bg-slate-200" : "bg-[#70071C]"
          }`}
        />

        <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                  notification.read
                    ? "bg-slate-100 text-slate-500"
                    : "bg-[#70071C]/10 text-[#70071C]"
                }`}
              >
                {notification.read ? "Read" : "Unread"}
              </span>

              <span className="inline-flex rounded-full border border-slate-200 bg-[#F4F4F4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#212325]/70">
                {notification.type}
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[#212325]">
              {notification.title}
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {notification.message}
            </p>

            <div className="mt-5 inline-flex rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {new Date(notification.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isBusy}
                className={`inline-flex min-w-34 items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-sm transition ${
                  isBusy
                    ? "cursor-not-allowed bg-[#70071C]/50"
                    : "bg-[#70071C] hover:bg-[#4A0513]"
                }`}
              >
                {isBusy ? "Working..." : "Mark as read"}
              </button>
            )}

            <button
              onClick={() => onDelete(notification.id)}
              disabled={isBusy}
              className={`inline-flex min-w-28 items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition ${
                isBusy
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
              }`}
            >
              {isBusy ? "Working..." : "Delete"}
            </button>
          </div>
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
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-7">
      <section className="relative overflow-hidden rounded-[2.25rem] bg-linear-to-r from-[#212325] via-[#4A0513] to-[#70071C] px-6 py-8 text-white shadow-[0_24px_70px_rgba(33,35,37,0.20)] sm:px-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 left-1/2 h-64 w-64 rounded-full bg-[#70071C]/30 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
              Communication hub
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Notifications
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Review updates, track unread items and stay connected with campus
              operational activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill label="Unread" value={unreadCount} accent />
            <StatPill label="Total" value={notifications.length} />
            <button
              onClick={loadNotifications}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <StatusBanner status={status} />

      {currentUser?.role === "ADMIN" && (
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-linear-to-r from-[#F4F4F4] via-white to-[#70071C]/5 px-6 py-6 sm:px-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#70071C]">
              Admin tools
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#212325]">
              Broadcast notification
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Send a targeted update to all users or to a specific role group.
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="grid gap-5 p-6 sm:p-7">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_220px]">
              <input
                type="text"
                placeholder="Broadcast title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-[#F4F4F4] px-4 py-3 text-sm font-medium text-[#212325] outline-none transition placeholder:text-slate-400 focus:border-[#70071C] focus:bg-white focus:ring-4 focus:ring-[#70071C]/10"
              />

              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-[#F4F4F4] px-4 py-3 text-sm font-medium text-[#212325] outline-none transition focus:border-[#70071C] focus:bg-white focus:ring-4 focus:ring-[#70071C]/10"
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
              className="rounded-2xl border border-slate-200 bg-[#F4F4F4] px-4 py-3 text-sm font-medium leading-7 text-[#212325] outline-none transition placeholder:text-slate-400 focus:border-[#70071C] focus:bg-white focus:ring-4 focus:ring-[#70071C]/10"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={broadcastSubmitting}
                className={`inline-flex min-w-44 items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm transition ${
                  broadcastSubmitting
                    ? "cursor-not-allowed bg-[#70071C]/60"
                    : "bg-[#70071C] hover:-translate-y-0.5 hover:bg-[#4A0513] hover:shadow-[0_14px_32px_rgba(112,7,28,0.22)]"
                }`}
              >
                {broadcastSubmitting ? "Sending..." : "Send broadcast"}
              </button>
            </div>
          </form>
        </section>
      )}

      {notifications.length === 0 ? (
        <section className="rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#70071C]/8 text-3xl text-[#70071C]">
            bell
          </div>

          <p className="mt-5 text-xl font-bold text-[#212325]">
            No notifications yet
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
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