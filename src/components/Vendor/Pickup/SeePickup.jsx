import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { FaCarSide } from 'react-icons/fa'; // You can import specific icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../Navigation/Sidebar';
import '../../../index.css'

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
            toast.success("Complete Process!! Job Well Done");
            navigation(-1)
        } catch (e) {
            console.error("Error updating sacks:", e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 fade-in">
            <Sidebar />
            <h1 className="text-2xl font-bold text-center mb-6">See Pick Up</h1>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                    {status !== "Claimed" && (
                        <button
                            onClick={handleCompleteSackStatus}
                            className="bg-green-600 text-white px-4 py-2 rounded-full"
                        >
                            Confirm
                        </button>
                    )}
                </div>

                <div className="bg-green-900 p-5 rounded-lg text-center">
                    <p className="text-xl font-bold">{totalSellerKilo} KG</p>
                    <p>Status: <span className="text-green-300">{status}</span></p>
                    {status !== "Claimed" && (
                        <p className="mt-2 text-sm">
                            Pickup Time:{" "}
                            {new Date(new Date(pickup.pickupTimestamp).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            {new Date(pickup.pickupTimestamp).toLocaleTimeString("en-US", {
                                timeZone: "UTC",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    )}
                </div>
            </div>

            {buyer && (
                <div className="bg-gray-700 p-4 rounded-lg text-center mb-6">
                    <h2 className="text-lg font-bold mb-3">Collector Details</h2>
                    <img
                        src={buyer.avatar?.url || "https://via.placeholder.com/100"}
                        alt="buyer"
                        className="w-20 h-20 rounded-full mx-auto mb-2"
                    />
                    <p>Name: {buyer.name}</p>
                    <p>Email: {buyer.email}</p>
                    <p>
                        Address: {buyer.address?.lotNum}, {buyer.address?.street}, {buyer.address?.baranggay}, {buyer.address?.city}
                    </p>
                </div>
            )}

            <h2 className="text-lg font-bold mb-3">Your Sacks</h2>
            {mySacks.length > 0 ? (
                <div className="space-y-4">
                    {mySacks.map(item => (
                        <div key={item._id} className="bg-gray-600 p-3 rounded-lg flex items-center">
                            <img
                                src={item.images[0]?.url || "https://via.placeholder.com/150"}
                                alt="sack"
                                className="w-20 h-20 object-cover rounded-lg mr-4"
                            />
                            <div>
                                <p>Stall #: {item.stallNumber}</p>
                                <p>Weight: {item.kilo} KG</p>
                                <p>Description: {item.description}</p>
                                <p>Location: {item.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No sacks found for this seller.</p>
            )}
        </div>
    );
};

export default SeePickUp;