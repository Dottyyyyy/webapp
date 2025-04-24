import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../Navigation/Sidebar";
import Chart from "chart.js/auto";

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [activities, setActivities] = useState([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const fetchVendors = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
            const allUsers = response.data.users;
            const filteredVendors = allUsers.filter(user => user.role === 'vendor');
            setVendors(filteredVendors);
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };
    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/notifications/get-notif`);
            const allNotifications = response.data.notifications;
            const filteredNotif = allNotifications.filter(notification => notification.type === 'new_sack');
            setActivities(filteredNotif);
            // console.log(filteredNotif, 'Notifications')
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };
    const handleDeleteVendor = async (vendorId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API}/delete-user/${vendorId}`);
            fetchVendors();
        } catch (error) {
            console.error("Error deleting vendor", error);
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
                    label: "New_Sack Frequency",
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
                            text: 'New_Sack Count',
                        }
                    }
                }
            }
        });
    };


    useEffect(() => {
        fetchVendors();
        fetchActivities();
    }, []);
    useEffect(() => {
        renderChart();
    }, [activities]);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <h1 className="text-3xl font-bold mb-6">Vendors Management</h1>

                {/* Create Vendor Button */}
                <div className="mb-6">
                    <a
                        href="/admin/create/vendor"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        Create Vendor
                    </a>
                </div>

                {/* Vendor list */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">List of Vendors</h2>
                    {vendors.length === 0 ? (
                        <p>No vendors found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {vendors.map(vendor => (
                                <li
                                    key={vendor._id}
                                    className="flex items-center justify-between border-b pb-2"
                                >
                                    <div>
                                        <p className="font-medium">{vendor.name}</p>
                                        <p className="text-sm text-gray-600">{vendor.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteVendor(vendor._id)}
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
                    <h2 className="text-xl font-semibold mb-4 text-center">Waste Distribution Chart</h2>
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default Vendors;