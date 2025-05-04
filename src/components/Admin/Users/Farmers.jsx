import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../Navigation/Sidebar";
import Chart from "chart.js/auto";

const Farmers = () => {
    const [farmers, setFarmers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [showActivity, setShowActivity] = useState(false);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const fetchFarmers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
            const allUsers = response.data.users;
            const filteredFarmers = allUsers.filter(user => user.role === 'farmer');
            setFarmers(filteredFarmers);
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };
    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/notifications/get-notif`);
            const allNotifications = response.data.notifications;
            const filteredNotif = allNotifications.filter(notification => notification.type === 'pickup');
            setActivities(filteredNotif);
            // console.log(filteredNotif, 'Notifications')
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };
    const handleDeleteFarmer = async (farmerId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API}/delete-user/${farmerId}`);
            fetchFarmers();
        } catch (error) {
            console.error("Error deleting farmer", error);
        }
    };


    useEffect(() => {
        fetchFarmers();
        fetchActivities();
    }, []);
    useEffect(() => {
        if (!showActivity || !chartRef.current || activities.length === 0) return;

        const ctx = chartRef.current.getContext("2d");

        // Clean up existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Data aggregation
        const countsByDate = {};
        activities.forEach(activity => {
            const date = new Date(activity.createdAt).toISOString().split('T')[0];
            countsByDate[date] = (countsByDate[date] || 0) + 1;
        });

        const labels = Object.keys(countsByDate).sort();
        const data = labels.map(date => countsByDate[date]);

        // Create new chart
        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Trash Activity',
                    data,
                    borderColor: 'rgb(59, 130, 246)', // blue-500
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: 'Date' }
                    },
                    y: {
                        title: { display: true, text: 'Activity Count' },
                        beginAtZero: true
                    }
                }
            }
        });
    }, [showActivity, activities]);

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex flex-col">
                {/* Header with buttons */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Farmers Management</h1>
                    <div className="flex gap-4">
                        <a
                            href="/admin/create/farmer"
                            className="bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition"
                        >
                            Create Farmer
                        </a>
                        <button
                            onClick={() => setShowActivity(prev => !prev)}
                            className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition"
                        >
                            {showActivity ? "Farmer Management" : "Farmers Activity"}
                        </button>
                    </div>
                </div>

                {/* Farmers List — hidden when showActivity is true */}
                {!showActivity && (
                    <div className="bg-white rounded-xl shadow-md p-4">
                        {farmers.length === 0 ? (
                            <p>No farmers found.</p>
                        ) : (
                            <ul className="divide-y">
                                {farmers.map(farmer => (
                                    <li key={farmer._id} className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="font-semibold">{farmer.name}</p>
                                            <p className="text-sm text-gray-500">{farmer.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFarmer(farmer._id)}
                                            className="px-4 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Chart: Only render when toggled */}
                {showActivity && (
                    <div className="bg-white p-6 rounded-xl shadow-md w-full flex justify-center items-center">
                        <div className="w-full md:w-3/4">
                            <h2 className="text-xl font-semibold mb-4 text-center">Pickup Activity Chart</h2>
                            <canvas ref={chartRef} className="w-full h-72" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Farmers;