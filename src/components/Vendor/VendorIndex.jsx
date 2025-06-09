import React, { useEffect, useState, useRef } from 'react'
import { getUser } from '../../utils/helpers'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from "chart.js/auto";

function VendorIndex() {
    const user = getUser();
    const navigate = useNavigate();
    // console.log(user._id)
    const userId = user._id
    const [postedCounts, setPostedCount] = useState(0);
    const [pickupCount, setPickupCount] = useState(0);
    const [claimedCount, setClaimedCount] = useState(0);
    const [totalKilo, setTotalKilo] = useState(0);
    const [monthlyAverage, setMonthlyAverage] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null); // to store chart instance

    useEffect(() => {
        const fetchSackCounts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/notifications/get-pickup-request/${user._id}`);
                setPostedCount(response.data.postedSacksCount);
                setPickupCount(response.data.pickupSacksCount);
                setClaimedCount(response.data.claimedSacksCount);
                // console.log(response)
            } catch (error) {
                console.error('Error fetching sack status:', error);
            }
        };
        const fetchStoreSacks = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-store-sacks/${user._id}`);
                console.log("Fetched sacks:", data.sacks);

                const allSacks = data.sacks;

                // Calculate total kilos
                const totalKilo = allSacks.reduce((sum, sack) => {
                    return sum + parseFloat(sack.kilo || 0);
                }, 0);
                setTotalKilo(totalKilo);

                // Get current month and year
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                // Filter sacks for current month
                const currentMonthSacks = allSacks.filter((sack) => {
                    const sackDate = new Date(sack.createdAt);
                    return sackDate.getMonth() === currentMonth && sackDate.getFullYear() === currentYear;
                });

                // Calculate monthly total
                const monthlyTotal = currentMonthSacks.reduce((sum, sack) => {
                    return sum + parseFloat(sack.kilo || 0);
                }, 0);
                setMonthlyAverage(monthlyTotal);

            } catch (error) {
                console.error("Error fetching:", error);
            }
        };

        const fetchNotifications = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/notifications/users-get-notif/${userId}`);

                const newSackNotifications = data.notifications.filter(notification => notification.type === 'pickup');

                // console.log(newSackNotifications);
                setNotifications(newSackNotifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
        fetchSackCounts();
        fetchStoreSacks();
    }, [user._id]);

    useEffect(() => {
        if (!chartRef.current) return;

        // Destroy previous chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total Waste', 'Monthly Waste'],
                datasets: [
                    {
                        label: 'Kilograms',
                        data: [totalKilo, monthlyAverage],
                        backgroundColor: ['#10B981', '#34D399'],
                        borderRadius: 10,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y} kg`;
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Kilograms',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Waste Type',
                        },
                    },
                },
            },
        });

        // Clean up on unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [totalKilo, monthlyAverage]);


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                    Welcome, Market Vendor
                </h1>
                <p className="mt-2 text-gray-600 text-md max-w-2xl mx-auto">
                    Manage your waste sacks and requests efficiently and learn how your vegetable waste can bring new value!
                </p>
            </div>

            {/* Campaign Section */}
            <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto mb-10">
                <h2 className="text-xl font-semibold text-green-800 mb-3">
                    Why reuse your vegetable waste?
                </h2>
                <p className="text-gray-700">
                    Every kilo of vegetable waste you throw away can become something valuable from livestock feed to compost and organic fertilizer.
                    Start making a difference today by offering your waste to farmers and composters who need it. Together, we can create a cleaner, more
                    sustainable marketplace.
                </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 max-w-3xl mx-auto mt-10">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Waste Summary (kg)</h2>
                <canvas ref={chartRef} height="100"></canvas>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto mb-10">
                <div className="bg-white shadow rounded-xl p-6 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Total Waste</h3>
                    <p className="text-3xl font-bold text-gray-800">{totalKilo}<span className="text-lg font-medium">kg</span></p>
                </div>
                <div className="bg-white shadow rounded-xl p-6 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Monthly Waste</h3>
                    <p className="text-3xl font-bold text-gray-800"> {monthlyAverage} <span className="text-lg font-medium"> kg</span></p>
                </div>
                <div className="bg-white shadow rounded-xl p-6 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Posted Sacks</h3>
                    <p className="text-3xl font-bold text-gray-800">{postedCounts}</p>
                </div>
                <div className="bg-white shadow rounded-xl p-6 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Active Pickup <span>
                        Requests
                    </span>
                    </h3>
                    <p className="text-3xl font-bold text-gray-800"> {pickupCount} </p>
                </div>
                <div className="bg-white shadow rounded-xl p-6 text-center">
                    <h3 className="text-sm text-gray-500 mb-1">Claimed Requests</h3>
                    <p className="text-3xl font-bold text-gray-800"> {claimedCount} </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => navigate(`/vendor/pickup`)}
                    className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-medium transition">
                    Pickup Requests
                </button>
                <button className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-medium transition">
                    Collection History
                </button>
            </div>
            <br />
            <br />
            <div className="grid gap-4">
                {/* Notifications */}
                {notifications.filter((notif) => !notif.isRead).length > 0 ? (
                    notifications
                        .filter((notif) => !notif.isRead)
                        .slice(0, 5) // 👈 Limit to 5
                        .map((notif, i) => (
                            <div
                                key={notif._id || i}
                                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded"
                            >
                                <p className="text-sm font-medium">{notif.message}</p>
                            </div>
                        ))
                ) : (
                    <h1>No New Waste Sacks</h1>
                )}
            </div>
        </div>
    );
}

export default VendorIndex
