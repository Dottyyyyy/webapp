import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import Chart from "chart.js/auto";
import EditVendorModal from "./EditVendor";
import CreateVendor from "./CreateVendor";

const Vendors = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [activities, setActivities] = useState([]);
    const [showActivity, setShowActivity] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleEditClick = (vendor) => {
        setSelectedVendor(vendor);
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setSelectedVendor(null);
    };

    const vendorsPerPage = 5;
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

    const handleRestoreVendor = async (vendorId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API}/restore-user/${vendorId}`);
            fetchVendors();
        } catch (error) {
            console.error("Error restoring vendor", error);
        }
    };

    const totalPages = Math.ceil(vendors.length / vendorsPerPage);
    const startIndex = (currentPage - 1) * vendorsPerPage;
    const currentVendors = vendors.slice(startIndex, startIndex + vendorsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    useEffect(() => {
        fetchVendors();
        fetchActivities();
        const interval = setInterval(() => {
            fetchVendors();
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
                        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-bold">Vendors Management</h1>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition"
                                    >
                                        Create Vendor
                                    </button>
                                    <button
                                        onClick={() => setShowActivity(prev => !prev)}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition"
                                    >
                                        {showActivity ? "Vendor Management" : "Vendors Activity"}
                                    </button>
                                </div>
                            </div>

                            {/* Vendors List — hidden when showActivity is true */}
                            {!showActivity && (
                                <div className="bg-white rounded-xl shadow-md p-4">
                                    {vendors.length === 0 ? (
                                        <p>No vendors found.</p>
                                    ) : (
                                        <>
                                            <ul className="divide-y">
                                                {currentVendors.map(vendor => (
                                                    <li
                                                        key={vendor._id}
                                                        className={`flex items-center justify-between py-4 ${vendor.isDeleted ? 'opacity-50' : ''}`}
                                                    >
                                                        <div>
                                                            <p className="font-semibold">{vendor.name}</p>
                                                            <p className="text-sm text-gray-500">{vendor.email}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {vendor.isDeleted ? (
                                                                <button
                                                                    onClick={() => handleRestoreVendor(vendor._id)}
                                                                    className="px-4 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                                                                >
                                                                    Restore
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditClick(vendor)}
                                                                        className="px-4 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteVendor(vendor._id)}
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
                                        <h2 className="text-xl font-semibold mb-4 text-center">Waste Distribution Activity Chart</h2>
                                        <canvas ref={chartRef} className="w-full h-72" />
                                    </div>
                                </div>
                            )}
                            <EditVendorModal
                                isOpen={isEditOpen}
                                vendor={selectedVendor}
                                onClose={closeEditModal}
                                onUpdate={fetchVendors}
                            />
                            {showModal && <CreateVendor onClose={() => setShowModal(false)} />}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Vendors;