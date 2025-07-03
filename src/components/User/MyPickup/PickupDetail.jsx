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
        <>
            <div className="p-6 min-h-screen text-gray-800" style={{
                background: 'linear-gradient(to bottom right, #0A4724, #116937)',
            }}>
                <ToastContainer />
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Pick up Detail</h1>
                        <p className="text-sm text-gray-600" style={{ color: 'rgb(85, 212, 140)' }}>Pickup #: <span className="font-semibold">{pickup._id}</span></p>
                        {pickupStatus === "completed" && (
                            <p className="text-sm" style={{ color: 'rgb(85, 212, 140)' }}>Picked Up Complete Date: 📅
                                {new Date(new Date(pickup.pickedUpDate).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}{" "}
                                {new Date(pickup.pickedUpDate).toLocaleTimeString("en-US", {
                                    timeZone: "UTC",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {(pickup.status === 'pending' || pickup.status === 'pickup') && (
                            <button
                                onClick={() => setShowMapModal(true)}
                                className="bg-blue-400 text-white rounded hover:bg-blue-600"
                                style={{ borderRadius: 20, padding: 4, width: 100 }}
                            >
                                <strong style={{ fontSize: 12, }}>
                                    View Map
                                </strong>
                            </button>
                        )}
                        <span
                            className={`text-white px-3 py-1 rounded-full text-sm font-medium ${pickup.status === "pending"
                                ? "bg-blue-400"
                                : pickup.status === "pickup"
                                    ? "bg-yellow-500"
                                    : pickup.status === "completed"
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                }`}
                        >
                            {pickup.status === "pending"
                                ? "In Progress"
                                : pickup.status === "pickup"
                                    ? "Picking Up"
                                    : pickup.status === "completed"
                                        ? "Complete"
                                        : pickup.status}
                        </span>
                        <div className="bg-white p-3 rounded-lg shadow text-center">
                            <p className="text-sm">Total Weight</p>
                            <p className="font-bold text-lg">{pickup.totalKilo} kg</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow text-center">
                            <p className="text-sm">Pending Items</p>
                            <p className="font-bold text-lg">{pickup.sacks.filter(s => s.status !== "cancelled").length}</p>
                        </div>
                        {pickup.status === 'pending' && (
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow"
                                onClick={handlePickupStatus}
                            >
                                Start Pickup
                            </button>
                        )}
                        {pickup.status === 'pickup' && (
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow"
                                onClick={handleCompletePickUpStatus}
                            >
                                Complete Pickup
                            </button>
                        )}
                    </div>
                </div>

                {/* Pickup Info Section */}
                {pickup?.sacks?.filter(item => item.status !== 'cancelled').map((item) => (
                    <div key={item._id} className="bg-[#E9FFF3] rounded-xl p-6 mb-6 flex gap-6 shadow">
                        {/* Left Column: Image + Stall Info */}
                        <div className="w-1/3">
                            <img
                                src={sellers[item.seller]?.stall?.stallImage?.url || "https://via.placeholder.com/800x400"}
                                alt="Stall"
                                className="w-full h-56 object-cover rounded-xl mb-4"
                            />
                            <div className="bg-gray-100 p-4 rounded-xl">
                                <h3 className="font-bold">Taytay Rizal Market</h3>
                                <p className="text-sm mt-1">Stall #: {newPickup?.reviewed}</p>
                                <p className="text-sm mt-1">Stall #: {item.stallNumber}</p>
                                <p className="text-sm">{sellers[item.seller]?.stall?.stallAddress || "Taytay Rizal New Market"}</p>
                                <p className="text-sm">📅
                                    {new Date(new Date(pickup.pickupTimestamp).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}{" "}
                                    {new Date(pickup.pickupTimestamp).toLocaleTimeString("en-US", {
                                        timeZone: "UTC",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Items */}
                        <div className="w-2/3">
                            <h3 className="text-lg font-semibold mb-4">Items to Pick Up</h3>
                            <div className="space-y-4">
                                <div className="flex items-start bg-gray-100 p-4 rounded-lg shadow">
                                    <img
                                        src={item.images[0]?.url || "https://via.placeholder.com/400x300"}
                                        alt="Item"
                                        className="w-24 h-20 object-cover rounded-lg mr-4"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">Item #{item.index || 1}</h4>
                                            <p className="font-bold">{item.kilo} kg</p>
                                        </div>
                                        <p className="text-sm">Description: {item.description || 'Mixed Vegetables'}</p>
                                        <p className="text-sm">Spoilage Date:{" "}
                                            {new Date(new Date(item.dbSpoil).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}{" "}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {pickupStatus === "completed" && !item?.reviewed && (
                                <form onSubmit={(e) => handleFormSubmit(e, item.sackId)} className="p-6 bg-white rounded-lg shadow-lg mt-6">
                                    <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

                                    <textarea
                                        value={review}
                                        onChange={handleReviewChange}
                                        placeholder="Write your review here..."
                                        className="w-full p-2 border text-black rounded-md mb-4"
                                        rows="4"
                                    />

                                    <div className="flex items-center mb-4">
                                        <span className="mr-2 text-black">Rate:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRatingClick(star)}
                                                type="button"
                                                className={`text-xl ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>

                                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-md w-full">
                                        Submit Review
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ))}
                {showMapModal && (
                    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="rounded-lg p-6 w-full max-w-4xl shadow-lg relative" style={{
                            background: 'linear-gradient(to bottom right,rgb(15, 90, 47),rgb(33, 181, 97))',
                        }}>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="absolute top-2 right-2 text-white hover:text-white text-2xl"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl text-white font-bold mb-4">Map View</h2>
                            <div className="w-full h-[500px]">
                                <GoogleMapService pickup={pickup} />
                            </div>
                        </div>
                    </div>
                )}
                {showCompleteModal && (
                    <div className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center" style={{
                            background: 'linear-gradient(to bottom right,rgb(15, 90, 47),rgb(33, 181, 97))',
                        }}>
                            <h2 className="text-xl font-semibold mb-3 text-white">Complete Pickup Confirmation</h2>
                            <p className="text-white mb-6">
                                Are you sure all sacks were handed over?
                                <br />
                                Any sacks that weren’t claimed will be redistributed to their respective stalls.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={confirmCompletePickup}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                    disabled={isCompleting}
                                >
                                    {isCompleting ? "Processing..." : "Yes, Complete Pickup"}
                                </button>
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                                    disabled={isCompleting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default PickupDetails;