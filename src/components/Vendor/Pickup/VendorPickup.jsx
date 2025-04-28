import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Navigation/Sidebar"; // Ensure Sidebar is correctly imported
import { getUser } from "../../../utils/helpers";
import axios from "axios";

const VendorPickup = () => {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;
    const sellerId = user._id;
    const [mySack, setMySacks] = useState([]);
    const [sellers, setSellers] = useState({});

    const fetchMySacks = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/sack/stall-pickup-sacks/${sellerId}`);
            const pickUpSacks = response.data;

            const filteredSacks = pickUpSacks.map((pickup) => {
                const sellerSacks = pickup.sacks.filter((sack) => sack.seller === sellerId);

                const totalKilo = sellerSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);

                return {
                    ...pickup,
                    sacks: sellerSacks,
                    totalKilo: totalKilo.toString(),
                };
            }).filter((pickup) => pickup.sacks.length > 0);

            setMySacks(filteredSacks);
        } catch (error) {
        }
    };

    const fetchSackSellers = async () => {
        try {
            const sellerIds = [...new Set(mySack.flatMap(item => item.sacks.map(sack => sack.seller)))];
            const sellerData = {};
            await Promise.all(
                sellerIds.map(async (sellerId) => {
                    if (!sellers[sellerId]) {
                        const { data } = await axios.get(`${import.meta.env.VITE_API}/get-user/${sellerId}`);
                        sellerData[sellerId] = data.user;
                    }
                })
            );
            setSellers((prevSellers) => ({ ...prevSellers, ...sellerData }));
        } catch (error) {
            console.error("Error fetching sellers:", error);
        }
    };
    useEffect(() => {
        if (userId) {
            fetchMySacks();
            const interval = setInterval(() => {
                fetchMySacks();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        if (mySack.length > 0) {
            fetchSackSellers();
        }
    }, [mySack]);
    console.log(mySack, 'My sack')
    return (
        <div className="flex-grow p-6 overflow-y-auto">
            <Sidebar />
            <div className="flex items-center justify-center">
                <h1 className="text-3xl font-bold text-black text-center bg-blue-500 p-4 rounded-xl inline-block">
                    Pickup Request:
                </h1>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
                {mySack.map((item, index) => (
                    <div
                        key={item._id}
                        onClick={() => navigate(`/vendor/pickup-detail/${item._id}`, { state: { pickupData: item } })}
                        className="cursor-pointer bg-gray-800 text-white rounded-xl shadow-md p-4 mb-4 flex items-center justify-between transition-transform hover:scale-[1.01]"
                    >
                        {/* Left section */}
                        <div className="flex-1 text-center">
                            {item.status !== "completed" && (
                                <div className="bg-green-500 px-3 py-1 rounded-full font-semibold text-sm mb-2 inline-block">
                                    Pickup No: {index + 1}
                                </div>
                            )}
                            <div className="text-6xl mb-2">
                                <i className="fas fa-truck mr-2"></i> {/* Font Awesome truck icon */}
                            </div>
                            <div className="text-md font-medium">Total Kilo: {item.totalKilo}</div>
                        </div>

                        {/* Middle section */}
                        <div className="flex-1 text-center">
                            <div className="text-4xl mb-2">
                                <i className="fas fa-route"></i>
                            </div>
                            <div className="text-sm">Taytay Rizal,<br />New Market</div>
                        </div>

                        {/* Right section */}
                        <div className="flex-1 text-center">
                            <img
                                src='/src/images/newtaytay.jpg'
                                alt="Taytay"
                                className="w-24 h-24 rounded-lg mx-auto mb-2 object-cover"
                            />
                            <div className="text-sm">
                                <i className="mdi mdi-sack"></i> {item.sacks.length}
                            </div>
                            <div className="text-yellow-400 font-semibold text-sm mt-1">Status: {item.status}</div>
                            {item.status !== "completed" && (
                                <div className="text-xs mt-1">
                                    <i className="mdi mdi-clock-remove"></i> {
                                        new Date(new Date(item.pickupTimestamp).getTime())
                                            .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                    }<br />
                                    {
                                        new Date(item.pickupTimestamp).toLocaleTimeString("en-US", {
                                            timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: true
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorPickup;