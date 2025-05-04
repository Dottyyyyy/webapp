import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import { getUser } from "../../utils/helpers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import '../../index.css'

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
        <div className="flex w-full h-full fade-in">
            {/* Sidebar */}
            <ToastContainer />
            {/* Main Content */}
            <div className="flex-grow p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">My Sack</h1>
                <div className="text-2xl font-bold text-green-600 mb-6">
                    Total Weight: {totalKilos} kg
                </div>

                {mySack.length === 0 ? (
                    <div className="text-gray-500">No pending sacks found.</div>
                ) : (
                    <div className="space-y-4">
                        {mySack.map((entry, index) => (
                            <div key={entry._id} className="border p-4 rounded-lg shadow-md bg-white">
                                <div className="text-lg font-semibold text-gray-700 mb-2">
                                    Sack Entry #{index + 1}
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                    Status: <span className="font-medium text-blue-600">{entry.status}</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                    Created At:{" "}
                                    <span className="font-medium">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <div className="text-sm font-semibold mb-1 text-gray-700">Sacks:</div>
                                    <div className="flex overflow-x-auto space-x-4 p-2">
                                        {entry.sacks.map((sack, i) => (
                                            <div
                                                key={i}
                                                className="min-w-[250px] p-2 border border-gray-200 rounded-md bg-white shadow-sm"
                                            >
                                                <img
                                                    src={sack.images[0]?.url}
                                                    alt="Stall"
                                                    className="w-full h-48 object-cover rounded"
                                                />
                                                <div className="mt-2 text-sm">
                                                    <div><strong>Seller:</strong> {sack.seller || "N/A"}</div>
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
                                {user && (user.role === "farmer" || user.role === "composter") && (
                                    <div className="mt-4">
                                        <button
                                            onClick={handlePickUpSacks}
                                            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                                        >
                                            {user.role === "farmer" ? "Pick Up These Sacks" : "Pick Up Spoiled Sacks"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mysack;