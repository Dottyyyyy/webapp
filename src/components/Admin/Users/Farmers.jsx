import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../Navigation/Sidebar";
import Chart from "chart.js/auto";

const Farmers = () => {
    const [farmers, setFarmers] = useState([]);
    const [activities, setActivities] = useState([]);
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

    const renderChart = () => {
        if (!activities.length) return;

        const countsByDate = {};

        activities.forEach(activity => {
            const date = new Date(activity.createdAt).toISOString().split('T')[0];
            countsByDate[date] = (countsByDate[date] || 0) + 1;
        });

        const sortedDates = Object.keys(countsByDate).sort();
        const counts = sortedDates.map(date => countsByDate[date]);

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy(); // Clean previous chart
        }

        const ctx = chartRef.current.getContext("2d");
        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: sortedDates,
                datasets: [{
                    label: "Pickup Frequency",
                    data: counts,
                    fill: false,
                    borderColor: "rgb(34, 197, 94)", // Tailwind green-500
                    backgroundColor: "rgba(34, 197, 94, 0.3)",
                    tension: 0.2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Pickup Count',
                        }
                    }
                }
            }
        });
    };


    useEffect(() => {
        fetchFarmers();
        fetchActivities();
    }, []);
    useEffect(() => {
        renderChart();
    }, [activities]);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <h1 className="text-3xl font-bold mb-6">Farmers Management</h1>

                {/* Create Farmer Button */}
                <div className="mb-6">
                    <a
                        href="/admin/create/farmer"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        Create Farmer
                    </a>
                </div>

                {/* Farmer list */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">List of Farmers</h2>
                    {farmers.length === 0 ? (
                        <p>No farmers found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {farmers.map(farmer => (
                                <li
                                    key={farmer._id}
                                    className="flex items-center justify-between border-b pb-2"
                                >
                                    <div>
                                        <p className="font-medium">{farmer.name}</p>
                                        <p className="text-sm text-gray-600">{farmer.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFarmer(farmer._id)}
                                        className="text-red-500 hover:text-red-700 font-semibold"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md mt-10 w-200 justify-center align-center">
                    <h2 className="text-xl font-semibold mb-4 text-center">Pickup Activity Chart</h2>
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default Farmers;