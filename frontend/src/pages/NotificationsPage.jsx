import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchMyNotifications,
  markNotificationAsRead,
  deleteNotification,
  broadcastNotification,
} from "../services/notificationApi";

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

  const statusColor =
    status.type === "success"
      ? "#166534"
      : status.type === "error"
      ? "#b91c1c"
      : "#1d4ed8";

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Notifications</h1>
          <p style={{ marginTop: "8px", color: "#64748b" }}>
            You have {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
          </p>
        </div>

        <button
          onClick={loadNotifications}
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

      {status.text && (
        <div
          style={{
            background: "white",
            borderLeft: `4px solid ${statusColor}`,
            padding: "14px 16px",
            borderRadius: "10px",
            color: statusColor,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          {status.text}
        </div>
      )}

      {currentUser?.role === "ADMIN" && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Broadcast Notification</h2>

          <form onSubmit={handleBroadcast} style={{ display: "grid", gap: "12px" }}>
            <input
              type="text"
              placeholder="Title"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
              }}
            />

            <textarea
              placeholder="Message"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={4}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
              }}
            />

            <select
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
              }}
            >
              <option value="">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
            </select>

            <button
              type="submit"
              disabled={broadcastSubmitting}
              style={{
                padding: "12px 14px",
                border: "none",
                borderRadius: "10px",
                cursor: broadcastSubmitting ? "not-allowed" : "pointer",
                background: "#0f172a",
                color: "white",
                opacity: broadcastSubmitting ? 0.7 : 1,
              }}
            >
              {broadcastSubmitting ? "Sending..." : "Send Broadcast"}
            </button>
          </form>
        </div>
      )}

      {notifications.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ margin: 0 }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "18px",
                border: notification.read
                  ? "1px solid #d1d5db"
                  : "2px solid #0f172a",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>{notification.title}</h3>
                  <p style={{ margin: "0 0 10px 0" }}>{notification.message}</p>
                  <small>
                    Type: {notification.type} | {notification.read ? "Read" : "Unread"}
                  </small>
                  <br />
                  <small>
                    Created: {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={activeActionId === notification.id}
                      style={{
                        padding: "10px 12px",
                        border: "none",
                        borderRadius: "10px",
                        cursor: activeActionId === notification.id ? "not-allowed" : "pointer",
                        background: "#2563eb",
                        color: "white",
                        opacity: activeActionId === notification.id ? 0.7 : 1,
                      }}
                    >
                      {activeActionId === notification.id ? "Working..." : "Mark as Read"}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notification.id)}
                    disabled={activeActionId === notification.id}
                    style={{
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: "10px",
                      cursor: activeActionId === notification.id ? "not-allowed" : "pointer",
                      background: "#dc2626",
                      color: "white",
                      opacity: activeActionId === notification.id ? 0.7 : 1,
                    }}
                  >
                    {activeActionId === notification.id ? "Working..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;