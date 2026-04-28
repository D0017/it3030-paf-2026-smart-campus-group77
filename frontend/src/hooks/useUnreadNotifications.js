import { useEffect, useState } from "react";
import { fetchMyNotifications } from "../services/notificationApi";
import { useAuth } from "./useAuth";

export function useUnreadNotifications() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadUnreadCount = async () => {
      if (!isAuthenticated) {
        if (isActive) {
          setUnreadCount(0);
        }
        return;
      }

      try {
        const notifications = await fetchMyNotifications();
        const unread = notifications.filter((item) => !item.read).length;

        if (isActive) {
          setUnreadCount(unread);
        }
      } catch {
        if (isActive) {
          setUnreadCount(0);
        }
      }
    };

    loadUnreadCount();

    const handleNotificationsUpdated = async () => {
      await loadUnreadCount();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);

    return () => {
      isActive = false;
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, [isAuthenticated]);

  return { unreadCount };
}