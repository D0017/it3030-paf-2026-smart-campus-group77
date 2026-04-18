import React, { useState, useEffect } from 'react';
import AssetService from '../services/AssetService';

const AssetCatalogue = () => {
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = () => {
        AssetService.getAssets()
            .then(res => setAssets(res.data))
            .catch(err => console.error("Error fetching assets:", err));
    };

    const handleDelete = (id) => {
        AssetService.deleteAsset(id).then(() => loadAssets());
    };

    const filteredAssets = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4">Assets Catalogue</h2>
            
            <input 
                type="text" 
                placeholder="Search by name or type..." 
                className="border p-2 mb-4 w-full"
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Type</th>
                        <th className="border p-2">Capacity</th>
                        <th className="border p-2">Location</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAssets.map(asset => (
                        <tr key={asset.id}>
                            <td className="border p-2">{asset.name}</td>
                            <td className="border p-2">{asset.type}</td>
                            <td className="border p-2">{asset.capacity}</td>
                            <td className="border p-2">{asset.location}</td>
                            <td className="border p-2">{asset.status}</td>
                            <td className="border p-2">
                                <button onClick={() => handleDelete(asset.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssetCatalogue;