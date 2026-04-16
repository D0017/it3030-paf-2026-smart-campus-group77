import { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../services/notificationApi";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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