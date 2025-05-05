import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { FaCarSide } from 'react-icons/fa'; // You can import specific icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../index.css'
import Sidebar from '../../Navigation/Sidebar';
import Footer from '../../Navigation/Footer';

const PickupDetails = () => {
    const location = useLocation();
    const { pickupData } = location.state || {};
    const [newPickup, setNewPickup] = useState({});
    const pickup = pickupData || newPickup;
    const [pickupStatus, setPickupStatus] = useState(pickup?.status || newPickup?.status);
    const [sackStatuses, setSackStatuses] = useState({});
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [sellers, setSellers] = useState({});
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;
    console.log(pickup)

    useEffect(() => {
        const fetchSackSellers = async () => {
            try {
                if (!pickup?.sacks || !Array.isArray(pickup.sacks)) return; // ⛔ Prevent running if sacks not loaded

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
            if (!pickup?.sacks || !Array.isArray(pickup.sacks)) return; // ⛔ Prevent running if sacks not loaded

            const statuses = {};
            await Promise.all(
                pickup?.sacks?.map(async (item) => {
                    const response = await axios.get(`${import.meta.env.VITE_API}/sack/see-sacks`, {
                        params: { sackIds: item.sackId }
                    });
                    if (response.data.sacks.length > 0) {
                        statuses[item.sackId] = response.data.sacks[0].status;
                    } else {
                        statuses[item.sackId] = "Not Found";
                    }
                })
            );
            setSackStatuses(statuses);
        } catch (error) {
            console.error("Error fetching sack statuses:", error);
        }
    };
    useEffect(() => {
        fetchAllSackStatuses();
    }, [userId]);

    //Handle Review
    const handleReviewChange = (e) => setReview(e.target.value);

    // Handle rating selection
    const handleRatingClick = (ratingValue) => setRating(ratingValue);

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault(); // prevent default form behavior
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/sack/rate-transaction/${pickup._id}`,
                { review, rating }
            )

            if (data?.pickup) {
                setNewPickup(data.pickup); // update local state with returned pickup
            }

            navigate(-1);
            toast.success("Your Review Was Sent!!");
            // window.location.reload();
        } catch (error) {
            console.log('Error in completing pickup status', error.message)
        }
    };

    const handleCompletePickUpStatus = async () => {
        try {
            const data = await axios.put(`${import.meta.env.VITE_API}/sack/complete-pickup/${pickup._id}`)
            toast.success(
                <div>
                    <p>All orders are all claimed. Thankyou for your service.</p>
                </div>
            );
            navigate(-1)
        } catch (error) {
            console.log('Error in completing pickup status', error.message)
        }
    }

    return (
        <>
            <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Pick up Detail</h1>
                        <p className="text-sm text-gray-600">Pickup #: <span className="font-semibold">{pickup._id}</span></p>
                    </div>

                    <div className="flex items-center gap-4">
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
                            <p className="font-bold text-lg">{pickup.sacks?.length}</p>
                        </div>
                        {pickup.status === 'pending' && (
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow"
                                onClick={handlePickupStatus}
                            >
                                Start Pickup
                            </button>
                        )}
                    </div>
                </div>

                {pickupStatus === "completed" && (
                    <form onSubmit={handleFormSubmit} className="p-6 bg-white rounded-lg shadow-lg mt-6">
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

                {/* Pickup Info Section */}
                {pickup?.sacks?.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl p-6 mb-6 flex gap-6 shadow">
                        {/* Left Column: Image + Stall Info */}
                        <div className="w-1/3">
                            <img
                                src={sellers[item.seller]?.stall?.stallImage?.url || "https://via.placeholder.com/800x400"}
                                alt="Stall"
                                className="w-full h-56 object-cover rounded-xl mb-4"
                            />
                            <div className="bg-gray-100 p-4 rounded-xl">
                                <h3 className="font-bold">Taytay Rizal Market</h3>
                                <p className="text-sm mt-1">Stall #: {item.stallNumber}</p>
                                <p className="text-sm">{sellers[item.seller]?.stall?.stallAddress || "Taytay Rizal New Market"}</p>
                                <p className="text-sm">📅 {new Date(pickup.pickupTimestamp).toLocaleDateString()} {new Date(pickup.pickupTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                                        <p className="text-sm">Spoilage Date: {item.spoilageDate || '12/18/23'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </>
    );
};

export default PickupDetails;