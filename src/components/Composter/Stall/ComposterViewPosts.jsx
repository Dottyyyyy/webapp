import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/helpers";
import axios from "axios";

function ComposterViewPosts() {
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
    return (
        <div className="flex w-full min-h-screen text-black">
            <div className="flex-grow p-8" style={{ background: 'linear-gradient(to bottom right, #0A4724, #116937)' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <h1 className="font-bold mb-6 text-white">Sacks Distributed By Vendors:
                    </h1>
                    {sortedSacks && sortedSacks.length === 0 && (
                        <h2 className="font-bold mb-6 text-white ml-3">No sack as of now</h2>
                    )}
                </div>
                <p className="text-white mb-8" style={{ textAlign: 'center' }}>Browse through all available vendor sacks in the market</p>

                {/* Stalls Section (on the left, smaller space) */}

                {/* Posted Sacks Section (on the right, larger space) */}
                <div className="w-full md:flex-1 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {sortedSacks && sortedSacks.length > 0 && sortedSacks.map((item) => {
                            const sellerData = getSellerDetails(item.seller);
                            const stallData = sellerData?.stall || {};
                            const stallImage = stallData?.stallImage?.url;
                            const sackImage = item.images?.[0]?.url;
                            return (
                                <div key={item._id} className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition">
                                    {/* Post Header */}
                                    <div onClick={() => handleStallClick(item.seller)} className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={stallImage || 'default-profile.jpg'}
                                                alt="Seller Profile"
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-medium">{sellerData?.name || 'Unknown Seller'}</span>
                                                <span className="text-sm text-gray-500">{stallData.storeType}</span>
                                                <span className="text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">{stallData?.stallNumber || 'Unknown Stall'}</span>
                                    </div>

                                    {/* Post Content */}
                                    <div>
                                        <p className="text-sm text-gray-700">{item.description}</p>

                                        {/* Media Content (Image or Video) */}
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

                                    {/* Action Buttons (Add to Sack) */}
                                    <div className="flex justify-between items-center mt-4" style={{ justifyContent: 'flex-end' }}>
                                        {/* Add to Sack Button (Only for non-admin users) */}
                                        {user.role !== 'admin' && (
                                            <button
                                                className="bg-green-500 text-white py-2 px-4 rounded-lg"
                                                onClick={() => handleAddtoSack(item)}
                                            >
                                                Add to Sack
                                            </button>
                                        )}
                                    </div>

                                    {/* Modal for Add to Sack (if needed) */}
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
                        })}
                    </div>
                    {sortedSacks && sortedSacks.length === 0 && (
                        <div className="flex justify-center items-center flex-col h-full">
                            <p className="text-white text-xl">No Sacks Available</p>
                            <img
                                src="/images/zero-waste-removebg-preview.png"
                                alt="No Sacks"
                                className="w-120 h-90 mb-4"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ComposterViewPosts;