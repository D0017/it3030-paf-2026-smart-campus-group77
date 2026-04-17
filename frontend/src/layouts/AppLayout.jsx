import { Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import PortalHeader from "../components/portal/PortalHeader";
import PortalSidebar from "../components/portal/PortalSidebar";

function AppLayout() {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const { unreadCount } = useUnreadNotifications();

  const navItems = useMemo(() => {
    const items = [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/resources", label: "Resources" },
      { path: "/bookings", label: "Bookings" },
      { path: "/tickets", label: "Tickets" },
      { path: "/notifications", label: "Notifications" },
    ];

    if (currentUser?.role === "ADMIN") {
      items.push({ path: "/users", label: "Users" });
    }

    return items;
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <PortalSidebar
        navItems={navItems}
        pathname={location.pathname}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        currentUser={currentUser}
        unreadCount={unreadCount}
      />

      <div className="lg:pl-72">
        <PortalHeader
          pathname={location.pathname}
          currentUser={currentUser}
          unreadCount={unreadCount}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;