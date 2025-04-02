import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import { getUser } from "../../utils/helpers";

function StallDetails() {
    const { id } = useParams(); // Get the stall ID from the route
    const [stall, setStall] = useState({});
    const [sacks, setSacks] = useState([]);
    const [seller, setUser] = useState([]);
    const [mySacks, setMySacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = getUser()
    // console.log(user.role, 'User role')

    const fetchStallData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/vendor/${id}`
            );
            setStall(response.data.stall);
        } catch (error) {
            console.error("Error fetching stall data:", error);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/get-user/${id}`
            );
            setUser(response.data.user);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStallWasteData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/sack/get-store-sacks/${id}`
            );
            let filteredSacks = response.data.sacks;
            if (user.role === 'farmer') {
                // Farmers should not see "spoiled" or "completed" sacks
                filteredSacks = filteredSacks.filter(
                    sack => sack.status !== "spoiled" && sack.status !== "completed"
                );
            } else if (user.role === 'composter') {
                // Composters should only see "spoiled" sacks
                filteredSacks = filteredSacks.filter(sack => sack.status === "spoiled");
            }
            setSacks(filteredSacks);
        } catch (error) {
            console.error("Error fetching sacks data:", error);
        }
    };

    const handleAddToSack = (sack) => {
        const existingSack = mySacks.find((item) => item.id === sack.id);
        if (existingSack) {
            // If the sack already exists, increase its quantity
            setMySacks((prev) =>
                prev.map((item) =>
                    item.id === sack.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            // Add the sack to "My Sack"
            setMySacks((prev) => [
                ...prev,
                { ...sack, quantity: 1, timestamp: new Date().toISOString() },
            ]);
        }
    };

    useEffect(() => {
        fetchStallData();
        fetchUserData();
        fetchStallWasteData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold text-gray-600">Loading...</p>
            </div>
        );
    }

    // console.log(sacks)

    return (
        <div className="flex w-full h-full bg-gray-50 relative">
            <Sidebar />

            {/* Main Content */}
            <div className={`flex-grow p-6 ${isModalOpen ? "blur-sm" : ""}`}>
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Stall Details */}
                    <div className="p-6 border-b">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Stall Details
                        </h1>
                        <p className="text-lg text-gray-700 mb-2">
                            <span className="font-semibold">Description:</span> {stall.stallDescription || "N/A"}
                        </p>
                        <p className="text-lg text-gray-700 mb-2">
                            <span className="font-semibold">Stall Number:</span> {stall.stallNumber || "N/A"}
                        </p>
                        <p className="text-lg text-gray-700">
                            <span className="font-semibold">Address:</span> {stall.stallAddress || "N/A"}
                        </p>
                    </div>

                    {/* Available Sacks Section */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Available Sacks
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sacks.map((sack) => (
                                <div
                                    key={sack.id}
                                    className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center"
                                >
                                    <div>
                                        <img
                                            src={sack.images[0].url}
                                            alt="Stall"
                                            className="w-full h-48 object-cover"
                                        />
                                        <p className="text-lg font-semibold text-gray-700">
                                            {sack.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {sack.description}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Weight: {sack.weight}kg
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddToSack(sack)}
                                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                                    >
                                        Add to Sack
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StallDetails;