import React, { useState, useEffect } from 'react';
import AssetService from '../services/AssetService';

const COLORS = {
    DARK_BG: '#212325', MAROON_PRIMARY: '#4A0513', MAROON_SECONDARY: '#70071C', LIGHT_BG: '#F4F4F4', TEXT_PRIMARY: '#212325', TEXT_SECONDARY: '#6B7280'
};

const AdminResourceHub = () => {
    const [assets, setAssets] = useState([]);
    const [newAsset, setNewAsset] = useState({ 
        name: '', type: 'LECTURE_HALL', capacity: '', location: '', status: 'ACTIVE', availabilityWindows: '' 
    });
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { loadAssets(); }, []);

    const loadAssets = () => {
        AssetService.getAssets()
            .then(res => setAssets(res.data || []))
            .catch(err => console.error("Error loading data:", err));
    };

    const handleAddChange = (e) => {
        setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        let tempErrors = {};
        if (!newAsset.name) tempErrors.name = "Required";
        
        // Capacity validation 
        if (!newAsset.capacity || isNaN(newAsset.capacity) || parseInt(newAsset.capacity) < 0) {
            tempErrors.capacity = "Positive number required";
        }
        
        if (!newAsset.availabilityWindows) tempErrors.availabilityWindows = "Required";
        if (!newAsset.location) tempErrors.location = "Required";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const startEdit = (asset) => {
        setEditingId(asset.id);
        setNewAsset({
            name: asset.name || '',
            type: asset.type || 'LECTURE_HALL',
            capacity: asset.capacity || '',
            location: asset.location || '',
            status: asset.status || 'ACTIVE',
            availabilityWindows: asset.availabilityWindows || asset.availability_windows || '' 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const saveAsset = () => {
        if (!validate()) return;
        
        const payload = { ...newAsset, capacity: parseInt(newAsset.capacity) };
        
        if (editingId) {
            AssetService.updateAsset(editingId, payload).then(() => {
                setEditingId(null);
                resetForm();
                loadAssets();
            }).catch(err => console.error("Update failed:", err));
        } else {
            AssetService.createAsset(payload).then(() => {
                resetForm();
                loadAssets();
            }).catch(err => console.error("Add failed:", err));
        }
    };

    const resetForm = () => {
        setNewAsset({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', status: 'ACTIVE', availabilityWindows: '' });
        setErrors({});
    };

    const handleDelete = (id) => {
        if(window.confirm("Are you sure?")) {
            AssetService.deleteAsset(id).then(() => loadAssets());
        }
    };

    const inputStyle = "p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 transition duration-150 text-sm";
    const errorInputStyle = "border-red-500 focus:ring-red-500 focus:border-red-500";

    return (
        <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.LIGHT_BG, color: COLORS.TEXT_PRIMARY }}>
            <div className="mb-10"><h1 className="text-4xl font-extrabold tracking-tight" style={{ color: COLORS.MAROON_PRIMARY }}>Resource Management (Admin)</h1></div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 transition duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: COLORS.MAROON_SECONDARY }}></div>
                    <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Resource" : "Add New Resource"}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-5 items-start">
                    <div className="md:col-span-2">
                        <input name="name" placeholder="Name" value={newAsset.name} onChange={handleAddChange} className={`${inputStyle} w-full ${errors.name ? errorInputStyle : ''}`} />
                    </div>
                    <select name="type" value={newAsset.type} onChange={handleAddChange} className={`${inputStyle} w-full bg-white`}>
                        <option value="LECTURE_HALL">LECTURE_HALL</option><option value="LAB">LAB</option><option value="MEETING_ROOM">MEETING_ROOM</option><option value="EQUIPMENT">EQUIPMENT</option>
                    </select>
                    {/* Capacity Input with Inline Error */}
                    <div>
                        <input type="number" name="capacity" placeholder="Capacity" value={newAsset.capacity} onChange={handleAddChange} className={`${inputStyle} w-full ${errors.capacity ? errorInputStyle : ''}`} />
                        {errors.capacity && <p className="text-red-500 text-xs mt-1 pl-1">{errors.capacity}</p>}
                    </div>
                    <input name="location" placeholder="Location" value={newAsset.location} onChange={handleAddChange} className={`${inputStyle} w-full ${errors.location ? errorInputStyle : ''}`} />
                    
                    <select name="availabilityWindows" value={newAsset.availabilityWindows} onChange={handleAddChange} className={`${inputStyle} w-full bg-white ${errors.availabilityWindows ? errorInputStyle : ''}`}>
                        <option value="">Availability</option><option value="AVAILABLE">AVAILABLE</option><option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>
                    
                    <select name="status" value={newAsset.status} onChange={handleAddChange} className={`${inputStyle} w-full bg-white`}>
                        <option value="ACTIVE">ACTIVE</option><option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                    </select>
                    <button onClick={saveAsset} className="text-white p-3 rounded-lg font-bold hover:opacity-90 shadow-md col-span-full md:col-span-1" style={{ backgroundColor: COLORS.MAROON_PRIMARY }}>
                        {editingId ? "Update" : "Add"}
                    </button>
                    {editingId && <button onClick={() => { setEditingId(null); resetForm(); }} className="col-span-full md:col-span-1 p-3 text-gray-600 underline">Cancel</button>}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead style={{ backgroundColor: COLORS.DARK_BG, color: 'white' }}>
                        <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Capacity</th><th className="p-4">Availability</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {assets.map(asset => {
                            const availability = asset.availabilityWindows || asset.availability_windows;
                            return (
                            <tr key={asset.id} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-xs text-gray-500">{asset.id}</td>
                                <td className="p-4 font-medium text-gray-900">{asset.name}</td>
                                <td className="p-4 text-gray-700">{asset.type}</td>
                                <td className="p-4 text-gray-600">{asset.location}</td>
                                <td className="p-4 text-gray-700">{asset.capacity}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${availability === 'AVAILABLE' ? 'bg-green-100 text-green-700' : (availability === 'UNAVAILABLE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}`}>
                                        {availability || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-3">
                                    <button onClick={() => startEdit(asset)} className="text-blue-600 font-semibold text-xs hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(asset.id)} className="text-red-500 font-semibold text-xs hover:underline">Delete</button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminResourceHub;