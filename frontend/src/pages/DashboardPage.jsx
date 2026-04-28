import { useAuth } from "../hooks/useAuth";
import AdminDashboardPage from "./AdminDashboardPage";
import UserDashboardPage from "./UserDashboardPage";
import TechnicianDashboardPage from "./TechnicianDashboardPage";

function DashboardPage() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-slate-600">No active user session found.</p>
      </div>
    );
  }

  if (currentUser.role === "ADMIN") {
    return <AdminDashboardPage />;
  }

  if (currentUser.role === "TECHNICIAN") {
    return <TechnicianDashboardPage />;
  }

  return <UserDashboardPage />;
}

export default DashboardPage;