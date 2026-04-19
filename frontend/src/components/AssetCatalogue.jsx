import React, { useState, useEffect } from 'react';
import AssetService from '../services/AssetService';

const AssetCatalogue = () => {
    const [assets, setAssets] = useState([]);
    const [newAsset, setNewAsset] = useState({ 
        name: '', type: 'LECTURE_HALL', capacity: '', location: '', status: 'ACTIVE', availability_windows: '' 
    });
    const [errors, setErrors] = useState({});

    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: '', capacity: '', location: '' });

    useEffect(() => { loadAssets(); }, []);

    const loadAssets = () => {
        AssetService.getAssets().then(res => setAssets(res.data || [])).catch(err => console.error(err));
    };

    const handleAddChange = (e) => {
        setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    
    // Filtering Logic
    const filteredAssets = assets.filter(asset => {
        const matchesName = asset.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filters.type === '' || asset.type === filters.type;
        const matchesLocation = filters.location === '' || asset.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesCapacity = filters.capacity === '' || parseInt(asset.capacity) >= parseInt(filters.capacity);
        return matchesName && matchesType && matchesLocation && matchesCapacity;
    });
    
    const validate = () => {
        let tempErrors = {};
        if (!newAsset.name) tempErrors.name = "Required";
        if (!newAsset.capacity || isNaN(newAsset.capacity)) tempErrors.capacity = "Number required";
        if (!newAsset.availability_windows) tempErrors.availability_windows = "Required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const addAsset = () => {
        if (!validate()) return;
        AssetService.createAsset(newAsset).then(() => {
            setNewAsset({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', status: 'ACTIVE', availability_windows: '' });
            loadAssets();
        }).catch(err => console.error("Add failed:", err));
    };

    const handleDelete = (id) => {
        if(window.confirm("Are you sure?")) AssetService.deleteAsset(id).then(() => loadAssets());
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Resource Hub</h1>
            
            {/* SEARCH AND FILTER BOX */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Filter Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Search by name..." className="p-2 border rounded" onChange={(e) => setSearchTerm(e.target.value)} />
                    <select name="type" className="p-2 border rounded" onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value="LECTURE_HALL">LECTURE_HALL</option>
                        <option value="LAB">LAB</option>
                        <option value="MEETING_ROOM">MEETING_ROOM</option>
                        <option value="EQUIPMENT">EQUIPMENT</option>
                        <option value="PROJECTOR">PROJECTOR</option>
                        <option value="CAMERA">CAMERA</option>
                        <option value="ETC">ETC</option>
                    </select>
                    <input type="number" name="capacity" placeholder="Min Capacity" className="p-2 border rounded" onChange={handleFilterChange} />
                    <input type="text" name="location" placeholder="Location" className="p-2 border rounded" onChange={handleFilterChange} />
                </div>
            </div>
            
            
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-6 gap-4">
                <input name="name" placeholder="Name" value={newAsset.name} onChange={handleAddChange} className="p-2 border rounded" />
                <select name="type" value={newAsset.type} onChange={handleAddChange} className="p-2 border rounded">
                    <option value="LECTURE_HALL">LECTURE_HALL</option>
                    <option value="LAB">LAB</option>
                    <option value="MEETING_ROOM">MEETING_ROOM</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="PROJECTOR">PROJECTOR</option>
                    <option value="CAMERA">CAMERA</option>
                    <option value="ETC">ETC</option>
                </select>
                <input type="number" name="capacity" placeholder="Capacity" value={newAsset.capacity} onChange={handleAddChange} className="p-2 border rounded" />
                <input name="location" placeholder="Location" value={newAsset.location} onChange={handleAddChange} className="p-2 border rounded" />
                <input name="availability_windows" placeholder="Availability" value={newAsset.availability_windows} onChange={handleAddChange} className="p-2 border rounded" />
                <select name="status" value={newAsset.status} onChange={handleAddChange} className="p-2 border rounded">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>
                <button onClick={addAsset} className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 col-span-full md:col-span-1">Add</button>
            </div>

        
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3">Name</th><th className="p-3">Type</th>
                            <th className="p-3">Location</th><th className="p-3">Capacity</th>
                            <th className="p-3">Availability</th><th className="p-3">Status</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map(asset => (
                            <tr key={asset.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{asset.name}</td>
                                <td className="p-3">{asset.type}</td>
                                <td className="p-3">{asset.location}</td>
                                <td className="p-3">{asset.capacity}</td>
                                <td className="p-3">{asset.availabilityWindows}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-3"><button onClick={() => handleDelete(asset.id)} className="text-red-500">Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AssetCatalogue;