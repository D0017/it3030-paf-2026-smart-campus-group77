import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMyNotifications,
  markNotificationAsRead,
} from "../../services/notificationApi";

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export default function FloatingNotificationButton({ unreadCount }) {
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

  return (
    <div className="fixed right-4 top-4 z-30 sm:right-6 lg:right-8" ref={panelRef}>
      <button
        type="button"
        onClick={handleTogglePanel}
        className={`group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-2xl border px-2 pr-2 text-sm font-semibold shadow-[0_14px_40px_rgba(15,23,42,0.10)] backdrop-blur transition-all duration-300 ${
          panelOpen
            ? "border-[#70071C]/20 bg-white text-slate-900"
            : "border-slate-200/80 bg-white/95 text-slate-700 hover:-translate-y-0.5 hover:border-[#70071C]/15 hover:bg-white hover:shadow-[0_18px_44px_rgba(15,23,42,0.14)]"
        }`}
      >
        <span className="absolute inset-0 bg-linear-to-r from-white via-[#F4F4F4] to-white opacity-100" />
        <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="absolute inset-0 bg-linear-to-r from-[#70071C]/3 via-transparent to-[#70071C]/5" />
        </span>

        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#70071C]/8 text-[#70071C] transition duration-300 group-hover:bg-[#70071C]/12">
          <BellIcon />
          {unreadCount > 0 && (
            <>
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#70071C]/20 animate-ping" />
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#70071C]" />
            </>
          )}
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
  );
}