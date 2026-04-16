import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchAllUsers, updateUserRole } from "../services/adminUserApi";

function UsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadUsers = async () => {
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
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleUpdateRole = async (userId) => {
    try {
      setStatusMessage("");
      await updateUserRole(userId, selectedRoles[userId]);
      setStatusMessage("User role updated successfully.");
      await loadUsers();
    } catch (error) {
      if (error.message === "FORBIDDEN") {
        setStatusMessage("You are not allowed to change that role.");
      } else {
        setStatusMessage("Failed to update user role.");
      }
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (currentUser?.role !== "ADMIN") {
    return (
      <div>
        <h1>User Management</h1>
        <p>You do not have admin access to manage users.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>User Management</h1>
        <button
          onClick={loadUsers}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: "#111827",
            color: "white",
          }}
        >
          Refresh
        </button>
      </div>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {statusMessage && <p style={{ color: "#2563eb" }}>{statusMessage}</p>}

      <div style={{ display: "grid", gap: "16px" }}>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>{user.fullName}</h3>
            <p style={{ margin: "0 0 8px 0" }}>{user.email}</p>
            <p style={{ margin: "0 0 12px 0" }}>
              Current Role: <strong>{user.role}</strong>
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <select
                value={selectedRoles[user.id] || user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="USER">USER</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <button
                onClick={() => handleUpdateRole(user.id)}
                style={{
                  padding: "10px 14px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "#111827",
                  color: "white",
                }}
              >
                Update Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;