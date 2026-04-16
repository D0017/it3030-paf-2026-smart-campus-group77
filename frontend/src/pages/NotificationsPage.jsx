import { useEffect, useState } from "react";
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
  const [errorMessage, setErrorMessage] = useState("");

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchMyNotifications();
      setNotifications(data);
    } catch {
      setErrorMessage("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch {
      setErrorMessage("Failed to mark notification as read.");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
    } catch {
      setErrorMessage("Failed to delete notification.");
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();

    try {
      setBroadcastStatus("");
      await broadcastNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        recipientRole: recipientRole || null,
      });

      setBroadcastTitle("");
      setBroadcastMessage("");
      setRecipientRole("");
      setBroadcastStatus("Broadcast notification sent successfully.");
      await loadNotifications();
    } catch (error) {
      if (error.message === "FORBIDDEN") {
        setBroadcastStatus("Only admins can broadcast notifications.");
      } else {
        setBroadcastStatus("Failed to send broadcast notification.");
      }
    }
  };

  if (loading) {
    return <p>Loading notifications...</p>;
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
        <h1 style={{ margin: 0 }}>Notifications</h1>
        <button
          onClick={loadNotifications}
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

      {currentUser?.role === "ADMIN" && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Broadcast Notification</h2>

          <form onSubmit={handleBroadcast} style={{ display: "grid", gap: "12px" }}>
            <input
              type="text"
              placeholder="Title"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              required
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
            />

            <textarea
              placeholder="Message"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              required
              rows={4}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
            />

            <select
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
            >
              <option value="">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
            </select>

            <button
              type="submit"
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#111827",
                color: "white",
              }}
            >
              Send Broadcast
            </button>
          </form>

          {broadcastStatus && (
            <p style={{ marginTop: "12px", color: "#2563eb" }}>{broadcastStatus}</p>
          )}
        </div>
      )}

      {errorMessage && (
        <p style={{ color: "red", marginBottom: "16px" }}>{errorMessage}</p>
      )}

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px",
                border: notification.read
                  ? "1px solid #d1d5db"
                  : "2px solid #111827",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "start",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>{notification.title}</h3>
                  <p style={{ margin: "0 0 8px 0" }}>{notification.message}</p>
                  <small>
                    Type: {notification.type} | {notification.read ? "Read" : "Unread"}
                  </small>
                  <br />
                  <small>
                    Created: {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: "#2563eb",
                        color: "white",
                      }}
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notification.id)}
                    style={{
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: "#dc2626",
                      color: "white",
                    }}
                  >
                    Delete
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