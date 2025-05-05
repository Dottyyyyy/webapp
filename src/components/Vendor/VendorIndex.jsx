import React, { useEffect, useState } from 'react'
import { getUser } from '../../utils/helpers'
import axios from 'axios';

function VendorIndex() {
    const user = getUser();
    console.log(user._id)
    const [pendingCount, setPendingCount] = useState(0);
    const [pickupCount, setPickupCount] = useState(0);

    useEffect(() => {
        const fetchSackStatus = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/notifications/get-pickup-request/${user._id}`);
                setPendingCount(response.data.pendingSacksCount);
                setPickupCount(response.data.pickupSacksCount);
                console.log(response)
            } catch (error) {
                console.error('Error fetching sack status:', error);
            }
        };
        fetchSackStatus();
    }, [user._id]);

    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center p-6">
            {/* Header */}
            <div className="text-center mt-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-green-900">
                    Welcome, Vendor {user.name} {pickupCount}, {pendingCount}
                </h1>
                <p className="text-lg text-gray-700 mt-3 max-w-xl mx-auto">
                    Manage your waste sacks and requests efficiently — and learn how your vegetable waste can bring new value!
                </p>
            </div>

            {/* Image Section */}
            <div className="mt-10 w-full max-w-4xl">
                <img
                    src="https://images.unsplash.com/photo-1590080875963-5f9d87c4e88a" // You can replace this with your own image
                    alt="Vegetable Waste Reuse"
                    className="rounded-2xl shadow-xl w-full h-auto object-cover"
                />
            </div>

            {/* Campaign Section */}
            <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 max-w-4xl text-center">
                <h2 className="text-2xl font-bold text-green-800 mb-4">Why Reuse Your Vegetable Waste?</h2>
                <p className="text-gray-700 text-md">
                    Every kilo of vegetable waste you throw away can become something valuable — from livestock feed to compost and organic fertilizer.
                    Start making a difference today by offering your waste to farmers and composters who need it. Together, we can create a cleaner,
                    more sustainable marketplace.
                </p>

                <button className="mt-6 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full text-lg shadow-md transition">
                    Learn How to Reuse Your Waste
                </button>
            </div>
        </div>
    )
}

export default VendorIndex
