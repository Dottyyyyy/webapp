import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MarketList = () => {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API}/item/get-items`);
            setItems(res.data.items);
        } catch (error) {
            console.error("Error fetching items:", error.message);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const groupedItems = items.reduce((acc, item) => {
        const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(to bottom right, #0A4724, #116937)',
        }}>
            {/* Title */}

            <h1 className="text-2xl font-bold text-center text-white mb-4 mt-5">
                Market Price List For This Week
            </h1>
            {/* Grouped Items */}
            <div className="px-6 pb-10">
                {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="bg-gray-200 p-4 rounded-lg mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">{category}</h2>

                        {items.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <p className="text-md font-semibold text-gray-800 mb-2">{item.name}</p>
                                <div className="grid grid-cols-7 gap-2 text-center">
                                    {days.map((day, i) => {
                                        const dayKey = day.toLowerCase();
                                        const price = item.day?.[dayKey]?.[item.day[dayKey].length - 1]?.price ?? '-';
                                        const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' }).toLowerCase();
                                        return (
                                            <div key={i}>
                                                <p className="text-xs text-gray-500">{day.slice(0, 3)}</p>
                                                <p
                                                    className={`text-sm font-bold ${day.toLowerCase() === today && price !== '-' ? 'text-emerald-600' : 'text-gray-900'
                                                        }`}
                                                >
                                                    {price}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketList;