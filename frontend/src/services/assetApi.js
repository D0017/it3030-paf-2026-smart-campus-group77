import API_BASE_URL from "./api.js";

const ASSETS_API_URL = `${API_BASE_URL}/assets`;

async function parseError(response, fallbackMessage) {
  try {
    const errorData = await response.json();
    return errorData.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getAssets() {
  const response = await fetch(ASSETS_API_URL, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch resources"));
  }

  return response.json();
}
