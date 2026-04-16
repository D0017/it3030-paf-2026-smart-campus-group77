const API_BASE_URL = "http://localhost:8081/api";

export async function fetchCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  return response.json();
}

export default API_BASE_URL;