import React, { useState, useEffect } from 'react';
import { createAsset, updateAsset } from '../services/assetApi';

const AssetForm = ({ closeForm, refreshData, editData }) => {
    // Assignment Requirement 25 අනුව අවශ්‍ය Metadata ඇතුළත් කර ඇත
    const [formData, setFormData] = useState({
        name: '', 
        type: 'LECTURE_HALL', 
        capacity: '', 
        location: '', 
        status: 'ACTIVE'
    });

    useEffect(() => {
        if (editData) setFormData(editData);
    }, [editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // fetch function එකෙන් response එක ලැබෙන තෙක් බලා සිටී
            if (editData) {
                await updateAsset(editData.id, formData);
            } else {
                await createAsset(formData);
            }
            
            refreshData(); // දත්ත ලැයිස්තුව අලුත් කරයි
            closeForm();   // සාර්ථක වූ පසු Form එක වසයි
        } catch (error) {
            console.error("Submit error:", error);
            // Port 8081 භාවිතා කරන බවට පරිශීලකයා දැනුවත් කරයි
            alert("Error saving asset. Please ensure the backend is running on port 8081.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    {editData ? "Update Asset" : "Add New Asset"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Asset Name - Requirement 25 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Asset Type - Requirement 24 & 25 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                        <select 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="LECTURE_HALL">Lecture Hall</option>
                            <option value="LAB">Lab</option>
                            <option value="MEETING_ROOM">Meeting Room</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>

                    {/* Capacity - Requirement 25 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                        <input 
                            type="number" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.capacity} 
                            onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Location - Requirement 25 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            required 
                        />
                    </div>

                    {/* Status - Requirement 25 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.status} 
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            type="button" 
                            onClick={closeForm} 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition shadow-md"
                        >
                            {editData ? "Update Asset" : "Save Asset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetForm;