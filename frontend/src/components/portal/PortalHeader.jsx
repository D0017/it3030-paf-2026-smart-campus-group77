import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../services/api";
import {
  fetchMyNotifications,
  markNotificationAsRead,
} from "../../services/notificationApi";

export default function PortalHeader({ unreadCount, sidebarCollapsed }) {
  const { setCurrentUser } = useAuth();

  const [panelOpen, setPanelOpen] = useState(false);
  const [headerNotifications, setHeaderNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const panelRef = useRef(null);

  const loadHeaderNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await fetchMyNotifications();
      setHeaderNotifications(data.slice(0, 5));
    } catch {
      setHeaderNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadHeaderNotifications();
  }, []);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      loadHeaderNotifications();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setPanelOpen(false);
      }
    };

    if (panelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelOpen]);

  const handleTogglePanel = async () => {
    const nextOpen = !panelOpen;
    setPanelOpen(nextOpen);

    if (nextOpen) {
      await loadHeaderNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      const unreadItems = headerNotifications.filter((item) => !item.read);

      await Promise.all(unreadItems.map((item) => markNotificationAsRead(item.id)));

      await loadHeaderNotifications();
      window.dispatchEvent(new Event("notifications-updated"));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore and still clear local session
    } finally {
      setCurrentUser(null);
      window.dispatchEvent(new Event("notifications-updated"));
      window.location.replace("/");
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur ${
        sidebarCollapsed ? "lg:left-24" : "lg:left-72"
      }`}
    >
      <div className="mx-auto flex max-w-400 items-center justify-end gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={handleTogglePanel}
            className="group relative inline-flex h-11 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#70071C] px-2 py-1 text-xs text-white">
                {unreadCount}
              </span>
            )}

            <span
              className={`text-xs text-slate-400 transition-transform duration-200 ${
                panelOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>

          {panelOpen && (
            <div className="absolute right-0 mt-3 w-92.5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#70071C]">
                      Notification center
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">
                      Recent updates
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll || unreadCount === 0}
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      markingAll || unreadCount === 0
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-[#70071C]/10 text-[#70071C] hover:bg-[#70071C] hover:text-white"
                    }`}
                  >
                    {markingAll ? "Working..." : "Mark all read"}
                  </button>
                </div>
              </div>

              <div className="max-h-90 overflow-y-auto px-3 py-3">
                {loadingNotifications ? (
                  <div className="px-3 py-8 text-center text-sm text-slate-500">
                    Loading notifications...
                  </div>
                ) : headerNotifications.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-slate-500">
                    No notifications available.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {headerNotifications.map((item) => (
                      <Link
                        key={item.id}
                        to="/notifications"
                        onClick={() => setPanelOpen(false)}
                        className={`block rounded-2xl border px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50 ${
                          item.read
                            ? "border-slate-200 bg-white"
                            : "border-[#70071C]/15 bg-[#70071C]/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                              item.read
                                ? "bg-slate-100 text-slate-500"
                                : "bg-[#70071C] text-white"
                            }`}
                          >
                            {item.read ? "Read" : "New"}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {item.message}
                        </p>

                        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <Link
                  to="/notifications"
                  onClick={() => setPanelOpen(false)}
                  className="inline-flex text-sm font-semibold text-[#70071C] transition hover:text-[#4A0513]"
                >
                  Open full notifications page →
                </Link>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#70071C] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A0513]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}