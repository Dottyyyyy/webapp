import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar"; // Ensure Sidebar is correctly imported

const Mysack = ({ mySacks, setMySacks }) => {
    const navigate = useNavigate();

    const totalWeight = mySacks.reduce(
        (total, sack) => total + sack.weight * sack.quantity,
        0
    );

    const handleIncrease = (id) => {
        setMySacks((prev) =>
            prev.map((sack) =>
                sack.id === id ? { ...sack, quantity: sack.quantity + 1 } : sack
            )
        );
    };

    const handleDecrease = (id) => {
        setMySacks((prev) =>
            prev.map((sack) =>
                sack.id === id && sack.quantity > 1
                    ? { ...sack, quantity: sack.quantity - 1 }
                    : sack
            )
        );
    };

    const handlePickUp = () => {
        console.log("Pick up request sent for:", mySacks);
        // Add logic to notify the stall
        setMySacks([]); // Clear the sack after pickup
    };

    return (
        <div className="flex w-full h-full">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-grow p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">My Sack</h1>
                <div className="text-2xl font-bold text-green-600 mb-6">
                    Total Weight: {totalWeight}kg
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {mySacks.map((sack) => (
                        <div
                            key={sack.id}
                            className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center"
                        >
                            <div>
                                <p className="text-lg font-semibold text-gray-700">
                                    {sack.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    From: {sack.stallName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Added: {new Date(sack.timestamp).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Weight: {sack.weight}kg
                                </p>
                                <p className="text-sm text-gray-600">
                                    Quantity: {sack.quantity}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleIncrease(sack.id)}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => handleDecrease(sack.id)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                                >
                                    -
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {mySacks.length > 0 && (
                    <button
                        onClick={handlePickUp}
                        className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                    >
                        Pick Up
                    </button>
                )}
            </div>
        </div>
    );
};

export default Mysack;