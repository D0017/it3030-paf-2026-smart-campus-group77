import { Link } from "react-router-dom";
import campusLogo from "../../assets/logo2.png";

function getNavShort(label) {
  if (label === "Dashboard") return "D";
  if (label === "Resources") return "R";
  if (label === "Bookings") return "B";
  if (label === "Tickets") return "T";
  if (label === "Notifications") return "N";
  if (label === "Users") return "U";
  return label.charAt(0).toUpperCase();
}

function SidebarLink({ item, pathname, unreadCount, onClick, collapsed }) {
  const active = pathname === item.path;
  const isNotifications = item.path === "/notifications";

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center ${
        collapsed ? "justify-center" : "justify-between"
      } rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#70071C] text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100"
      }`}
      title={collapsed ? item.label : ""}
    >
      <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            active
              ? "bg-white/15 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {getNavShort(item.label)}
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
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "gap-4"
                } min-w-0`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <img
                    src={campusLogo}
                    alt="CampusOps Hub logo"
                    className="h-10 w-10 object-contain"
                  />
                </div>

                {!collapsed && (
                  <div className="min-w-0 leading-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#70071C]">
                      CampusOps
                    </p>
                    <p className="mt-1 text-[2rem] font-semibold text-slate-900">
                      Hub
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
                  ←
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
                  →
                </button>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2 px-3 py-5">
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

          {!collapsed && (
            <div className="border-t border-slate-200 px-6 py-5 text-xs leading-6 text-slate-500">
              A unified university operations workspace for campus users, admins
              and technicians.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}