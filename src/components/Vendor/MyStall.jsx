import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../../utils/helpers';
import '../../index.css';
import CreateSack from './CreateSack';

const MyStall = () => {
    const { id } = useParams();
    const [stall, setStall] = useState(null);
    const [sacks, setStoreSacks] = useState([]);
    const [filter, setFilter] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const user = getUser();

    const fetchStore = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/vendor/${id}`);
            setStall(data.stall);
        } catch (error) {
            console.error("Error fetching stall:", error);
        }
    };

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-store-sacks/${user._id}`);
            setStoreSacks(data.sacks);
        } catch (error) {
            console.error("Error fetching sacks:", error);
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

    const getAverageRating = (ratings = []) => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, item) => sum + item.value, 0);
        return (total / ratings.length).toFixed(1);
    };

    const filteredSacks = sacks.filter((sack) => {
        const sackDate = new Date(sack.dbSpoil).toISOString().split("T")[0];
        const isStatusMatch = filter === "All" || sack.status.toLowerCase() === filter.toLowerCase();

        const isWithinDateRange = (!fromDate || sackDate >= fromDate) &&
            (!toDate || sackDate <= toDate);

        return isStatusMatch && isWithinDateRange;
    });

    return (
        <div className="min-h-screen bg-gray-100 p-6 fade-in" style={{
            background: 'linear-gradient(to bottom right, #0A4724, #116937)',
        }}>
            {/* Stall Info */}
            {stall ? (
                <div className="rounded-lg shadow-md overflow-hidden mb-8 flex flex-row justify-center p-5 ml-70">
                    <div className="flex flex-row w-full max-w-5xl gap-6">
                        <img
                            src={stall.stallImage?.url || "https://via.placeholder.com/800x400"}
                            alt="Stall"
                            className="w-80 h-64 object-cover rounded"
                        />
                        <div className="p-6 relative text-white">
                            <h3 className="text-xl font-semibold mb-1">{stall.stallName}</h3>
                            <p className="text-sm mb-1"><strong>Stall #:</strong> {stall.stallNumber}</p>
                            <p className="text-sm mb-1"><strong>Address:</strong> {stall.stallAddress}</p>
                            <p className="text-sm"><strong>Description:</strong> {stall.stallDescription}</p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-yellow-500 text-xl">
                                    ⭐ Average {getAverageRating(stall.rating)}
                                </span>
                                <span className="text-sm text-gray-300">
                                    ({stall.rating?.length || 0} ratings)
                                </span>
                            </div>
                            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${stall.status === 'Open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {stall.status}
                            </span>
                            {/* Status Filter */}
                            <div className="flex gap-2 flex-wrap">
                                {["All", "Posted", "Spoiled", "Claimed", "Trashed"].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${filter === status ? 'bg-white text-green-800' : 'bg-green-700 hover:bg-green-600'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600 mb-6">Loading stall details...</p>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between items-start gap-4 mb-4 text-white">

                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-sm">From:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="rounded px-2 py-1 text-black"
                    />
                    <label className="text-sm">To:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="rounded px-2 py-1 text-black"
                    />
                    {(fromDate || toDate) && (
                        <button
                            className="text-sm text-red-200 underline"
                            onClick={() => { setFromDate(""); setToDate(""); }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
                >
                    + Create New Sack
                </button>
            </div>

            {/* Sack Grid */}
            {filteredSacks.length > 0 ? (
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {filteredSacks.map((sack, index) => {
                        const status = sack.status.toLowerCase();
                        const statusColor =
                            status === 'claimed' ? 'bg-green-100 text-green-700' :
                                status === 'trashed' ? 'bg-red-100 text-red-700' :
                                    status === 'spoiled' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-200 text-gray-800';

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
                                    <p><strong>Date:</strong> {
                                        new Date(new Date(sack.dbSpoil).getTime())
                                            .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                    }</p>
                                </div>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                    {sack.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-white mt-4">No sacks found for current filters.</p>
            )}
            {showModal && <CreateSack onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default MyStall;