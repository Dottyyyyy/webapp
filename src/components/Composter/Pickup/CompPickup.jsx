import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../../../index.css'
import { getUser } from "../../../utils/helpers";

const CompPickuo = () => {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;
    const [mySack, setMySacks] = useState([]);
    const [sellers, setSellers] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [filteredSacks, setFilteredSacks] = useState([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchMySacks = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/sack/get-pickup-sacks/${userId}`);
            const pickUpSacks = response.data.pickUpSacks;

            if (!Array.isArray(pickUpSacks)) {
                console.error("pickUpSacks is not an array:", pickUpSacks);
                return;
            }

            const now = new Date();
            const nowUTC8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);

            for (const sack of pickUpSacks) {
                const pickupTimestamp = new Date(sack.pickupTimestamp);
                if (pickupTimestamp.getTime() <= nowUTC8.getTime() && sack.status !== "completed") {
                    const sackIds = sack.sacks.map(s => s.sackId);
                    await axios.delete(`${import.meta.env.VITE_API}/sack/delete-pickuped-sack/${sack._id}`, {
                        data: { sackIds }
                    });
                    toast.warning('You did not pick up the sack, it will return there');
                }
            }

            setMySacks(pickUpSacks);
            setFilteredSacks(applyFilterAndPagination(pickUpSacks, dateFrom, dateTo, currentPage, statusFilter));
        } catch (error) {
            console.error("Error fetching sacks:", error.response?.data || error.message);
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

    const applyFilterAndPagination = (data, from, to, page, status) => {
        let filtered = [...data];

        if (status && status !== "all") {
            filtered = filtered.filter(item => item.status === status);
        }

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
        setFilteredSacks(applyFilterAndPagination(mySack, dateFrom, dateTo, currentPage, statusFilter));
    }, [mySack, currentPage, dateFrom, dateTo, statusFilter]);

    return (
        <div
            className="flex-grow p-6 fade-in"
            style={{
                background: "linear-gradient(to bottom right, #0A4724, #116937)",
                padding: 10,
            }}
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section */}
                <div className="w-full lg:w-[30%]">
                    <div
                        className="text-3xl font-bold text-black text-center p-4 rounded-xl"
                        style={{
                            background: "linear-gradient(to bottom right,rgb(21, 132, 69),rgb(37, 212, 113))",
                            padding: 10,
                            marginRight: 40,
                        }}
                    >
                        <div className="w-full h-full rounded-xl overflow-hidden border border-green-300 shadow-lg mb-4">
                            <img
                                src="/images/newtaytay.jpg"
                                alt="Food waste management"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="mb-4">Pickup Waste</h1>

                        {/* Filters */}
                        <div className="flex items-center gap-4 mb-4 mt-4 flex-wrap">
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
                            <div>
                                <label className="block font-semibold text-sm text-gray-700">Status:</label>
                                <select
                                    className="border px-3 py-2 rounded"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="pickup">Pickup</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {(dateFrom || dateTo) && (
                            <button
                                className="text-sm text-red-200 underline"
                                onClick={() => {
                                    setDateFrom("");
                                    setDateTo("");
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="w-full lg:w-[70%] bg-[#E9FFF3] rounded-lg p-4">
                    <div className="flex justify-between mt-4 mb-5">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                            Previous
                        </button>
                        <button
                            disabled={currentPage * itemsPerPage >= mySack.length}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className={`px-4 py-2 rounded ${currentPage * itemsPerPage >= mySack.length ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                            Next
                        </button>
                    </div>

                    {/* Pickup Items */}
                    {filteredSacks.map((item, index) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/pickup/see/${item._id}`, { state: { pickupData: item } })}
                            className="cursor-pointer text-white rounded-xl shadow-md p-4 mb-4 flex flex-col sm:flex-row items-center justify-between transition-transform hover:scale-[1.01] w-full"
                            style={{
                                background: "linear-gradient(to bottom right, #0A4724, #116937)",
                                padding: 10,
                            }}
                        >
                            {/* Left */}
                            <div className="flex-1 text-center">
                                {item.status !== "completed" && (
                                    <div className="bg-green-500 px-3 py-1 rounded-full font-semibold text-sm mb-2 inline-block">
                                        Pickup No: {index + 1}
                                    </div>
                                )}
                                <div className="text-6xl mb-2">
                                    <i className="fas fa-truck mr-2"></i>
                                </div>
                                <div className="text-md font-medium">Total Kilo: {item.totalKilo}</div>
                            </div>

                            {/* Middle */}
                            <div className="flex-1 text-center">
                                <div className="text-4xl mb-2">
                                    <i className="fas fa-route"></i>
                                </div>
                                <div className="text-sm">Taytay Rizal,<br />New Market</div>
                            </div>

                            {/* Right */}
                            <div className="flex-1 text-center">
                                <img
                                    src="/src/images/newtaytay.jpg"
                                    alt="Taytay"
                                    className="w-24 h-24 rounded-lg mx-auto mb-2 object-cover"
                                />
                                <div className="text-sm">
                                    <i className="mdi mdi-sack"></i> {item.sacks.filter((s) => s.status !== "cancelled").length}
                                </div>
                                <div className="text-yellow-400 font-semibold text-sm mt-1">Status: {item.status}</div>
                                {item.status !== "completed" && (
                                    <div className="text-xs mt-1">
                                        <i className="mdi mdi-clock-remove"></i> {
                                            new Date(item.pickupTimestamp).toLocaleDateString("en-US", {
                                                year: "numeric", month: "long", day: "numeric"
                                            })
                                        }
                                        <br />
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

export default CompPickuo;