import React, { useState, useEffect } from 'react';
import AssetService from '../services/AssetService';
import * as XLSX from 'xlsx'; // 1. Mea import eka add karanna

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

    // Excel Export Function eka
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(assets.map((asset, index) => ({
            "No": index + 1,
            "Resource Name": asset.name,
            "Type": asset.type,
            "Capacity": asset.capacity,
            "Location": asset.location,
            "Availability": asset.availabilityWindows || asset.availability_windows || 'N/A',
            "Status": asset.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Resources");
        XLSX.writeFile(workbook, "Resource_Data.xlsx");
    };

    const handleAddChange = (e) => {
        setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        let tempErrors = {};
        if (!newAsset.name) tempErrors.name = "Required";
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

    const inputStyle = "w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 transition-all text-sm";
    const labelStyle = "block text-sm font-semibold text-slate-700 mb-1 pl-1";
    const errorInputStyle = "border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
        <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.LIGHT_BG, color: COLORS.TEXT_PRIMARY }}>
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: COLORS.MAROON_PRIMARY }}>Resource Management (Admin)</h1>
                <button onClick={exportToExcel} className="px-6 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: COLORS.MAROON_SECONDARY }}>
                    Download Excel
                </button>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 mb-10 transition duration-300 hover:shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-slate-100 p-3 rounded-2xl text-red-950 font-bold text-xl">+</div>
                    <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Resource Information" : "Add New Resource"}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-6">
                        <div>
                            <label className={labelStyle}>Resource Name *</label>
                            <input name="name" placeholder="e.g. Lecture Hall 201" value={newAsset.name} onChange={handleAddChange} className={`${inputStyle} ${errors.name ? errorInputStyle : ''}`} />
                            {errors.name && <p className="text-red-500 text-xs mt-1 pl-1">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Type *</label>
                                <select name="type" value={newAsset.type} onChange={handleAddChange} className={`${inputStyle} bg-slate-50`}>
                                    <option value="LECTURE_HALL">Lecture Hall</option><option value="LAB">Lab</option><option value="MEETING_ROOM">Meeting Room</option><option value="EQUIPMENT">Equipment</option>
                                    <option value="PROJECTOR">Projector</option><option value="CAMERA">Camera</option><option value="ETC">ETC</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Capacity *</label>
                                <input type="number" name="capacity" placeholder="e.g. 100" value={newAsset.capacity} onChange={handleAddChange} className={`${inputStyle} ${errors.capacity ? errorInputStyle : ''}`} />
                                {errors.capacity && <p className="text-red-500 text-xs mt-1 pl-1">{errors.capacity}</p>}
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>Location *</label>
                            <input name="location" placeholder="e.g. Building A - Floor 1" value={newAsset.location} onChange={handleAddChange} className={`${inputStyle} ${errors.location ? errorInputStyle : ''}`} />
                            {errors.location && <p className="text-red-500 text-xs mt-1 pl-1">{errors.location}</p>}
                        </div>
                    </div>
                    <div className="space-y-6 flex flex-col justify-between">
                        <div>
                            <label className={labelStyle}>Availability Windows *</label>
                            <select name="availabilityWindows" value={newAsset.availabilityWindows} onChange={handleAddChange} className={`${inputStyle} ${errors.availabilityWindows ? errorInputStyle : ''} bg-slate-50`}>
                                <option value="">Select Availability</option><option value="AVAILABLE">AVAILABLE</option><option value="UNAVAILABLE">UNAVAILABLE</option>
                            </select>
                            {errors.availabilityWindows && <p className="text-red-500 text-xs mt-1 pl-1">{errors.availabilityWindows}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Operating Status *</label>
                            <select name="status" value={newAsset.status} onChange={handleAddChange} className={`${inputStyle} bg-slate-50`}>
                                <option value="ACTIVE">ACTIVE</option><option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-6">
                            <button onClick={saveAsset} className="flex-grow py-3.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg text-sm" style={{ backgroundColor: COLORS.MAROON_PRIMARY }}>
                                {editingId ? "Update Resource" : "+ Add Resource"}
                            </button>
                            {editingId && (
                                <button onClick={() => { setEditingId(null); resetForm(); }} className="px-6 py-3.5 rounded-xl font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                <table className="w-full text-left border-collapse text-sm">
                    <thead style={{ backgroundColor: COLORS.DARK_BG, color: 'white' }}>
                        <tr><th className="p-4 px-6">#</th><th className="p-4 px-6">Name</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Capacity</th><th className="p-4">Availability</th><th className="p-4">Status</th><th className="p-4 px-6 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {assets.map((asset, index) => {
                            const availability = asset.availabilityWindows || asset.availability_windows;
                            return (
                            <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 px-6 font-mono text-xs text-gray-500">{index + 1}</td>
                                <td className="p-4 px-6 font-medium text-gray-900">{asset.name}</td>
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
                                <td className="p-4 px-6 text-right flex justify-end gap-3">
                                    <button onClick={() => startEdit(asset)} className="text-indigo-600 font-semibold text-xs hover:underline transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(asset.id)} className="text-rose-600 font-semibold text-xs hover:underline transition-colors">Delete</button>
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