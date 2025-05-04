import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { FaCarSide } from 'react-icons/fa'; // You can import specific icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../index.css'
import Sidebar from '../../Navigation/Sidebar';

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
        <div className="flex flex-col fade-in p-5 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold text-center mb-6">See Pick Up</h1>

            <div className="bg-gray-700 rounded-xl p-6 mb-6">
                <div className="flex justify-between">
                    {pickupStatus !== "pickup" && pickupStatus !== "completed" && (
                        <button className="bg-green-500 text-white p-2 rounded-lg flex flex-col items-center" onClick={handlePickupStatus}>
                            <FaCarSide size={35} color="black" />
                            <span>Pickup</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-center bg-green-900 p-6 rounded-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100"
                        height="100"
                        fill="white"
                        className="mb-4"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2L15 6H9L12 2ZM18 8H6L3 20H21L18 8ZM12 19C10.34 19 9 17.66 9 16H15C15 17.66 13.66 19 12 19Z" />
                    </svg>
                    <div className="text-xl font-bold mb-2">{pickup.totalKilo} KG</div>
                    <div>Status: {pickupStatus}</div>
                    {pickupStatus !== "completed" && (
                        <div className="mt-2">
                            Pickup Time: {new Date(new Date(pickup.pickupTimestamp).getTime()).toLocaleDateString("en-US", {
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
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Stall/s Info</h2>

            <div className="space-y-4">
                {pickup?.sacks?.map((item) => (
                    <div key={item._id} className="bg-gray-600 rounded-xl p-4 flex items-center">
                        <img
                            src={sellers[item.seller]?.stall?.stallImage?.url || "https://via.placeholder.com/150"}
                            alt="Stall"
                            className="w-16 h-16 rounded-lg mr-4"
                        />
                        <div className="flex-1">
                            <div className="text-sm text-white">Stall #: {item.stallNumber}</div>
                            <div className="text-sm text-white">Seller: {sellers[item.seller]?.name || "Unknown"}</div>
                            <div className="text-sm text-white">Stall Address: {sellers[item.seller]?.stall?.stallAddress || "Unknown"}</div>
                            <div className="text-sm">{sellers[item.seller]?.stall?.status === "open" ? "Open: 🟢" : "Close: 🔴"}</div>
                        </div>
                    </div>
                ))}
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

            {pickupStatus !== "completed" && Object.values(sackStatuses).length > 0 && Object.values(sackStatuses).every(status => status === "claimed") && (
                <div>
                    <button
                        className="bg-green-300 p-3 rounded-full mt-6 text-black w-full"
                        onClick={handleCompletePickUpStatus}
                    >
                        All Claimed
                    </button>
                </div>

            )}

            <div className="flex overflow-x-scroll mt-6 space-x-4">
                {pickup?.sacks?.map((item) => {
                    const sackStatus = sackStatuses[item.sackId] || "Loading...";
                    const backgroundColor = sackStatus === "claimed" ? "#AFE1AF" : "gray";
                    return (
                        <div
                            key={item._id}
                            className="flex items-center p-4 rounded-xl"
                            style={{ backgroundColor }}
                        >
                            <img
                                src={item.images[0]?.url || "https://via.placeholder.com/150"}
                                alt="Sack"
                                className="w-16 h-16 rounded-lg mr-4"
                            />
                            <div className="bg-white p-4 rounded-lg">
                                <div className="text-sm text-black">Stall# {item.stallNumber}</div>
                                <div className="text-sm text-black">Weight: {item.kilo} KG</div>
                                <div className="text-sm text-black">Status: {sackStatus}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PickupDetails;