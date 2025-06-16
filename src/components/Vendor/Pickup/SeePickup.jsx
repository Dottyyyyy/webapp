import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { FaCarSide } from 'react-icons/fa'; // You can import specific icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../Navigation/Sidebar';
import '../../../index.css'
import Footer from '../../Navigation/Footer';

const SeePickUp = () => {
    const location = useLocation();
    const { pickupData } = location.state || {};
    const pickup = pickupData;
    const user = getUser();
    const sellerId = user._id;
    const [buyer, setBuyer] = useState(null);
    const [status, setStatus] = useState("Pending");
    const navigation = useNavigate();
    console.log(status, 'Order Status')

    // Fetch Buyer Details
    useEffect(() => {
        const fetchBuyer = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/get-user/${pickup.user}`);
                setBuyer(response.data.user);
            } catch (error) {
                console.error("Error fetching buyer details:", error.response?.data || error.message);
            }
        };
        const fetchSackStatus = async () => {
            try {
                const sackIds = mySacks.map(sack => sack.sackId);
                const response = await axios.get(`${import.meta.env.VITE_API}/sack/see-sacks`, {
                    params: { sackIds }
                });
                console.log(response, 'DATA GET')
                const allSacksClaimed = response.data.sacks.every(sack => sack.status === "claimed");
                if (allSacksClaimed) {
                    setStatus("Claimed");
                }
            } catch (error) {
                console.error("Error fetching buyer details:", error.response?.data || error.message);
            }
        };

        if (pickup._id) {
            fetchBuyer();
            fetchSackStatus();
        }
    }, [pickup._id]);

    const mySacks = pickup.sacks?.filter(sack => sack.seller === sellerId) || [];
    const totalSellerKilo = mySacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);

    const handleCompleteSackStatus = async () => {
        try {
            const sackIds = mySacks.map(sack => sack.sackId);
            const response = await axios.put(`${import.meta.env.VITE_API}/sack/update-status`, { status: 'claimed', sackIds });

            // console.log(response.data);
            toast.success(
                <div>
                    <p>All orders are all claimed. Thankyou for your service.</p>
                </div>
            );
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (e) {
            console.error("Error updating sacks:", e);
        }
    };

    return (
        <>
            <div className="min-h-screen text-gray-800 p-6"
                style={{
                    background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 10
                }}>
                <ToastContainer />
                <div className="rounded-lg shadow-md p-6 relative"
                >
                    {/* Status Badge */}
                    <span className="absolute top-4 right-4 bg-red-200 text-red-700 text-sm px-3 py-1 rounded-full">
                        {status}
                    </span>

                    {/* Header */}
                    <h1 className="text-2xl font-bold mb-1 text-white">Pickup Request Details</h1>
                    <p className="text-sm mb-6"
                        style={{ color: 'rgb(85, 212, 140)' }}>Request #{pickup._id || 'REQ-2023-001'}</p>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Waste</p>
                            <p className="text-3xl font-bold">{totalSellerKilo} kg</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Pickup Schedule up to:</p>
                            <p className="text-lg font-semibold">
                                {new Date(pickup.pickupTimestamp).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })},{" "}
                                {new Date(pickup.pickupTimestamp).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                })}
                            </p>

                        </div>
                    </div>

                    {/* Collector Details */}
                    {buyer && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold mb-2" style={{ color: 'rgb(85, 212, 140)' }}>Collector Details</h2>
                            <img
                                src={buyer.avatar?.url || "https://via.placeholder.com/100"}
                                alt="buyer"
                                className="w-20 h-20 rounded-full mx-auto mb-2"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 bg-gray-50 p-4 rounded-lg text-sm">
                                <div><span className="font-semibold">Name:</span> {buyer.name}</div>
                                <div><span className="font-semibold">Email:</span> {buyer.email}</div>
                                <div>
                                    <span className="font-semibold">Address:</span> {buyer.address?.lotNum}, {buyer.address?.street}, {buyer.address?.baranggay}, {buyer.address?.city}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirm Button */}
                    {pickup.status !== "completed" && (
                        <div className="text-center mt-6">
                            <button
                                onClick={handleCompleteSackStatus}
                                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
                            >
                                Handed Sacks Complete
                            </button>
                        </div>
                    )}
                    {/* Sacks Details */}
                    <h2 className="text-lg font-bold mb-3" style={{ color: 'rgb(85, 212, 140)' }}>Sacks Details</h2>
                    <div className="border rounded-lg divide-y">
                        {mySacks.map((item, idx) => (
                            <div key={item._id} className="p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <img
                                        src={item.images[0]?.url || "https://via.placeholder.com/80"}
                                        alt="sack"
                                        className="w-16 h-16 object-cover rounded-lg mr-4"
                                    />
                                    <div>
                                        <p className="font-semibold text-white">Stall {item.stallNumber}</p>
                                        <p className="text-sm text-white">{item.kilo} kg</p>
                                        <p className="text-sm text-white">{item.description}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-white text-right">{item.location}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SeePickUp;