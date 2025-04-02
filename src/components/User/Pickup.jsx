import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar"; // Ensure Sidebar is correctly imported

const Pickup = ({ mySacks, setMySacks, stallDetails }) => {
    const navigate = useNavigate();

    // Calculate total sacks and total weight
    const totalSacks = mySacks.reduce((total, sack) => total + sack.quantity, 0);
    const totalWeight = mySacks.reduce(
        (total, sack) => total + sack.weight * sack.quantity,
        0
    );

    const handleConfirmPickup = () => {
        console.log("Sacks picked up:", mySacks);
        // Add logic to notify the system that the sacks have been picked up
        setMySacks([]); // Clear the sacks after confirmation
        navigate("/"); // Redirect to the home page or another page
    };

    return (
        <div className="flex w-full h-full">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-grow p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Pick Up</h1>

                {/* Sacks Summary */}
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                        All Sacks Added
                    </h2>
                    <p className="text-lg text-gray-600">
                        Total Sacks: <span className="font-bold">{totalSacks}</span>
                    </p>
                    <p className="text-lg text-gray-600">
                        Total Weight: <span className="font-bold">{totalWeight}kg</span>
                    </p>
                </div>

                {/* Stall Details */}
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                        Stall Details
                    </h2>
                    <p className="text-lg text-gray-600">
                        Stall Name: <span className="font-bold">{stallDetails?.name || "N/A"}</span>
                    </p>
                    <p className="text-lg text-gray-600">
                        Stall Address: <span className="font-bold">{stallDetails?.address || "N/A"}</span>
                    </p>
                </div>

                {/* Mapping Section */}
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Mapping</h2>
                    <p className="text-lg text-gray-600">
                        The sacks are located at:{" "}
                        <span className="font-bold">{stallDetails?.address || "N/A"}</span>
                    </p>
                    {/* Add a map component or placeholder */}
                    <div className="mt-4 bg-gray-300 h-64 flex items-center justify-center rounded-lg">
                        <p className="text-gray-700">Map Placeholder</p>
                    </div>
                </div>

                {/* Confirm Pickup Button */}
                <button
                    onClick={handleConfirmPickup}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    Confirm Pickup
                </button>
            </div>
        </div>
    );
};

export default Pickup;