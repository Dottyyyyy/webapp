import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import axios from 'axios';
import { getUser } from '../../utils/helpers';

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
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    // console.log(sacks)
    return (
        <>
            <Sidebar />
            <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-r from-[#1F7D53] via-[#3A7D44] to-[#4CAF50]">
                <div className="w-full max-w-6xl p-6 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-900">My Stall</h2>

                    {stall ? (
                        <div className="flex items-start space-x-4">
                            <img
                                src={stall.stallImage?.url}
                                alt="Stall"
                                className="w-40 h-32 object-cover rounded-md shadow"
                            />
                            <div className="text-sm space-y-1">
                                <p><strong>Stall No:</strong> {stall.stallNumber}</p>
                                <p><strong>Address:</strong> {stall.stallAddress}</p>
                                <p><strong>Description:</strong> {stall.stallDescription}</p>
                                <p><strong>Status:</strong> {stall.status}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">Loading stall details...</p>
                    )}
                    <div className="div">
                        <a
                            href='/vendor/create-sack'
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-300"
                        >
                            Go to Create Sack
                        </a>
                    </div>


                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sacks</h3>

                        {sacks.length > 0 ? (
                            <div className="flex overflow-x-auto space-x-4 pb-4">
                                {sacks.map((sack) => {

                                    const isSpoiled = sack.status.toLowerCase() === 'spoiled';
                                    return (
                                        <div
                                            key={sack._id}
                                            className={`min-w-[220px] max-w-[220px] p-4 rounded-md shadow flex-shrink-0 ${isSpoiled ? 'bg-red-200 border border-red-400' : 'bg-gray-100'
                                                }`}
                                        >
                                            <p className="text-sm"><strong>Kilos:</strong> {sack.kilo} kg</p>
                                            <p className="text-sm"><strong>Location:</strong> {sack.location}</p>
                                            <p className="text-sm"><strong>Description:</strong> {sack.description}</p>
                                            <p className="text-sm"><strong>Date:</strong> {new Date(sack.dbSpoil).toLocaleDateString()}</p>
                                            <p className={`font-semibold ${isSpoiled ? 'text-red-700' : 'text-gray-800'}`}>
                                                <strong>Status:</strong> {sack.status}
                                            </p>
                                            {sack.images?.length > 0 && (
                                                <img
                                                    src={sack.images[0]?.url}
                                                    alt="Sack"
                                                    className="w-full h-24 object-cover mt-2 rounded"
                                                />
                                            )}
                                        </div>
                                    )
                                }
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">No sacks found.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

};

export default MyStall;
