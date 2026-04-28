import React, { useState, useEffect } from 'react';
import AssetService from '../services/AssetService';

const COLORS = {
    DARK_BG: '#212325', MAROON_PRIMARY: '#4A0513', MAROON_SECONDARY: '#70071C', LIGHT_BG: '#F4F4F4', TEXT_PRIMARY: '#212325', TEXT_SECONDARY: '#6B7280'
};

const UserResourceHub = () => {
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: '', capacity: '', location: '' });

    const loadAssets = () => {
        AssetService.getAssets().then(res => setAssets(res.data || [])).catch(err => console.error(err));
    };

    useEffect(() => { loadAssets(); }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    
    const filteredAssets = assets.filter(asset => {
        const matchesName = asset.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filters.type === '' || asset.type === filters.type;
        const matchesLocation = filters.location === '' || asset.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesCapacity = filters.capacity === '' || parseInt(asset.capacity) >= parseInt(filters.capacity);
        return matchesName && matchesType && matchesLocation && matchesCapacity;
    });

    const inputStyle = "p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 transition duration-150 text-sm";

    return (
        <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.LIGHT_BG, color: COLORS.TEXT_PRIMARY }}>
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: COLORS.MAROON_PRIMARY }}>Resource Explorer</h1>
                <p className="text-sm mt-2" style={{ color: COLORS.TEXT_SECONDARY }}>View and filter campus resources</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 transition duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: COLORS.MAROON_SECONDARY }}></div>
                    <h2 className="text-2xl font-bold text-gray-800">Find Resources</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <input type="text" placeholder="Search by name..." className={`${inputStyle} w-full`} onChange={(e) => setSearchTerm(e.target.value)} />
                    <select name="type" className={`${inputStyle} w-full bg-white`} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value="LECTURE_HALL">LECTURE_HALL</option><option value="LAB">LAB</option><option value="MEETING_ROOM">MEETING_ROOM</option><option value="EQUIPMENT">EQUIPMENT</option>
                    </select>
                    <input type="number" name="capacity" placeholder="Min Capacity" className={`${inputStyle} w-full`} onChange={handleFilterChange} />
                    <input type="text" name="location" placeholder="Location" className={`${inputStyle} w-full`} onChange={handleFilterChange} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead style={{ backgroundColor: COLORS.DARK_BG, color: 'white' }}>
                        <tr><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Capacity</th><th className="p-4">Availability</th><th className="p-4">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAssets.length === 0 ? (
                            <tr><td colSpan="6" className="p-6 text-center text-gray-500">No resources matched your search.</td></tr>
                        ) : (
                            filteredAssets.map(asset => (
                                <tr key={asset.id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="p-4 font-bold text-gray-900">{asset.name}</td>
                                    <td className="p-4 text-gray-700">{asset.type}</td>
                                    <td className="p-4 text-gray-600">{asset.location}</td>
                                    <td className="p-4 text-gray-700">{asset.capacity}</td>
                                    <td className="p-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${asset.availability_windows === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{asset.availability_windows || 'N/A'}</span></td>
                                    <td className="p-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{asset.status}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default UserResourceHub;