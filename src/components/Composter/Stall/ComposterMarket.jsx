import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/helpers";
import axios from "axios";

function ComposterMarket() {
    const navigate = useNavigate();
    const user = getUser();
    const [stalls, setStalls] = React.useState([]);

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

    const fetchData = async () => {
        try {
            const sacksRes = await axios.get(`${import.meta.env.VITE_API}/sack/get-sacks`);
            const stallsRes = await axios.get(
                `${import.meta.env.VITE_API}/get-all-stalls`
            );
            setSacks(sacksRes.data.sacks);
            setSellers(stallsRes.data.stalls);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchStalls();
        const interval = setInterval(() => {
            fetchData();
            fetchStalls();
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleStallClick = (stallId) => {
        navigate(`/composter/market/detail/${stallId}`);
    };
    // console.log(stalls, 'stalls')
    return (
        <div className="flex w-full min-h-screen text-black">
            <div className="flex-grow p-8" style={{ background: 'linear-gradient(to bottom right, #0A4724, #116937)' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <h1 className="font-bold mb-6 text-white">All Vendor Stalls:</h1>
                </div>
                <p className="text-white mb-8" style={{ textAlign: 'center' }}>Browse through all available vendor sacks in the market</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {stalls && stalls.length > 0 && stalls.map((stall) => (
                        <div
                            key={stall.id}
                            className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-col justify-between hover:shadow-lg transition"
                        >
                            <div className="w-full h-40 bg-gray-300 rounded-md mb-4 flex items-center justify-center text-gray-500 text-xl">
                                <img
                                    src={stall?.stall?.stallImage?.url}
                                    alt="Stall"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-semibold">{stall.name}</h2>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full text-white uppercase ${stall.stall.status === "open" ? "bg-green-600" : "bg-red-600"}`}
                                >
                                    {stall.stall.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">📍 {stall.stall.stallAddress}</p>
                            <p className="text-sm text-gray-600 mb-4"># {stall.stall.stallNumber}</p>
                            <button
                                onClick={() => handleStallClick(stall.stall.user)}
                                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                View Stall
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ComposterMarket;