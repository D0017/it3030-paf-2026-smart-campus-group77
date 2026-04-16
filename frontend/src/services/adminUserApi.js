const API_BASE_URL = "http://localhost:8081/api";

export async function fetchAllUsers() {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    credentials: "include",
  });

  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Failed to update user role");
  }

  return response.json();
}