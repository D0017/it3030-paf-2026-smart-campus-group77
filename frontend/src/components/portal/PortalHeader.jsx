import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../services/api";

function getPageTitle(pathname) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/resources")) return "Resources";
  if (pathname.startsWith("/bookings")) return "Bookings";
  if (pathname.startsWith("/tickets")) return "Tickets";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/users")) return "User Management";
  return "CampusOps Hub";
}

function getPageSubtitle(pathname, role) {
  if (pathname.startsWith("/dashboard")) {
    if (role === "ADMIN") return "Monitor operations, users and notifications in one place.";
    if (role === "TECHNICIAN") return "Track operational updates and act on assigned support work.";
    return "Stay updated with bookings, tickets and campus activity.";
  }

  if (pathname.startsWith("/notifications")) {
    return "Review alerts, updates and communication from the system.";
  }

  if (pathname.startsWith("/users")) {
    return "Manage role assignments for authenticated campus users.";
  }

  return "A cleaner digital layer for day-to-day university operations.";
}

export default function PortalHeader({
  pathname,
  currentUser,
  unreadCount,
  onOpenSidebar,
}) {
  const { setCurrentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // 
    } finally {
      setCurrentUser(null);
      window.dispatchEvent(new Event("notifications-updated"));
      window.location.replace("/");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:left-72">
      <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-slate-900">
              {getPageTitle(pathname)}
            </p>
            <p className="truncate text-sm text-slate-500">
              {getPageSubtitle(pathname, currentUser?.role)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[#70071C] px-2 py-1 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {currentUser?.fullName || "Campus User"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#70071C]">
              {currentUser?.role || "USER"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#70071C] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A0513]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}