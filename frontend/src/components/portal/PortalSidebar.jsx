import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../services/api";
import campusLogo from "../../assets/logo2.png";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function ResourcesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 17A2.5 2.5 0 0 0 4 14.5V5a2 2 0 0 1 2-2h14v14" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function TicketsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" />
      <path d="M9 9h.01M15 15h.01" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3.5 3.5 0 0 1 0 6.74" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function CollapseIcon({ collapsed }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {collapsed ? (
        <path d="M9 18l6-6-6-6" />
      ) : (
        <path d="M15 18l-6-6 6-6" />
      )}
    </svg>
  );
}

function getNavIcon(label) {
  if (label === "Dashboard") return <DashboardIcon />;
  if (label === "Resources") return <ResourcesIcon />;
  if (label === "Bookings") return <BookingsIcon />;
  if (label === "Tickets") return <TicketsIcon />;
  if (label === "Notifications") return <NotificationsIcon />;
  if (label === "Users") return <UsersIcon />;
  return <DashboardIcon />;
}

function SidebarLink({ item, pathname, unreadCount, onClick, collapsed }) {
  const active = pathname === item.path;
  const isNotifications = item.path === "/notifications";

  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : ""}
      className={`group relative flex items-center ${
        collapsed ? "justify-center px-0" : "justify-between px-4"
      } rounded-2xl py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-[#70071C] text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
        <span
          className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
            active
              ? "bg-white/12 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-white"
          }`}
        >
          {getNavIcon(item.label)}

          {collapsed && isNotifications && unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#70071C] px-1 py-0.5 text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </span>

        {!collapsed && <span>{item.label}</span>}
      </div>

      {!collapsed && isNotifications && unreadCount > 0 && (
        <span
          className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-xs ${
            active ? "bg-white/20 text-white" : "bg-[#70071C] text-white"
          }`}
        >
          {unreadCount}
        </span>
      )}
    </Link>
  );
}

export default function PortalSidebar({
  navItems,
  pathname,
  mobileOpen,
  setMobileOpen,
  unreadCount,
  collapsed,
  setCollapsed,
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
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 border-r border-slate-200 bg-white transition-all duration-300 lg:translate-x-0 ${
          collapsed ? "w-24" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-4 py-5">
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-4"} min-w-0`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <img
                    src={campusLogo}
                    alt="CampusOps Hub logo"
                    className="h-10 w-10 object-contain"
                  />
                </div>

                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#70071C]">
                      CampusOps
                    </p>

                  </div>
                )}
              </Link>

              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 lg:inline-flex"
                  aria-label="Collapse sidebar"
                >
                  <CollapseIcon collapsed={false} />
                </button>
              )}
            </div>

            {collapsed && (
              <div className="mt-4 hidden justify-center lg:flex">
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                  aria-label="Expand sidebar"
                >
                  <CollapseIcon collapsed />
                </button>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-3 px-3 py-5">
            {navItems.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                pathname={pathname}
                unreadCount={unreadCount}
                onClick={() => setMobileOpen(false)}
                collapsed={collapsed}
              />
            ))}
          </nav>

          <div className="border-t border-slate-200 px-4 py-4">
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : ""}
              className={`inline-flex items-center justify-center rounded-2xl bg-[#70071C] text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A0513] ${
                collapsed ? "h-12 w-full px-0" : "w-full gap-2 px-4 py-3"
              }`}
            >
              <LogoutIcon />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}