import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/helpers";
import Sidebar from "../Navigation/Sidebar";
import axios from "axios";

function ViewStalls() {
    const navigate = useNavigate();
    const user = getUser();
    const [stalls, setStalls] = React.useState([]);

    const handleStallClick = (id) => {
        navigate(`/stalls/${id}`);
    };

    const fetchStalls = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/get-all-stalls`
            );
            setStalls(response.data.stalls);
        } catch (error) {
            console.error("Error fetching stalls:", error);
        }
    };

    useEffect(() => {
        fetchStalls();
    }, []);

    return (
        <div className="flex w-full h-full bg-gray-50">
            {user && user.role === "farmer" && (
                <>
                    <Sidebar />

                    <div className="flex-grow p-6">
                        <h1 className="text-4xl font-bold text-gray-800 mb-8">
                            Vendor Stalls
                        </h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {stalls.map((stall) => (
                                <div
                                    key={stall.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <img
                                        src={stall.stall.stallImage.url}
                                        alt="Stall"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <div className="text-lg font-semibold text-gray-700 mb-2">
                                            Stall #{stall.stall.stallNumber}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                            {stall.name}
                                        </h2>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {stall.stall.stallDescription}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {stall.stall.stallAddress}
                                        </p>
                                        <p
                                            className={`text-sm font-medium mb-4 ${
                                                stall.stall.status === "Open"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {stall.stall.status}
                                        </p>
                                        <button
                                            onClick={() => handleStallClick(stall._id)}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                                        >
                                            View Stall
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ViewStalls;