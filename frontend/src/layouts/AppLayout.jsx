import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/api";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

  const navItems = [
    { path: "/resources", label: "Resources" },
    { path: "/bookings", label: "Bookings" },
    { path: "/tickets", label: "Tickets" },
    { path: "/notifications", label: "Notifications" },
  ];

  if (currentUser?.role === "ADMIN") {
    navItems.unshift({ path: "/dashboard", label: "Dashboard" });
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore and still clear local session
    } finally {
      setCurrentUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <aside
        style={{
          width: "240px",
          background: "#111827",
          color: "white",
          padding: "24px 16px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "24px" }}>CampusOps Hub</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: active ? "#374151" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={{ flex: 1, background: "#f3f4f6" }}>
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
            <span>
              {currentUser ? `${currentUser.fullName} (${currentUser.role})` : "Not signed in"}
            </span>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#111827",
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