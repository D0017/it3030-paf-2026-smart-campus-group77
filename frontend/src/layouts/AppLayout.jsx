import { Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import PortalSidebar from "../components/portal/PortalSidebar";
import FloatingNotificationButton from "../components/portal/FloatingNotificationButton";

function AppLayout() {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser } = useAuth();
  const { unreadCount } = useUnreadNotifications();

  const navItems = useMemo(() => {
    const items = [
      { path: "/dashboard", label: "Dashboard" },
      
      { 
        path: currentUser?.role === "ADMIN" ? "/admin/resources" : "/resources", 
        label: "Resources" 
      },
      
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
        unreadCount={unreadCount}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className={sidebarCollapsed ? "lg:pl-24" : "lg:pl-72"}>
        <FloatingNotificationButton unreadCount={unreadCount} />

        <main className="px-4 pb-8 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;