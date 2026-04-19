import axios from 'axios';

const ASSET_API_BASE_URL = "http://localhost:8081/api/assets";

class AssetService {
    getAssets() {
        return axios.get(ASSET_API_BASE_URL);
    }
    createAsset(asset) {
        return axios.post(ASSET_API_BASE_URL, asset);
    }
    updateAsset(id, asset) {
        return axios.put(`${ASSET_API_BASE_URL}/${id}`, asset);
    }
    deleteAsset(id) {
        return axios.delete(`${ASSET_API_BASE_URL}/${id}`);
    }
}

export default new AssetService();