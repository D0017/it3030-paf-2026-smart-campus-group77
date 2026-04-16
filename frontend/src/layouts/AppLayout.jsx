import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import { logoutUser } from "../services/api";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const { unreadCount } = useUnreadNotifications();

  const navItems = [
    { path: "/resources", label: "Resources" },
    { path: "/bookings", label: "Bookings" },
    { path: "/tickets", label: "Tickets" },
    { path: "/notifications", label: "Notifications" },
  ];

  if (currentUser?.role === "ADMIN") {
    navItems.unshift({ path: "/dashboard", label: "Dashboard" });
    navItems.push({ path: "/users", label: "Users" });
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // even if backend logout fails, clear local session
    } finally {
      setCurrentUser(null);
      window.dispatchEvent(new Event("notifications-updated"));
      navigate("/login", { replace: true });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <aside
        style={{
          width: "250px",
          background: "#0f172a",
          color: "white",
          padding: "24px 16px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "24px" }}>CampusOps Hub</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isNotifications = item.path === "/notifications";

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: active ? "#334155" : "transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{item.label}</span>

                {isNotifications && unreadCount > 0 && (
                  <span
                    style={{
                      minWidth: "24px",
                      height: "24px",
                      borderRadius: "999px",
                      background: "#2563eb",
                      color: "white",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 8px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={{ flex: 1, background: "#f1f5f9" }}>
        <header
          style={{
            padding: "16px 24px",
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>Smart Campus Operations Hub</strong>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {currentUser && (
              <span
                style={{
                  background: "#e2e8f0",
                  color: "#0f172a",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontSize: "14px",
                }}
              >
                {currentUser.fullName} ({currentUser.role})
              </span>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#0f172a",
                color: "white",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;