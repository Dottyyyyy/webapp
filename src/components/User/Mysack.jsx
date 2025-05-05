import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import { getUser } from "../../utils/helpers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import '../../index.css'
import Footer from "../Navigation/Footer";

const Mysack = () => {
    const user = getUser();
    const userId = user._id
    const navigate = useNavigate()
    const [mySack, setMySacks] = useState([]);
    const addToSackId = mySack.length > 0 ? mySack[0]._id : undefined;
    const status = mySack.length > 0 ? mySack[0].status : undefined;
    console.log(addToSackId)

    const fetchMySacks = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-my-sacks/${userId}`);
            const pendingSacks = data.mySack.filter(sack => sack.status === "pending");

            setMySacks(pendingSacks);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    useEffect(() => {
        fetchMySacks();
    }, [userId]);

    // console.log("My Sack Data:", mySack);
    const totalKilos = mySack.reduce((sum, item) => {
        return sum + item.sacks.reduce((sackSum, sack) => sackSum + Number(sack.kilo || 0), 0);
    }, 0);

    const handlePickUpSacks = async () => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API}/sack/pick-up-sacks/${addToSackId}`, { mySack, totalKilos });
            toast.success("Pick up sack Successfully.");
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    }


    return (
        <>
            <div className="flex w-full h-full fade-in">
                <ToastContainer />
                <div className="flex-grow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">My Sack</h1>
                        {user && (user.role === "farmer" || user.role === "composter") && (
                            <button
                                onClick={handlePickUpSacks}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded shadow hover:bg-green-700 transition"
                            >
                                {user.role === "farmer" ? "Pick up these sacks" : "Pick up spoiled sacks"}
                            </button>
                        )}
                    </div>

                    <div className="text-lg font-semibold text-gray-700 mb-6">
                        Total weight of sacks: {totalKilos} kg
                    </div>

                    {mySack.length === 0 ? (
                        <div className="text-gray-500">No pending sacks found.</div>
                    ) : (
                        <div className="space-y-6">
                            {mySack.map((entry, index) => (
                                <div key={entry._id} className="border rounded-lg shadow bg-white p-4 relative">
                                    {/* Entry Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-lg font-semibold text-gray-800">Sack entry #{index + 1}</div>
                                        <span className="text-xs bg-yellow-400 text-white px-3 py-1 rounded-full uppercase">Pending</span>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-4">
                                        Created at:{" "}
                                        <span className="font-medium">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Sack Details */}
                                    <div className="space-y-4">
                                        {entry.sacks.map((sack, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col sm:flex-row gap-4 border rounded-md p-4 bg-gray-50 shadow-sm"
                                            >
                                                <img
                                                    src={sack.images[0]?.url}
                                                    alt="Sack"
                                                    className="w-full sm:w-64 h-48 object-cover rounded"
                                                />
                                                <div className="text-sm text-gray-700 flex flex-col justify-between">
                                                    <div><strong>Stall #:</strong> {sack.stallNumber || "N/A"}</div>
                                                    <div><strong>Weight:</strong> {sack.kilo || 0} kg</div>
                                                    <div><strong>Description:</strong> {sack.description || "N/A"}</div>
                                                    <div><strong>Location:</strong> {sack.location || "N/A"}</div>
                                                    <div><strong>Spoilage Date:</strong> {sack.dbSpoil ? new Date(sack.dbSpoil).toLocaleDateString() : "N/A"}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Mysack;