import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchAllUsers, updateUserRole } from "../services/adminUserApi";

function StatusBanner({ type, text }) {
  if (!text) return null;

  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${styles}`}>
      {text}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-slate-900">
        {value}
      </h3>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles =
    role === "ADMIN"
      ? "bg-[#70071C]/10 text-[#70071C]"
      : role === "TECHNICIAN"
      ? "bg-sky-100 text-sky-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles}`}
    >
      {role}
    </span>
  );
}

function getInitials(name, email) {
  const source = name || email || "U";
  const parts = source.trim().split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function UserCard({
  user,
  selectedRole,
  onRoleChange,
  onUpdateRole,
  savingUserId,
}) {
  const isSaving = savingUserId === user.id;
  const changed = selectedRole !== user.role;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#70071C] text-sm font-semibold text-white shadow-sm">
            {getInitials(user.fullName, user.email)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-900">
                {user.fullName}
              </h3>
              <RoleBadge role={user.role} />
            </div>

            <p className="mt-2 text-sm text-slate-500">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              <span>User ID: {user.id}</span>
              <span>•</span>
              <span>{user.active ? "Active account" : "Inactive account"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedRole || user.role}
            onChange={(e) => onRoleChange(user.id, e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#70071C] focus:bg-white"
          >
            <option value="USER">USER</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button
            onClick={() => onUpdateRole(user.id)}
            disabled={!changed || isSaving}
            className={`inline-flex min-w-37.5 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
              !changed || isSaving
                ? "cursor-not-allowed bg-slate-300"
                : "bg-[#70071C] hover:bg-[#4A0513]"
            }`}
          >
            {isSaving ? "Saving..." : changed ? "Update role" : "Up to date"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [savingUserId, setSavingUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await fetchAllUsers();
      setUsers(data);

      const roleMap = {};
      data.forEach((user) => {
        roleMap[user.id] = user.role;
      });
      setSelectedRoles(roleMap);
    } catch (error) {
      if (error.message === "FORBIDDEN") {
        setErrorMessage("Only admins can manage user roles.");
      } else {
        setErrorMessage("Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser, loadUsers]);

  useEffect(() => {
    if (!statusMessage) return;

    const timer = setTimeout(() => {
      setStatusMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleUpdateRole = async (userId) => {
    try {
      setSavingUserId(userId);
      setStatusMessage("");

      await updateUserRole(userId, selectedRoles[userId]);
      setStatusType("success");
      setStatusMessage("User role updated successfully.");
      await loadUsers();
    } catch (error) {
      setStatusType("error");

      if (error.message === "FORBIDDEN") {
        setStatusMessage("You are not allowed to change that role.");
      } else {
        setStatusMessage("Failed to update user role.");
      }
    } finally {
      setSavingUserId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      technicians: users.filter((user) => user.role === "TECHNICIAN").length,
      regularUsers: users.filter((user) => user.role === "USER").length,
    };
  }, [users]);

  if (loading) {
    return (
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Loading users...
        </p>
      </div>
    );
  }

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#70071C]">
          Restricted area
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-slate-900">
          User management
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          You do not have admin access to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-4xl bg-linear-to-r from-[#212325] via-[#0f172a] to-[#334155] px-6 py-8 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Admin tools
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
              User management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Manage authenticated users and assign the right role for system access.
            </p>
          </div>

          <button
            onClick={loadUsers}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/15"
          >
            Refresh
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.total} />
        <StatCard label="Admins" value={stats.admins} />
        <StatCard label="Technicians" value={stats.technicians} />
        <StatCard label="Students" value={stats.regularUsers} />
      </div>

      {errorMessage && <StatusBanner type="error" text={errorMessage} />}
      {statusMessage && <StatusBanner type={statusType} text={statusMessage} />}

      {users.length === 0 ? (
        <section className="rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No users found</p>
          <p className="mt-2 text-sm text-slate-500">
            Authenticated users will appear here after they sign in.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              selectedRole={selectedRoles[user.id] || user.role}
              onRoleChange={handleRoleChange}
              onUpdateRole={handleUpdateRole}
              savingUserId={savingUserId}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default UsersPage;