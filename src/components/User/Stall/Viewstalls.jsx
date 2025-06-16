import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/helpers";
import Sidebar from "../../Navigation/Sidebar";
import Footer from "../../Navigation/Footer";
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
        const interval = setInterval(() => {
            fetchStalls();
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    return (
        <>
            <div className="flex w-full min-h-screen text-black">
                {user && user.role === "farmer" && (
                    <>
                        <div className="flex-grow p-8" style={{
                            background: 'linear-gradient(to bottom right, #0A4724, #116937)',
                        }}>
                            <h1 className="text-3xl font-bold mb-6 text-white">Vendor Stalls</h1>
                            <p className="text-white mb-8">Browse through all available vendor stalls in the market</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stalls.map((stall) => (
                                    <div
                                        key={stall.id}
                                        className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition"
                                    >
                                        <div className="w-full h-40 bg-gray-300 rounded-md mb-4 flex items-center justify-center text-gray-500 text-xl">
                                            <img
                                                src={stall.stall.stallImage.url}
                                                alt="Stall"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>

                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-lg font-semibold">{stall.stall.vendorName}</h2>
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-full text-white uppercase ${stall.stall.status === "open" ? "bg-green-600" : "bg-red-600"
                                                    }`}
                                            >
                                                {stall.stall.status}
                                            </span>
                                        </div>


                                        <p className="text-sm text-gray-600 mb-1">📍 {stall.stall.stallAddress}</p>
                                        <p className="text-sm text-gray-600 mb-4"># {stall.stall.stallNumber}</p>

                                        <button
                                            onClick={() => handleStallClick(stall._id)}
                                            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
        </>
    );
}

export default ViewStalls;