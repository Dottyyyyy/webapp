import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MarketList = () => {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API}/item/get-items`);
                setItems(res.data.items);
            } catch (error) {
                console.error("Error fetching items:", error.message);
            }
        };

        fetchItems();
    }, []);

    // Today's day for highlighting
    const today = new Date().toLocaleString('en-US', {
        weekday: 'long',
        timeZone: 'Asia/Manila'
    }).toLowerCase();

    // Build columns dynamically
    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Category',
            selector: row => row.category,
            sortable: true,
            wrap: true,
        },
        ...days.map(day => ({
            name: day.slice(0, 3), // e.g., Mon, Tue
            selector: row => row[day.toLowerCase()],
            center: true,
            cell: row => {
                const price = row[day.toLowerCase()];
                const isToday = day.toLowerCase() === today;
                return (
                    <span className={`font-semibold ${isToday && price !== '-' ? 'text-green-600' : 'text-gray-800'}`}>
                        {price}
                    </span>
                );
            }
        }))
    ];

    // Transform items into flat table rows
    const tableData = items.map((item, index) => {
        const row = {
            id: item._id || index,
            name: item.name,
            category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            ...days.reduce((acc, day) => {
                const key = day.toLowerCase();
                const dayPrices = item.day?.[key];
                acc[key] = dayPrices?.[dayPrices.length - 1]?.price ?? '-';
                return acc;
            }, {})
        };

        days.forEach(day => {
            const key = day.toLowerCase();
            const dayPrices = item.day?.[key];
            row[key] = dayPrices?.[dayPrices.length - 1]?.price ?? '-';
        });

        return row;
    });

    return (
        <div className="min-h-screen p-6" style={{
            background: 'linear-gradient(to bottom right, #0A4724, #116937)',
        }}>
            <h1 className="text-2xl font-bold text-center text-white mb-6">
                Market Price List For This Week
            </h1>

            <div className="bg-white p-4 rounded-lg shadow-lg">
                <DataTable
                    columns={columns}
                    data={tableData}
                    pagination
                    highlightOnHover
                    responsive
                    dense
                    striped
                    defaultSortField="name"
                />
            </div>
        </div>
    );
};

export default MarketList;