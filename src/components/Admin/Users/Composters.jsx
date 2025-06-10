import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import Chart from "chart.js/auto";
import CreateComposter from "./CreateComposter";
import EditVendorModal from "./EditVendor";

const Composters = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [composters, setComposters] = useState([]);
    const [activities, setActivities] = useState([]);
    const [showActivity, setShowActivity] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const compostersPerPage = 5;
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const handleEditClick = (farmer) => {
        setSelectedFarmer(farmer);
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setSelectedFarmer(null);
    };

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

    const handleRestoreComposter = async (composterId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API}/restore-user/${composterId}`);
            fetchComposters();
        } catch (error) {
            console.error("Error restoring composter", error);
        }
    };

    const totalPages = Math.ceil(composters.length / compostersPerPage);
    const startIndex = (currentPage - 1) * compostersPerPage;
    const currentComposters = composters.slice(startIndex, startIndex + compostersPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    useEffect(() => {
        fetchComposters();
        fetchActivities();
        const interval = setInterval(() => {
            fetchComposters();
            fetchActivities();
        }, 2000);
        return () => clearInterval(interval);
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
        <>
            <div className="flex h-screen overflow-hidden fade-in">
                {/* Sidebar */}
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Content area */}
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Header */}
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    {/* Main content with footer */}
                    <main className="grow flex flex-col justify-between min-h-screen">
                        <div className="flex flex-col">
                            {/* Header with buttons */}
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-bold">Composters Management</h1>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition"
                                    >
                                        Create Composter
                                    </button>
                                    <button
                                        onClick={() => setShowActivity(prev => !prev)}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition"
                                    >
                                        {showActivity ? "Composter Management" : "Composters Activity"}
                                    </button>
                                </div>
                            </div>

                            {/* Composters List — hidden when showActivity is true */}
                            {!showActivity && (
                                <div className="bg-white rounded-xl shadow-md p-4">
                                    {composters.length === 0 ? (
                                        <p>No composters found.</p>
                                    ) : (
                                        <>
                                            <ul className="divide-y">
                                                {currentComposters.map(composter => (
                                                    <li
                                                        key={composter._id}
                                                        className={`flex items-center justify-between py-4 ${composter.isDeleted ? 'opacity-50' : ''}`}
                                                    >
                                                        <div>
                                                            <p className="font-semibold">{composter.name}</p>
                                                            <p className="text-sm text-gray-500">{composter.email}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {composter.isDeleted ? (
                                                                <button
                                                                    onClick={() => handleRestoreComposter(composter._id)}
                                                                    className="px-4 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                                                                >
                                                                    Restore
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditClick(composter)}
                                                                        className="px-4 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteComposter(composter._id)}
                                                                        className="px-4 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Pagination controls */}
                                            <div className="flex justify-center gap-4 mt-4">
                                                <button
                                                    onClick={handlePrevPage}
                                                    disabled={currentPage === 1}
                                                    className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                >
                                                    &lt; Back
                                                </button>
                                                <span className="flex items-center">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                >
                                                    Next &gt;
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Chart: Only render when toggled */}
                            {showActivity && (
                                <div className="bg-white p-6 rounded-xl shadow-md w-full flex justify-center items-center">
                                    <div className="w-full md:w-3/4">
                                        <h2 className="text-xl font-semibold mb-4 text-center">Composter Activity Chart</h2>
                                        <canvas ref={chartRef} className="w-full h-72" />
                                    </div>
                                </div>
                            )}
                            <EditVendorModal
                                isOpen={isEditOpen}
                                vendor={selectedFarmer}
                                onClose={closeEditModal}
                                onUpdate={fetchComposters}
                            />

                            {showModal && <CreateComposter onClose={() => setShowModal(false)} />}
                        </div>
                    </main>
                </div>
            </div>
            <footer className="bg-gray-800 text-white py-10">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-semibold mb-3">Contact Us</h4>
                        <p className="text-sm">Email: info@nowaste.com</p>
                        <p className="text-sm">Phone: (123) 456-7890</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Location</h4>
                        <p className="text-sm">123 Green Street</p>
                        <p className="text-sm">Eco City, EC 12345</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">FAQs</h4>
                        <p className="text-sm">How it works</p>
                        <p className="text-sm">Terms of Service</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Social Media</h4>
                        <div className="flex gap-4 text-xl">
                            <i className="fab fa-facebook-f"></i>
                            <i className="fab fa-twitter"></i>
                            <i className="fab fa-instagram"></i>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Composters;