import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BookingPage = () => {
    const { id } = useParams(); // URL එකෙන් ID එක ගන්නවා
    const navigate = useNavigate();
    const [booking, setBooking] = useState({ date: '', time: '' });

    const handleConfirm = () => {
        alert("Booking Confirmed for: " + booking.date + " at " + booking.time);
        navigate('/resources');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Book Resource #{id}</h1>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Select Date</label>
                        <input 
                            type="date" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-900/20"
                            onChange={(e) => setBooking({...booking, date: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Select Time Slot</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-900/20"
                            onChange={(e) => setBooking({...booking, time: e.target.value})}
                        >
                            <option value="">Select Time Slot</option>
                            <option value="08:00 - 10:00">08:00 - 10:00</option>
                            <option value="10:00 - 12:00">10:00 - 12:00</option>
                            <option value="13:00 - 15:00">13:00 - 15:00</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleConfirm}
                        className="w-full py-4 bg-gradient-to-r from-red-950 to-red-800 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg mt-4"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;