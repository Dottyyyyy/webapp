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
    const chartInstanceRef = useRef(null);

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

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
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

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [totalKilo, monthlyAverage]);


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
                            Why reuse your <br /> vegetable waste?
                        </h2>
                        <p className="text-lg text-white mb-6">
                            Manage your waste sacks and requests efficiently
                            and learn how your vegetable waste can bring new value!
                        </p>
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

            {/* Header */}
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
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 50,
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Available Sacks</h2>
                    <a href="/pickup" className="text-sm text-white hover:underline">
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
        </>
    );
}

export default VendorIndex
