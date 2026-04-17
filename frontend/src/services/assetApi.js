import API_BASE_URL from './api';

const ASSET_URL = `${API_BASE_URL}/assets`;

// 1. GET - සියලුම Assets ලබා ගැනීම
export async function getAllAssets() {
  const response = await fetch(ASSET_URL, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
}

// 2. POST - අලුත් Asset එකක් ඇතුළත් කිරීම
export async function createAsset(assetData) {
  const response = await fetch(ASSET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assetData),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to create asset");
  return response.json();
}

// 3. PUT - පවතින Asset එකක් Update කිරීම
export async function updateAsset(id, assetData) {
  const response = await fetch(`${ASSET_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assetData),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to update asset");
  return response.json();
}

// 4. DELETE - Asset එකක් මකා දැමීම
export async function deleteAsset(id) {
  const response = await fetch(`${ASSET_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete asset");
}