import axios from 'axios';

const API_URL = 'http://localhost:8081/api/assets';

const getAssets = () => axios.get(API_URL);
const deleteAsset = (id) => axios.delete(`${API_URL}/${id}`);
const createAsset = (asset) => axios.post(API_URL, asset);

export default { getAssets, deleteAsset, createAsset };