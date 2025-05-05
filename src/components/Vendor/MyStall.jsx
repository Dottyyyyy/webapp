import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import axios from 'axios';
import { getUser } from '../../utils/helpers';
import '../../index.css'

const MyStall = () => {
    const { id } = useParams();
    const [stall, setStall] = useState(null);
    const [sacks, setStoreSacks] = useState([]);
    const user = getUser();

    const fetchStore = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/vendor/${id}`);
            console.log("Fetched Stall:", data.stall);
            setStall(data.stall);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };
    console.log(sacks, 'sack')

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-store-sacks/${user._id}`);
            console.log("Fetched sacks:", data.sacks);
            setStoreSacks(data.sacks);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    useEffect(() => {
        fetchStore();
        fetchStoreSacks();

        const interval = setInterval(() => {
            fetchStore();
            fetchStoreSacks();
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    // console.log(sacks)
    return (
        <div className="min-h-screen bg-gray-100 p-6 fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Stall</h2>

            {/* Stall Info Card */}
            {stall ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <img
                        src={stall.stallImage?.url || "https://via.placeholder.com/800x400"}
                        alt="Stall"
                        className="w-full h-64 object-cover"
                    />
                    <div className="p-6 relative">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{stall.stallName || "Fresh Foods Market"}</h3>
                        <p className="text-sm text-gray-600 mb-1"><strong>Stall #:</strong> {stall.stallNumber}</p>
                        <p className="text-sm text-gray-600 mb-1"><strong>Address:</strong> {stall.stallAddress}</p>
                        <p className="text-sm text-gray-600"><strong>Description:</strong> {stall.stallDescription}</p>

                        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${stall.status === 'Open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {stall.status}
                        </span>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600 mb-6">Loading stall details...</p>
            )}

            {/* Sack Header & Button */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Posted Waste Sacks</h3>
                <a
                    href="/vendor/create-sack"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
                >
                    + Create New Sack
                </a>
            </div>

            {/* Sacks Grid */}
            {sacks.length > 0 ? (
                <div className="flex overflow-x-auto space-x-4 pb-4 ">
                    {sacks.map((sack, index) => {
                        const isSpoiled = sack.status.toLowerCase() === 'spoiled';
                        const isClaimed = sack.status.toLowerCase() === 'claimed';
                        const isTrashed = sack.status.toLowerCase() === 'trashed';

                        const statusColor = isClaimed
                            ? 'bg-green-100 text-green-700'
                            : isTrashed
                                ? 'bg-red-100 text-red-700'
                                : isSpoiled
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-200 text-gray-800';

                        return (
                            <div key={sack._id} className="bg-white rounded-lg shadow p-4 min-w-[250px] flex-shrink-0">
                                <img
                                    src={sack.images?.[0]?.url || "https://via.placeholder.com/300x200"}
                                    alt="Sack"
                                    className="w-full h-40 object-cover rounded mb-4"
                                />
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold">Sack #{index + 1}</p>
                                    <p><strong>Weight:</strong> {sack.kilo} kg</p>
                                    <p><strong>Location:</strong> {sack.location}</p>
                                    <p><strong>Description:</strong> {sack.description}</p>
                                    <p><strong>Date:</strong> {new Date(sack.dbSpoil).toLocaleDateString()}</p>
                                </div>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                    {sack.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-600">No sacks found.</p>
            )}
        </div>
    );
};

export default MyStall;
