import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import { getUser } from '../../utils/helpers';
import axios from 'axios';
import Footer from '../Navigation/Footer';
import Chart from "chart.js/auto";

function UserIndex() {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;

    const [hasAddress, setHasAddress] = useState(!!user.address);
    const [wasteCollected, setWasteCollected] = useState(0);
    const [monthlyWasteCollected, setMonthlyWasteCollected] = useState(0);
    const [activePickupRequest, setActivePickupRequest] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [chartData, setChartData] = useState({ labels: [], values: [] });
    const [topVendors, setTopVendors] = useState([]);
    const [vendorCount, setVendorCount] = useState(0);
    const [overallAverageRating, setOverallAverageRating] = useState(0);

    const fetchTopVendors = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
            const allUsers = response.data.users;

            const filteredVendors = allUsers
                .filter(user => user.role === 'vendor')
                .map(vendor => {
                    const ratings = vendor.stall?.rating || [];
                    const ratingSum = ratings.reduce((sum, r) => sum + r.value, 0);
                    const avgRating = ratings.length > 0 ? ratingSum / ratings.length : 0;
                    return { ...vendor, avgRating, ratingCount: ratings.length, ratingSum };
                });

            const sortedVendors = filteredVendors
                .sort((a, b) => b.avgRating - a.avgRating)
                .slice(0, 3);

            const totalRatings = filteredVendors.reduce((acc, vendor) => acc + vendor.ratingCount, 0);
            const totalRatingValue = filteredVendors.reduce((acc, vendor) => acc + vendor.ratingSum, 0);
            const averageOfAllRatings = totalRatings > 0 ? totalRatingValue / totalRatings : 0;

            setTopVendors(sortedVendors);
            setVendorCount(filteredVendors.length);
            setOverallAverageRating(averageOfAllRatings.toFixed(2));
        } catch (error) {
            console.error('Error in getting the users', error);
        }
    };

    useEffect(() => {
        fetchTopVendors();
        const interval = setInterval(() => {
            fetchTopVendors();
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchPickupSacks = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API}/sack/get-pickup-sacks/${userId}`);
            const pickups = res.data.pickUpSacks;

            const completedPickups = pickups.filter(p => p.status === 'completed');
            const requestedPickups = pickups.filter(p => p.status !== 'completed');

            let total = 0;
            let thisMonthTotal = 0;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const dailyData = {};

            completedPickups.forEach(pickup => {
                const pickupDate = new Date(pickup.pickupTimestamp);
                const kilo = parseFloat(pickup.totalKilo || 0);
                total += kilo;

                const isThisMonth =
                    pickupDate.getFullYear() === currentYear &&
                    pickupDate.getMonth() === currentMonth;

                if (isThisMonth) {
                    thisMonthTotal += kilo;
                    const dateKey = pickupDate.toISOString().split('T')[0];

                    if (!dailyData[dateKey]) {
                        dailyData[dateKey] = 0;
                    }
                    dailyData[dateKey] += kilo;
                }
            });

            const sortedDates = Object.keys(dailyData).sort();

            setChartData({
                labels: sortedDates,
                values: sortedDates.map(date => dailyData[date]),
            });

            setWasteCollected(total);
            setMonthlyWasteCollected(thisMonthTotal);
            setActivePickupRequest(requestedPickups.length);
        } catch (error) {
            console.error('Error getting Pickups:', error.message);
        }
    };


    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/notifications/users-get-notif/${userId}`);
            const newSackNotifications = data.notifications.filter(notification => notification.type === 'new_sack');
            setNotifications(newSackNotifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchPickupSacks();
        fetchNotifications();
    }, [userId]);

    const recentSacks = [
        { marketName: "Fresh Harvest Market", weight: 25, timeRemaining: "5 hours" },
        { marketName: "Green Garden Stall", weight: 18, timeRemaining: "3 hours" },
        { marketName: "Organic Oasis", weight: 30, timeRemaining: "1 hour" },
    ];

    useEffect(() => {
        if (!chartData.labels.length) return;

        const ctx = document.getElementById('wasteChart').getContext('2d');

        if (window.wasteChartInstance) {
            window.wasteChartInstance.destroy();
        }

        window.wasteChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Kg Collected',
                    data: chartData.values,
                    backgroundColor: 'rgba(50, 205, 50, 0.2)',
                    borderColor: '#32CD32',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const index = tooltipItems[0].dataIndex;
                                return chartData.labels[index];
                            },
                            label: (context) => `${context.raw.toFixed(2)} kg`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: () => '',
                        },
                        title: {
                            display: true,
                            text: 'Monthly Chart',
                            color: 'black',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Kilograms'
                        }
                    }
                }
            }
        });
    }, [chartData]);

    return (
        <>
            {/* Hero Section */}
            <section
                id="home"
                className="px-6"
                style={{
                    background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 10
                }}
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    {/* Left Side */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-white">
                            Welcome, {user.name}
                        </h1>
                        <div className="inline-block bg-green-900 px-4 py-2 rounded-full text-sm font-medium text-white mb-6 border border-green-300">
                            🌱 Connect with local partners and reduce waste
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
                            Bridging Waste Alternatives <br /> at Your Fingertips
                        </h2>
                        <p className="text-lg text-white mb-6">
                            Discover the best local farmers and vendors at NPTM Market. Still usable
                            vegetables, fruits, and artisanal products delivered straight from to you.
                        </p>
                        <div className="mb-6">
                            <a href='/viewstalls' className="bg-[#03431A] text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-800 transition">
                                Browse Stalls
                            </a>
                        </div>
                        <div className="flex gap-8 text-white font-medium">
                            <div>
                                <span className="text-white text-xl font-bold">{vendorCount}</span>
                                <br />
                                Local Vendors
                            </div>
                            <div>
                                <span className="text-white text-xl font-bold">500+</span>
                                <br />
                                Happy Customers
                            </div>
                            <div>
                                <span className="text-white text-xl font-bold">
                                    {overallAverageRating}★
                                </span>
                                <br />
                                Average Rating
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Image */}
                    <div className="flex-1">
                        <div className="w-full h-full rounded-xl overflow-hidden border border-green-300 shadow-lg">
                            <img
                                src="/images/taytay-market.jpg"
                                alt="Food waste management"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Dashboard */}
            <div className="min-h-screen bg-[#E9FFF3]">
                <main className="p-6 max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8">
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ marginLeft: 225 }}>
                                Collected Waste
                            </h2>
                            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ marginRight: 150 }}>
                                {user.name}'s Statistics 📶
                            </h2>
                        </div>
                        <div className="relative h-[300px] w-full" style={{ display: 'flex', flexDirection: 'row' }}>
                            {chartData.labels.length > 0 ? (
                                <canvas id="wasteChart"></canvas>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8 text-center text-gray-500">
                                    No collection data available yet.
                                </div>
                            )}
                            {/* Stats Grid */}
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-10">
                                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-40">
                                        <h3 className="text-sm text-gray-500 font-medium">Total Collected</h3>
                                        <p className="text-3xl font-bold text-green-600 mt-2">{wasteCollected} kg</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-40">
                                        <h3 className="text-sm text-gray-500 font-medium">Monthly Average</h3>
                                        <p className="text-3xl font-bold text-green-600 mt-2">{monthlyWasteCollected} kg</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-40">
                                        <h3 className="text-sm text-gray-500 font-medium">Active Requests</h3>
                                        <p className="text-3xl font-bold text-green-600 mt-2">{activePickupRequest}</p>
                                    </div>
                                </div>
                                <div className="flex justify-center ml-15">
                                    {/* Quick Actions */}
                                    <div className="mb-10">
                                        <br />
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <a
                                                href="/viewstalls"
                                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition"
                                            >
                                                View Available Sacks
                                            </a>
                                            <a
                                                href="/pickup"
                                                className="px-6 py-3 bg-white border border-green-600 text-green-600 font-semibold rounded-full shadow-md hover:bg-green-50 transition"
                                            >
                                                Pickup Request
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <div
                    style={{
                        background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 50,
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Recent Available Sacks</h2>
                        <a href="/viewstalls" className="text-sm text-white hover:underline">
                            View All
                        </a>
                    </div>
                    <div className="grid gap-4">
                        {notifications.filter((notif) => !notif.isRead).length > 0 ? (
                            notifications
                                .filter((notif) => !notif.isRead)
                                .slice(0, 5)
                                .map((notif, i) => (
                                    <div
                                        key={notif._id || i}
                                        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded"
                                    >
                                        <p className="text-sm font-medium">{notif.message}</p>
                                    </div>
                                ))
                        ) : (
                            <h1 className="text-gray-500">No New Waste Sacks</h1>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserIndex;