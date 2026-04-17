import React, { useState, useEffect } from 'react';
import { getAllAssets, deleteAsset } from '../services/assetApi';
import AssetForm from '../components/AssetForm';

const AssetsCataloguePage = () => {
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            // fetch භාවිතා කරන නිසා කෙලින්ම json data එක මෙතැනට ලැබේ
            const data = await getAllAssets(); 
            setAssets(data);
        } catch (error) {
            console.error("Error loading assets:", error);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this asset?")) {
            try {
                await deleteAsset(id);
                loadData();
            } catch (error) {
                alert("Could not delete asset. Please check connection.");
            }
        }
    };

    // සෙවීමේ පහසුකම (Requirement 26 අනුව) [cite: 26]
    const filteredAssets = assets.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Assets Catalogue</h1>
                <button 
                    onClick={() => { setSelectedAsset(null); setShowForm(true); }} 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow"
                >
                    + Add Asset
                </button>
            </div>

            {/* සෙවුම් කොටුව */}
            <input 
                type="text" 
                placeholder="Search by name or location..." 
                className="w-full p-2 border mb-4 rounded focus:ring-2 focus:ring-blue-400 outline-none" 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3 font-semibold">Name</th>
                            <th className="p-3 font-semibold">Type</th>
                            <th className="p-3 font-semibold">Location</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.length > 0 ? (
                            filteredAssets.map(asset => (
                                <tr key={asset.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-3">{asset.name}</td>
                                    <td className="p-3 text-sm text-gray-600">{asset.type}</td>
                                    <td className="p-3">{asset.location}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-3">
                                        <button 
                                            onClick={() => { setSelectedAsset(asset); setShowForm(true); }} 
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(asset.id)} 
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-500">No assets found matching your search.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* මොඩල් එක විවෘත කිරීම */}
            {showForm && (
                <AssetForm 
                    closeForm={() => setShowForm(false)} 
                    refreshData={loadData} 
                    editData={selectedAsset} 
                />
            )}
        </div>
    );
};

export default AssetsCataloguePage;