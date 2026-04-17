import API_BASE_URL from './api';

const ASSET_URL = `${API_BASE_URL}/assets`;


export async function getAllAssets() {
  const response = await fetch(ASSET_URL, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
}


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

// 
export async function deleteAsset(id) {
  const response = await fetch(`${ASSET_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete asset");
}