import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../index.css'
import Footer from '../../Navigation/Footer';
import GoogleMapService from '../../Pages/Maps';

const PickupDetails = () => {
    const location = useLocation();
    const { pickupData } = location.state || {};
    const [newPickup, setNewPickup] = useState({});
    const pickup = Object.keys(newPickup).length > 0 ? newPickup : pickupData;
    const [pickupStatus, setPickupStatus] = useState(pickup?.status || newPickup?.status);
    const [sackStatuses, setSackStatuses] = useState({});
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [sellers, setSellers] = useState({});
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;
    console.log(newPickup, 'new')
    const [showMapModal, setShowMapModal] = useState(false);


    useEffect(() => {
        const fetchSackSellers = async () => {
            try {
                if (!pickup?.sacks || !Array.isArray(pickup.sacks)) return;

                const sellerData = {};
                await Promise.all(
                    pickup?.sacks?.map(async (item) => {
                        const { data } = await axios.get(`${import.meta.env.VITE_API}/get-user/${item.seller}`);
                        sellerData[item.seller] = data.user;
                    })
                );
                setSellers(sellerData);
            } catch (error) {
                console.error('Error fetching sellers:', error);
            }
        };

        fetchSackSellers();
    }, [userId]);

    const handlePickupStatus = async () => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/sack/pickup-sack-now/${pickup._id}`);
            setPickupStatus(data.status);
            toast.success('You should now Pick-up the Sack');

            setTimeout(() => {
                navigate(-1)
            }, 1000);
        } catch (e) {
            console.log(e)
        }
    }

    const fetchAllSackStatuses = async () => {
        try {
            if (!pickup?.sacks || !Array.isArray(pickup.sacks)) return;

            const statuses = {};
            const reviewedFlags = {};

            await Promise.all(
                pickup.sacks.map(async (item) => {
                    const response = await axios.get(`${import.meta.env.VITE_API}/sack/see-sacks`, {
                        params: { sackIds: item.sackId }
                    });

                    const sack = response.data.sacks[0];
                    if (sack) {
                        statuses[item.sackId] = sack.status;
                        reviewedFlags[item.sackId] = sack.reviewed;
                    } else {
                        statuses[item.sackId] = "Not Found";
                        reviewedFlags[item.sackId] = false;
                    }
                })
            );

            setSackStatuses(statuses);

            const updatedSacks = pickup.sacks.map((item) => ({
                ...item,
                reviewed: reviewedFlags[item.sackId] ?? false,
            }));

            setNewPickup({
                ...pickup,
                sacks: updatedSacks,
            });

        } catch (error) {
            console.error("Error fetching sack statuses:", error);
        }
    };
    useEffect(() => {
        fetchAllSackStatuses();
    }, [userId]);


    const handleReviewChange = (e) => setReview(e.target.value);

    const handleRatingClick = (ratingValue) => setRating(ratingValue);

    const handleFormSubmit = async (e, sackId) => {
        e.preventDefault();

        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/sack/rate-transaction/${sackId}`, {
                review,
                rating
            });

            toast.success(
                <div>
                    <p>Thank you for your review.</p>
                    <p>We will make our market better.</p>
                </div>
            );

            // ✅ Mark this sack as reviewed in the local state
            const updatedSacks = pickup.sacks.map((sack) =>
                sack.sackId === sackId ? { ...sack, reviewed: true } : sack
            );

            setNewPickup({
                ...pickup,
                sacks: updatedSacks,
            });

            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            console.log('Error in completing pickup status', error.message);

            // ✅ Optionally hide the form if backend says it's already reviewed
            if (error.response?.data?.message === "Sack has already been reviewed.") {
                const updatedSacks = pickup.sacks.map((sack) =>
                    sack.sackId === sackId ? { ...sack, reviewed: true } : sack
                );
                setNewPickup({
                    ...pickup,
                    sacks: updatedSacks,
                });
            }

            toast.error(error.response?.data?.message || "Something went wrong.");
        }
    };


    const handleCompletePickUpStatus = () => {
        setShowCompleteModal(true);
    };

    const confirmCompletePickup = async () => {
        try {
            setIsCompleting(true);
            await axios.put(`${import.meta.env.VITE_API}/sack/complete-pickup/${pickup._id}`);
            toast.success(
                <div>
                    <p>All sacks have been claimed. Thank you for your service!</p>
                </div>
            );
            setShowCompleteModal(false);
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error) {
            console.log("Error in completing pickup status", error.message);
            toast.error("Something went wrong.");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#0A4724] to-[#116937] text-white">
            <ToastContainer />

            {/* Header */}
            <div className="mb-8 grid md:grid-cols-2 gap-6 items-start">
                {/* Left: Title + Info */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">📦 Pickup Detail</h1>
                    <p className="text-sm text-green-300">
                        Pickup #: <span className="font-semibold">{pickup._id}</span>
                    </p>

                    {pickupStatus === "completed" && (
                        <p className="text-sm text-green-300">
                            Picked Up On: 📅{" "}
                            {new Date(pickup.pickedUpDate).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric"
                            })}{" "}
                            {new Date(pickup.pickedUpDate).toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC"
                            })}
                        </p>
                    )}
                </div>

                {/* Right: Controls + Status + Summary */}
                <div className="flex flex-wrap items-center gap-4 justify-end">
                    {/* Map Button */}
                    {(pickup.status === "pending" || pickup.status === "pickup") && (
                        <button
                            onClick={() => setShowMapModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs font-medium rounded-full shadow-md transition"
                        >
                            🗺️ View Map
                        </button>
                    )}

                    {/* Status Pill */}
                    <span className={`text-xs font-semibold px-4 py-1 rounded-full shadow-sm
      ${pickup.status === "pending" ? "bg-blue-400 text-white" :
                            pickup.status === "pickup" ? "bg-yellow-400 text-black" :
                                pickup.status === "completed" ? "bg-green-500 text-white" :
                                    "bg-gray-400 text-white"}`}>
                        {pickup.status === "pending" ? "In Progress" :
                            pickup.status === "pickup" ? "Picking Up" :
                                pickup.status === "completed" ? "Completed" : pickup.status}
                    </span>

                    {/* Summary Cards */}
                    <div className="bg-white text-black p-3 rounded-xl shadow-md text-center min-w-[120px]">
                        <p className="text-xs font-medium">Total Weight</p>
                        <p className="text-xl font-bold">{pickup.totalKilo} kg</p>
                    </div>

                    <div className="bg-white text-black p-3 rounded-xl shadow-md text-center min-w-[120px]">
                        <p className="text-xs font-medium">Pending Items</p>
                        <p className="text-xl font-bold">
                            {pickup.sacks.filter((s) => s.status !== "cancelled").length}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    {pickup.status === "pending" && (
                        <button
                            onClick={handlePickupStatus}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl shadow transition"
                        >
                            🚚 Start Pickup
                        </button>
                    )}
                    {pickup.status === "pickup" && (
                        <button
                            onClick={handleCompletePickUpStatus}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl shadow transition"
                        >
                            ✅ Complete Pickup
                        </button>
                    )}
                </div>
            </div>

            {/* Sack Details */}
            {pickup?.sacks?.filter(s => s.status !== "cancelled").map((item, idx) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 flex flex-col md:flex-row">

                    {/* Left: Stall Info */}
                    <div className="md:w-1/3 bg-[#F3FAF7] p-5 flex flex-col border-r">
                        <img
                            src={sellers[item.seller]?.stall?.stallImage?.url || "https://via.placeholder.com/800x400"}
                            alt="Stall"
                            className="w-full h-48 object-cover rounded-xl mb-4"
                        />
                        <div className="space-y-1 text-sm text-gray-800">
                            <h3 className="text-green-700 font-bold text-base">🏪 Taytay Rizal Market</h3>
                            <p>📌 Stall #: <span className="font-semibold">{item.stallNumber}</span></p>
                            <p>📍 {sellers[item.seller]?.stall?.stallAddress || "Market Address Unavailable"}</p>
                            <p>🗓️ Pickup Date:{" "}
                                {new Date(pickup.pickupTimestamp).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric"
                                })}{" "}
                                {new Date(pickup.pickupTimestamp).toLocaleTimeString("en-US", {
                                    timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: true
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Right: Sack Item + Review */}
                    <div className="md:w-2/3 p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">🧺 Item #{idx + 1}</h3>

                        <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
                            <img
                                src={item.images[0]?.url || "https://via.placeholder.com/400x300"}
                                alt="Item"
                                className="w-28 h-24 object-cover rounded-lg shadow"
                            />
                            <div className="flex-1 space-y-2 text-sm text-gray-700">
                                <p>📝 <span className="font-medium">Description:</span> {item.description || "Mixed Vegetables"}</p>
                                <p>⚖️ <span className="font-medium">Weight:</span> {item.kilo} kg</p>
                                <p>📆 <span className="font-medium">Spoils on:</span>{" "}
                                    {new Date(item.dbSpoil).toLocaleDateString("en-US", {
                                        year: "numeric", month: "long", day: "numeric"
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Review Form */}
                        {pickupStatus === "completed" && !item?.reviewed && (
                            <form
                                onSubmit={(e) => handleFormSubmit(e, item.sackId)}
                                className="mt-6 bg-gray-50 p-5 rounded-xl shadow-inner"
                            >
                                <h4 className="text-md font-semibold text-gray-800 mb-2">⭐ Write a Review</h4>

                                <textarea
                                    value={review}
                                    onChange={handleReviewChange}
                                    placeholder="Write your review here..."
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md p-3 mb-4 text-sm"
                                />

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm text-gray-800">Rating:</span>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingClick(star)}
                                            className={`text-xl ${rating >= star ? "text-yellow-500" : "text-gray-300"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md"
                                >
                                    Submit Review
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ))}


            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="relative bg-gradient-to-br from-green-900 to-green-500 p-6 rounded-xl w-full max-w-4xl shadow-lg">
                        <button onClick={() => setShowMapModal(false)} className="absolute top-2 right-4 text-white text-2xl">&times;</button>
                        <h2 className="text-xl text-white font-bold mb-4">📍 Map View</h2>
                        <div className="w-full h-[500px]">
                            <GoogleMapService pickup={pickup} />
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Pickup Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 bg-opacity-60 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-green-800 to-green-500 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
                        <h2 className="text-xl font-semibold mb-4 text-white">Confirm Completion</h2>
                        <p className="text-white mb-6">
                            Are you sure all sacks were collected? <br />
                            Unclaimed ones will be sent back to their stalls.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={confirmCompletePickup}
                                disabled={isCompleting}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                {isCompleting ? "Processing..." : "Yes, Complete"}
                            </button>
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                disabled={isCompleting}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupDetails;