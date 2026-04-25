import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // navigate සඳහා මෙය අනිවාර්යයි
import AssetService from '../services/AssetService';

const COLORS = {
    DARK_BG: '#212325',
    MAROON_PRIMARY: '#4A0513',
    MAROON_SECONDARY: '#70071C',
    LIGHT_BG: '#F4F4F4',
    TEXT_PRIMARY: '#212325',
    TEXT_SECONDARY: '#6B7280'
};

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;

const TABS = [
    { label: 'All', value: '' },
    { label: 'Lecture Halls', value: 'LECTURE_HALL' },
    { label: 'Labs', value: 'LAB' },
    { label: 'Meeting Rooms', value: 'MEETING_ROOM' },
    { label: 'Projectors', value: 'PROJECTOR' }, 
    { label: 'Cameras', value: 'CAMERA' },
    { label: 'ETC', value: 'ETC' }
];

const UserResourceHub = () => {
    const navigate = useNavigate(); // Navigation සඳහා
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: '', capacity: '', location: '' });
    const [selectedAsset, setSelectedAsset] = useState(null);

    useEffect(() => { loadAssets(); }, []);

    const loadAssets = () => {
        AssetService.getAssets().then(res => setAssets(res.data || [])).catch(err => console.error(err));
    };

    const filteredAssets = assets.filter(asset => {
        const matchesName = asset.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filters.type === '' || asset.type === filters.type;
        const matchesLocation = filters.location === '' || asset.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesCapacity = filters.capacity === '' || parseInt(asset.capacity) >= parseInt(filters.capacity);
        return matchesName && matchesType && matchesLocation && matchesCapacity;
    });

    const handleTabClick = (typeValue) => {
        setFilters({ ...filters, type: typeValue });
        setSelectedAsset(null);
    };

    const handleOtherFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getAssetImageUrl = (asset) => {
        if (!asset?.imageData) {
            return null;
        }
        return `data:${asset.imageContentType || 'image/jpeg'};base64,${asset.imageData}`;
    };

    const getCardImageColor = (type) => {
        switch(type) {
            case 'LECTURE_HALL': return 'bg-indigo-900 text-indigo-100';
            case 'LAB': return 'bg-emerald-900 text-emerald-100';
            case 'MEETING_ROOM': return 'bg-sky-900 text-sky-100';
            case 'PROJECTOR': return 'bg-purple-900 text-purple-100';
            case 'CAMERA': return 'bg-orange-900 text-orange-100';
            default: return 'bg-slate-800 text-slate-100';
        }
    };

    const inputStyle = "p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-maroon-primary/20 focus:border-maroon-primary outline-none transition duration-150 text-sm bg-white";

    if (selectedAsset) {
        const availability = selectedAsset.availabilityWindows || selectedAsset.availability_windows;
        const isAvailable = availability === 'AVAILABLE';
        const selectedAssetImageUrl = getAssetImageUrl(selectedAsset);

        return (
            <div className="p-8 min-h-screen bg-slate-50 text-slate-950">
                <button 
                    onClick={() => setSelectedAsset(null)}
                    className="flex items-center gap-2 mb-6 text-slate-600 hover:text-red-950 font-semibold transition-colors"
                >
                    <ArrowLeftIcon /> Back to Catalog
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
                    <div
                        className={`w-full h-64 sm:h-80 relative overflow-hidden ${selectedAssetImageUrl ? '' : getCardImageColor(selectedAsset.type)}`}
                        style={selectedAssetImageUrl ? {
                            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.55)), url(${selectedAssetImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        } : undefined}
                    >
                        {!selectedAssetImageUrl && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <InfoIcon size={48} className="opacity-50" />
                            </div>
                        )}
                        <h1 className="absolute left-6 bottom-6 text-4xl font-bold text-white tracking-wide">{selectedAsset.name}</h1>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Faculty / Location</p>
                                    <div className="flex items-center gap-2 text-lg font-medium text-slate-800">
                                        <MapPinIcon /> {selectedAsset.location || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className={`text-lg font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                            {isAvailable ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Resource Type</p>
                                    <p className="text-lg font-medium text-slate-800">{selectedAsset.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Details / Capacity</p>
                                    <p className="text-lg font-medium text-slate-800">Max Capacity: {selectedAsset.capacity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => navigate(`/book/${selectedAsset.id}`)} // මෙතනින් නව පිටුවට යනවා
                                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${isAvailable ? 'bg-[#4A0513] hover:bg-[#70071C]' : 'bg-slate-400 cursor-not-allowed'}`}
                                disabled={!isAvailable}
                            >
                                {isAvailable ? 'Book Now' : 'Currently Unavailable'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-slate-50 text-slate-950">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: COLORS.MAROON_PRIMARY }}>Resource Catalog</h1>
                </div>
                <input type="text" placeholder="Search resources..." className={`${inputStyle} w-full md:w-80 shadow-inner`} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="mb-8 border-b border-slate-200 bg-white p-2 rounded-t-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                    {TABS.map(tab => (
                        <button 
                            key={tab.label}
                            onClick={() => handleTabClick(tab.value)}
                            className={`px-5 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2
                                ${filters.type === tab.value 
                                    ? 'bg-[#4A0513] text-white shadow' 
                                    : 'text-[#4A0513] hover:bg-slate-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <input type="number" name="capacity" placeholder="Minimum Capacity..." className={`${inputStyle} w-full`} onChange={handleOtherFilterChange} />
                <input type="text" name="location" placeholder="Filter by Location..." className={`${inputStyle} w-full`} onChange={handleOtherFilterChange} />
            </div>

            {filteredAssets.length === 0 ? (
                <div className="text-center bg-white p-16 rounded-2xl shadow-sm border border-slate-100">
                    <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
                        <InfoIcon />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">No Resources Found</h2>
                    <p className="text-slate-600 mt-1">Try adjusting your filters or search term.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => {
                        const availability = asset.availabilityWindows || asset.availability_windows;
                        const isAvailable = availability === 'AVAILABLE';
                        const cardImageUrl = getAssetImageUrl(asset);

                        return (
                            <div key={asset.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col group overflow-hidden">
                                <div
                                    className={`aspect-video w-full p-6 relative ${cardImageUrl ? '' : getCardImageColor(asset.type)}`}
                                    style={cardImageUrl ? {
                                        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(${cardImageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    } : undefined}
                                >
                                    <span className="absolute top-3 left-3 bg-white/20 px-2 py-1 rounded text-xs font-bold text-white uppercase backdrop-blur-sm">
                                        {asset.type.replace('_', ' ')}
                                    </span>
                                    <h3 className="absolute left-4 bottom-4 right-4 text-xl font-bold text-white text-left line-clamp-2">{asset.name}</h3>
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <h2 className="text-lg font-bold text-slate-900 mb-3 line-clamp-1" title={asset.name}>{asset.name}</h2>
                                    
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className={`text-sm font-bold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                            {isAvailable ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>

                                    <div className="mt-auto">
                                        <button 
                                            onClick={() => setSelectedAsset(asset)}
                                            className="w-full py-2.5 bg-[#4A0513] text-white rounded-lg font-semibold text-sm hover:bg-[#70071C] transition-colors shadow-sm"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default UserResourceHub;