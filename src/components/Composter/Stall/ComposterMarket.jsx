import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/helpers";
import axios from "axios";

function ComposterMarket() {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id || 'undefined';
    const [stalls, setStalls] = React.useState([]);
    const [sacks, setSacks] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [showModal, setShowModal] = useState(false);

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

    const getSellerDetails = (sellerId) => {
        if (!sellers || sellers.length === 0) {
            return null;
        }
        return sellers.find((s) => s._id === sellerId);
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

    const sortedSacks = sacks
        .filter((sack) => !sack.isDeleted && sack.status === 'spoiled') // 👈 only posted
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const timeAgo = (date) => {
        const now = new Date();
        const inputDate = new Date(date);
        const seconds = Math.floor((now - inputDate) / 1000);
        const days = Math.floor(seconds / 86400);

        if (days >= 3) {
            return inputDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
            });
        }

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    };

    const formatSpoilDate = (date) => {
        const inputDate = new Date(date);
        return inputDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
        });
    };

    const handleAddtoSack = async (item) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/sack/add-to-sack/${userId}`, item);
            setShowModal(true);
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            Alert.alert("Cannot Proceed", error.response?.data?.message);
        }
    };

    const handleStallClick = (stallId) => {
        navigate(`/composter/market/detail/${stallId}`);
    };
    // console.log(stalls, 'stalls')
    return (
        <div className="flex w-full min-h-screen text-black">
            <div className="flex-grow p-8" style={{ background: 'linear-gradient(to bottom right, #0A4724, #116937)' }}>
                <h1 className="text-3xl font-bold mb-6 text-white">Vendor Stalls</h1>
                <p className="text-white mb-8">Browse through all available vendor stalls in the market</p>

                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
                    {/* Stalls Section (on the left, smaller space) */}
                    <div className="w-full md:w-1/3 bg-gray-200 p-4 rounded-lg sticky top-8 max-h-screen overflow-y-auto custom-scrollbar">
                        {/* This will make the stalls section scrollable while being sticky */}
                        <p className="text-black mb-8 font-bold" style={{ textAlign: 'center', fontSize: 40 }}>Market Stalls 🧺</p>
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

                    {/* Posted Sacks Section (on the right, larger space) */}
                    <div className="w-full md:flex-1 bg-gray-100 p-4 rounded-lg">
                        {sortedSacks && sortedSacks.length > 0 ? (
                            sortedSacks.map((item) => {
                                const sellerData = getSellerDetails(item.seller);
                                const stallData = sellerData?.stall || {};
                                const stallImage = stallData?.stallImage?.url;
                                const sackImage = item.images?.[0]?.url;

                                return (
                                    <div key={item._id} className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-col justify-between hover:shadow-lg transition">
                                        {/* Post Header */}
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img
                                                src={stallImage || 'default-profile.jpg'}
                                                alt="Seller Profile"
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-medium">{sellerData?.name || 'Unknown Seller'}</span>
                                                <span className="text-sm text-gray-500">{timeAgo(item.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div>
                                            <p className="text-sm text-gray-700">{item.description}</p>

                                            {/* Media Content */}
                                            {sackImage && (
                                                <img
                                                    src={sackImage}
                                                    alt="Sack Image"
                                                    className="w-full h-64 object-cover rounded-lg mt-2"
                                                />
                                            )}

                                            {/* Sack Details */}
                                            <div className="flex justify-between mt-2">
                                                <span className="font-medium">Kg: {item.kilo}</span>
                                                <span className="font-medium">Spoils on: {formatSpoilDate(item.dbSpoil)}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end items-center mt-4">
                                            {user.role !== 'admin' && (
                                                <button
                                                    className="bg-green-500 text-white py-2 px-4 rounded-lg"
                                                    onClick={() => handleAddtoSack(item)}
                                                >
                                                    Add to Sack
                                                </button>
                                            )}
                                        </div>

                                        {/* Modal */}
                                        {showModal && (
                                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                                <div className="bg-white p-6 rounded-lg">
                                                    <div className="flex justify-center items-center mb-4">
                                                        <span className="text-2xl text-green-500">✓</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-center">Now Added To Your Sack!!</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-black-500 mt-4" style={{ fontSize: 20, fontWeight: 'bold' }}>No sacks available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComposterMarket;