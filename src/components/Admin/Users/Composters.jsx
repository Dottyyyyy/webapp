import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../Navigation/Sidebar";
import Chart from "chart.js/auto";

const Composters = () => {
    const [composters, setComposters] = useState([]);
    const [activities, setActivities] = useState([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const fetchComposters = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
            const allUsers = response.data.users;
            const filteredComposters = allUsers.filter(user => user.role === 'composter');
            setComposters(filteredComposters);
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };
    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/notifications/get-notif`);
            const allNotifications = response.data.notifications;

            const filteredNotif = allNotifications
                .filter(notification => notification.type === 'trashed') // Or 'trashed' if that's what you meant
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by most recent
                .slice(0, 25); // Keep only the latest 50

            setActivities(filteredNotif);
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };
    const handleDeleteComposter = async (composterId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API}/delete-user/${composterId}`);
            fetchComposters();
        } catch (error) {
            console.error("Error deleting composter", error);
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
                    label: "Compost Frequency",
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
                            text: 'Compost Count',
                        }
                    }
                }
            }
        });
    };


    useEffect(() => {
        fetchComposters();
        fetchActivities();
    }, []);
    useEffect(() => {
        renderChart();
    }, [activities]);

    console.log(activities, "activites")

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <h1 className="text-3xl font-bold mb-6">Composters Management</h1>

                {/* Create Composter Button */}
                <div className="mb-6">
                    <a
                        href="/admin/create/composter"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        Create Composter
                    </a>
                </div>

                {/* Composter list */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">List of Composters</h2>
                    {composters.length === 0 ? (
                        <p>No Fomposters found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {composters.map(composter => (
                                <li
                                    key={composter._id}
                                    className="flex items-center justify-between border-b pb-2"
                                >
                                    <div>
                                        <p className="font-medium">{composter.name}</p>
                                        <p className="text-sm text-gray-600">{composter.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteComposter(composter._id)}
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
                    <h2 className="text-xl font-semibold mb-4 text-center">Trashed Activity Chart</h2>
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default Composters;