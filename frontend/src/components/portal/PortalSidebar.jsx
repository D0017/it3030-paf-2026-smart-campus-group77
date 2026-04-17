import { Link } from "react-router-dom";

function SidebarLink({ item, pathname, unreadCount, onClick }) {
  const active = pathname === item.path;
  const isNotifications = item.path === "/notifications";

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#70071C] text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span>{item.label}</span>

      {isNotifications && unreadCount > 0 && (
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
  currentUser,
  unreadCount,
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
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#70071C] text-lg font-bold text-white shadow-sm">
                C
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#70071C]">
                  CampusOps
                </p>
                <p className="text-2xl font-semibold text-slate-900">Hub</p>
              </div>
            </Link>
          </div>

          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-semibold text-slate-900">
              {currentUser?.fullName || "Campus User"}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#70071C]">
              {currentUser?.role || "USER"}
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {navItems.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                pathname={pathname}
                unreadCount={unreadCount}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          <div className="border-t border-slate-200 px-6 py-5 text-xs leading-6 text-slate-500">
            A unified university operations workspace for campus users, admins and
            technicians.
          </div>
        </div>
      </aside>
    </>
  );
}