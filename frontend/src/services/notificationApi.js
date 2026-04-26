const API_BASE_URL = "http://localhost:8081/api";

export async function fetchMyNotifications() {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

export async function markNotificationAsRead(notificationId) {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
}

export async function deleteNotification(notificationId) {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete notification");
  }
}

export async function broadcastNotification(payload) {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Failed to broadcast notification");
  }
}

export async function fetchNotificationPreferences() {
  const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notification preferences");
  }

  return response.json();
}

export async function updateNotificationPreferences(preferences) {
  const payload = {
    bookingNotificationsEnabled: preferences.bookingNotificationsEnabled,
    ticketStatusNotificationsEnabled: preferences.ticketStatusNotificationsEnabled,
    ticketCommentNotificationsEnabled: preferences.ticketCommentNotificationsEnabled,
    adminBroadcastNotificationsEnabled: preferences.adminBroadcastNotificationsEnabled,
  };

  const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update notification preferences");
  }

  return response.json();
}