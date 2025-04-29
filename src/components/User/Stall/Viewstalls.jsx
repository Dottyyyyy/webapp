import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/helpers";
import Sidebar from "../../Navigation/Sidebar";
import axios from "axios";
import '../../../index.css'

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
        <div className="flex w-full fade-in h-full bg-white text-black">
            {user && user.role === "farmer" && (
                <>
                    <Sidebar user={user} />
                    <div className="flex-grow p-6">
                        <h1 className="text-4xl font-bold text-black mb-8">
                            Vendor Stalls
                        </h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stalls.map((stall) => (
                                <div
                                    key={stall.id}
                                    className="bg-green-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-400 p-4 flex flex-col items-center"
                                >
                                    <img
                                        src={stall.stall.stallImage.url}
                                        alt="Stall"
                                        className="w-full h-36 object-cover rounded-lg mb-4"
                                    />
                                    <span className="text-md font-semibold text-black">
                                        Stall #{stall.stall.stallNumber}
                                    </span>
                                    <p className="text-sm text-black text-center">
                                        {stall.stall.stallAddress}
                                    </p>
                                    <p
                                        className={`text-sm font-medium mt-2 ${
                                            stall.stall.status === "Open"
                                                ? "text-green-800"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {stall.stall.status}
                                    </p>
                                    <button
                                        onClick={() => handleStallClick(stall._id)}
                                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
                                    >
                                        View Stall
                                    </button>
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