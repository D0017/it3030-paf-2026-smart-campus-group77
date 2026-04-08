import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/resources", label: "Resources" },
  { path: "/bookings", label: "Bookings" },
  { path: "/tickets", label: "Tickets" },
  { path: "/notifications", label: "Notifications" },
];

function AppLayout() {
  const location = useLocation();

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
          }}
        >
          <strong>Smart Campus Operations Hub</strong>
        </header>

        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;