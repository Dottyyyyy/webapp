import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Navigation/Sidebar"; // Ensure Sidebar is correctly imported
import { getUser } from "../../../utils/helpers";
import axios from "axios";
import '../../../index.css'

const VendorPickup = () => {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;
    const sellerId = user._id;
    const [mySack, setMySacks] = useState([]);
    const [sellers, setSellers] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const [filteredSacks, setFilteredSacks] = useState([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

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
            setFilteredSacks(applyFilterAndPagination(filteredSacks, dateFrom, dateTo, currentPage));
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
            }, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        if (mySack.length > 0) {
            fetchSackSellers();
        }
    }, [mySack]);

    const applyFilterAndPagination = (data, from, to, page) => {
        let filtered = [...data];

        if (from && to) {
            const fromDate = new Date(from);
            const toDate = new Date(to);
            filtered = filtered.filter(item => {
                const created = new Date(item.createdAt);
                return created >= fromDate && created <= toDate;
            });
        }

        const startIndex = (page - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };
    useEffect(() => {
        setFilteredSacks(applyFilterAndPagination(mySack, dateFrom, dateTo, currentPage));
    }, [mySack, currentPage, dateFrom, dateTo]);

    return (
        <div className="flex-grow p-6 fade-in" style={{
            background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 10
        }}>
            <div style={{ display: 'flex', flexDirection: 'row' }} >
                <div className="flex items-center justify-center">
                    <h1 className="text-3xl font-bold text-black text-center p-4 rounded-xl inline-block" style={{ background: 'linear-gradient(to bottom right,rgb(21, 132, 69),rgb(37, 212, 113))', padding: 10, marginRight: 40 }}>
                        <div className="flex-1">
                            <div className="w-full h-full rounded-xl overflow-hidden border border-green-300 shadow-lg">
                                <img
                                    src="/images/newtaytay.jpg"
                                    alt="Food waste management"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        Pickup Waste
                        <div className="flex items-center gap-4 mb-4">
                            <div>
                                <label className="block font-semibold text-sm text-gray-700">From:</label>
                                <input
                                    type="date"
                                    className="border px-3 py-2 rounded"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-sm text-gray-700">To:</label>
                                <input
                                    type="date"
                                    className="border px-3 py-2 rounded"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                        {(dateFrom || dateTo) && (
                            <button
                                className="text-sm text-red-200 underline"
                                onClick={() => { setDateFrom(""); setDateTo(""); }}
                            >
                                Clear
                            </button>
                        )}
                    </h1>
                </div>
                <div className="bg-[#E9FFF3] rounded-lg p-4">
                    <div className="flex justify-between mt-4 mb-5">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Previous
                        </button>
                        <button
                            disabled={currentPage * itemsPerPage >= mySack.length}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className={`px-4 py-2 rounded ${currentPage * itemsPerPage >= mySack.length ? 'bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Next
                        </button>
                    </div>
                    {filteredSacks.map((item, index) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/vendor/pickup-detail/${item._id}`, { state: { pickupData: item } })}
                            className="cursor-pointer text-white rounded-xl shadow-md p-4 mb-4 flex items-center justify-between transition-transform hover:scale-[1.01] w-250"
                            style={{
                                background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 10
                            }}
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
        </div>
    );
};

export default VendorPickup;