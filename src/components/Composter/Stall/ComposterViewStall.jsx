import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import Sidebar from '../../Navigation/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../../Navigation/Footer';

function ComposterViewStall() {

    const { id } = useParams();
    const [stall, setStall] = useState({});
    const [sacks, setSacks] = useState([]);
    const [seller, setUser] = useState([]);
    const [mySacks, setMySacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = getUser()

    const fetchStallData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/vendor/${id}`
            );
            setStall(response.data.stall);
        } catch (error) {
            console.error("Error fetching stall data:", error);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/get-user/${id}`
            );
            setUser(response.data.user);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStallWasteData = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/sack/get-store-sacks/${id}`
            );
            // console.log(data,'hello')
            const now = new Date();
            const filteredSacks = data.sacks.filter(sack => {
                const spoilageDate = new Date(sack.dbSpoil);
                const daysPast = (now - spoilageDate) / (1000 * 60 * 60 * 24);

                return sack.status === "spoiled" && daysPast < 3;
            });

            setSacks(filteredSacks);
        } catch (error) {
            console.error("Error fetching sacks data:", error);
        }
    };

    // console.log(mySacks, 'Mysacks')

    const handleAddToSack = async (sack) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/sack/add-to-sack/${user._id}`, sack);

            toast.success('Added to Sack Successfully.');
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            toast.warning('Error in Adding to Cart');
        }
    };

    useEffect(() => {
        fetchStallData();
        fetchUserData();
        fetchStallWasteData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold text-gray-600">Loading...</p>
            </div>
        );
    }

    function timeUntil(dateString) {
        const now = new Date();
        const target = new Date(dateString);
        const diff = target - now;

        if (diff <= 0) return "Spoiled/Expired";

        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24 + 1);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
        return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }

    const getAverageRating = (ratings = []) => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, item) => sum + item.value, 0);
        return (total / ratings.length).toFixed(1);
    };

    return (
        <>
            <div className="flex w-full fade-in min-h-screen relative" style={{
                background: 'linear-gradient(to bottom right, #0A4724, #116937)',
            }}>
                <ToastContainer />
                <div className={`flex-grow p-6 ${isModalOpen ? "blur-sm" : ""}`}>
                    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">

                        {/* Back Link */}
                        <div className="p-4">
                            <a href="/composter/market" className="text-green-600 text-sm hover:underline">
                                ← Back to Directory
                            </a>
                        </div>

                        <div className="div" style={{ display: 'flex', flexDirection: 'row' }}>
                            {/* Header Image */}
                            <div className="w-80 h-80 bg-gray-300 flex items-center justify-center text-gray-500 text-3xl">
                                <img
                                    src={stall.stallImage?.url}
                                    alt="Stall"
                                    className="w-full h-full object-cover border-4 border-green-500 rounded"
                                />
                            </div>

                            {/* Stall Info */}
                            <div className="px-6 py-4 border-b">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-2xl font-bold text-gray-800">{stall.vendorName}</h1>
                                    <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full text-white uppercase ${stall.status?.toLowerCase() === "open" ? "bg-green-600" : "bg-red-600"
                                            }`}
                                    >
                                        {stall.status?.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    A produce vendor offering food waste as alternative feeds and for composting. We are committed to reducing food waste through sustainable practices.
                                </p>

                                <div className="flex mt-4 space-x-10 text-sm text-gray-700">
                                    <div>
                                        <span className="font-semibold block">Stall Number</span>
                                        {stall.stallNumber || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Location</span>
                                        {stall.stallAddress || "N/A"}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-yellow-500 text-xl">
                                        ⭐ Average {getAverageRating(stall.rating)}
                                    </span>
                                    <span className="text-sm text-gray-300">
                                        ({stall.rating?.length || 0} ratings)
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* Available Sacks */}
                        {!sacks.length === 0 ? (
                            <div className="px-6 py-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Available Sacks</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {sacks.map((sack) => (
                                        <div key={sack._id} className="bg-white rounded-lg shadow-sm p-4">
                                            <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500 mb-4">
                                                <img
                                                    src={sack.images[0]?.url}
                                                    alt="Sack"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-md font-semibold text-gray-800">{sack.name}</h3>
                                                <span className="text-sm font-semibold text-green-600">
                                                    {sack.kilo}kg
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">
                                                {sack.description}
                                            </p>

                                            <div className="text-xs text-gray-500 mb-2">
                                                ⏱ {timeUntil(sack.dbSpoil)} before spoiling
                                            </div>

                                            <button
                                                onClick={() => handleAddToSack(sack)}
                                                className="w-full mt-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                            >
                                                Add to Sack
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-8">
                                <h1>No Sacks Available</h1>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ComposterViewStall