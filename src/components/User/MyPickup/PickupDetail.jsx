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
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedSackId, setSelectedSackId] = useState(null);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;
    const [showMapModal, setShowMapModal] = useState(false);
    const [showBuildingMapModal, setshowBuildingMapModal] = useState(false);

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
            await axios.put(`${import.meta.env.VITE_API}/sack/complete-pickup/${pickup._id}`, { role: user.role });
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

    const handleClaimSack = (sackId) => {
        setSelectedSackId(sackId);
        setShowConfirm(true);
    };

    const confirmClaim = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API}/sack/claim-sack/${selectedSackId}`);
            setShowConfirm(false);
            setClaimSuccess(true);

            setTimeout(() => {
                setClaimSuccess(false)
                navigate(-1);
            }, 1500);
        } catch (error) {
            console.error("Error claim sack:", error.message);
            alert("Failed to claim the sack.");
        }
    };
    const normalize = str => str?.replace(/[-\s]/g, '').toLowerCase();
    const highlightedStalls = pickup?.sacks
        ?.filter(s => s.status !== "cancelled")
        .map(s => normalize(s.stallNumber));
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
                        <>
                            <button
                                onClick={() => setShowMapModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs font-medium rounded-full shadow-md transition"
                            >
                                🗺️ View Map
                            </button>
                            <button
                                onClick={() => setshowBuildingMapModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs font-medium rounded-full shadow-md transition"
                            >
                                🗺️ Building Map
                            </button>
                        </>
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
            {pickup?.sacks?.filter(s => s.status !== "cancelled").map((item, idx) => {
                const sackStatus = sackStatuses[item.sackId.toString()] || "Loading...";
                const backgroundColor = sackStatus === "claimed" ? "#009E60" : "white";

                return (
                    <div key={item._id} className="rounded-2xl shadow-xl overflow-hidden mb-8 flex flex-col md:flex-row" style={{
                        backgroundColor
                    }}>
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

                        {/* Building Map Modal */}
                        {showBuildingMapModal && (
                            <div className="fixed inset-0 bg-opacity-60 z-50 flex items-center justify-center">
                                <div className="bg-white p-4 max-h-[90vh] max-w-[95vw] overflow-auto rounded shadow-lg">
                                    <div className="text-center text-xl font-bold mb-4 text-black">Building C Layout</div>
                                    <button
                                        onClick={() => setshowBuildingMapModal(false)}
                                        className="absolute top-50 right-40 font-bold text-lg text-white-800 bg-[red]"
                                        style={{ padding: 4, borderRadius: 10, width: '4%' }}
                                    >
                                        Close
                                    </button>

                                    <div className="flex flex-col items-start justify-start mb-4">
                                        <div className="mb-4 text-xs text-black">
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-green-400 rounded-sm border" /> <span>Stall/s To Pickup</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-black rounded-sm border" /> <span>Regular Stall</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-yellow-200 rounded-sm border" /> <span>Hallway</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-red-500 rounded-sm border" /> <span>Entrance / Exit / Stairs</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-gray-300 rounded-sm border" /> <span>BLDG C Office</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-4 text-[10px] font-semibold">
                                        {/* Left Vertical Stalls and Stairs */}
                                        <div className="flex flex-col gap-[1px] mt-30">
                                            {['B-01 S-45', 'B-01 S-44', 'B-01 S-43', 'B-01 S-42', 'B-01 S-41'].map((stall, idx) => (
                                                <div key={idx} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                    ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                    }`}>
                                                    {stall}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Center Block (LEFT HALF) */}
                                        <div className="flex flex-col gap-1">
                                            {/* B04 */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-04 S-01', 'B-04 S-02', 'B-04 S-03', 'B-04 S-04', 'B-04 S-05', 'B-04 S-06', 'B-04 S-07', 'B-04 S-08', 'B-04 S-09', 'B-04 S-10'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'}`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-yellow-200 text-center py-1 font-bold text-black">HALLWAY</div>
                                            {/* B03 */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-03 S-09', 'B-03 S-10', 'B-03 S-11', 'B-03 S-12', 'B-03 S-13', 'B-03 S-14', 'B-03 S-15', 'B-03 S-16', 'B-03 S-17', 'B-03 S-18'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-yellow-200 text-center py-1 font-bold text-black">HALLWAY</div>
                                            {/* B02 (2 rows) */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['', '', 'B-02 S-11', 'B-02 S-12', 'B-02 S-13', 'B-02 S-14', 'B-02 S-15', 'B-02 S-16', 'B-02 S-17', 'B-02 S-18'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-02 S-01', 'B-02 S-02', 'B-02 S-03', 'B-02 S-04', 'B-02 S-05', 'B-02 S-06', 'B-02 S-07', 'B-02 S-08', 'B-02 S-09', 'B-02 S-10'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-yellow-200 text-center py-1 font-bold text-black">HALLWAY</div>
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['', 'B-01 S-03', '', 'B-01 S-05', '', '', '', '', '', ''].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* B01 (2 rows with B-01-S-05 under B-01-S-04) */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-01 S-01', 'B-01 S-02', 'B-01 S-04', 'B-01 S-06', 'B-01 S-07', 'B-01 S-08', 'B-01 S-09', 'B-01 S-10', 'B-01 S-11', 'B-01 S-12'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border bg-yellow-200 text-center font-bold text-[12px] px-4 py-10 mt-2 text-black">HALLWAY</div>

                                        {/* Center Block (RIGHT HALF) */}
                                        <div className="flex flex-col gap-1 mt-7">
                                            {/* B04 */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-04 S-11', 'B-04 S-12', 'B-04 S-13', 'B-04 S-14', 'B-04 S-15', 'B-04 S-16', 'B-04 S-17', 'B-04 S-18', 'B-04 S-19', 'B-04 S-20'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-yellow-200 text-center py-1 font-bold text-black">HALLWAY</div>
                                            {/* B03 */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-03 S-21', 'B-03 S-22', 'B-03 S-23', 'B-03 S-24', 'B-03 S-25', 'B-03 S-26', 'B-03 S-27', 'B-03 S-28', 'B-03 S-29', 'B-03 S-30'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-yellow-200 text-center py-1 font-bold text-black">HALLWAY</div>
                                            {/* B02 */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-02 S-19', 'B-02 S-20', 'B-02 S-21', 'B-02 S-22', 'B-02 S-23', 'B-02 S-24', 'B-02 S-25', 'B-02 S-26', 'B-02 S-27', 'B-02 S-28'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-yellow-200 text-center py-1 font-bold text-black">HALLWAY</div>
                                            {/* B01 (2 rows) */}
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-01 S-24', 'B-01 S-25', 'B-01 S-26', 'B-01 S-27', 'B-01 S-28', 'B-01 S-29', 'B-01 S-30', 'B-01 S-31', 'B-01 S-32', ''].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-10 gap-[1px]">
                                                {['B-01 S-14', 'B-01 S-15', 'B-01 S-16', 'B-01 S-17', 'B-01 S-18', 'B-01 S-19', 'B-01 S-20', 'B-01 S-21', 'B-01 S-22', 'B-01 S-23'].map((stall, i) => (
                                                    <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                        ? 'bg-green-800 text-white font-bold' : 'bg-black text-white'
                                                        }`}>
                                                        {stall}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border bg-yellow-200 text-center font-bold text-[12px] px-4 py-10 mt-2 text-black">HALLWAY</div>

                                        {/* Side Column with Office and Final Stalls */}
                                        <div className="flex flex-col justify-between gap-[1px] ml-2">
                                            <div className="border bg-gray-300 text-center font-bold p-4">
                                                <span style={{ color: 'black' }}>
                                                    BLDG C OFFICE
                                                </span>
                                            </div>
                                            {['B-03 S-31', 'B-03 S-32', 'B-02 S-83', 'B-02 S-84', 'B-01 S-33', 'B-01 S-34', 'B-01 S-35'].map((stall, i) => (
                                                <div key={i} className={`border text-center p-1 ${highlightedStalls.includes(normalize(stall))
                                                    ? 'bg-green-400 text-white font-bold' : 'bg-black text-white'
                                                    }`}>
                                                    {stall}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border bg-yellow-200 text-center font-bold text-[12px] px-4 py-2 mt-2 text-black">HALLWAY</div>

                                    {/* Footer: Entrance and Exit */}
                                    <div className="flex flex-row justify-between mt-4">
                                        <div className="border bg-red-500 text-center font-bold text-[12px] px-4 py-2">ENTRANCE</div>
                                        <div className="border bg-red-500 text-center font-bold text-[12px] px-4 py-10 mt-2">STAIRS</div>

                                        <div className="border bg-red-500 text-center font-bold text-[12px] px-4 py-2">EXIT</div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    <p className='text-black'>📝 <span className="font-medium text-black">Description:</span> {item.description || "Mixed Vegetables"}</p>
                                    <p className='text-black'>⚖️ <span className="font-medium text-black">Weight:</span> {item.kilo} kg</p>
                                    <p className='text-black'>📆 <span className="font-medium text-black">Spoils on:</span>{" "}
                                        {new Date(item.dbSpoil).toLocaleDateString("en-US", {
                                            year: "numeric", month: "long", day: "numeric"
                                        })}
                                    </p>
                                </div>
                                {pickup.status === "pickup" && sackStatus !== "claimed" && (
                                    <button
                                        onClick={() => handleClaimSack(item.sackId)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl shadow transition"
                                    >
                                        ✔ Claim
                                    </button>
                                )}
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
                                        className="w-full border border-gray-300 rounded-md p-3 mb-4 text-sm text-black"
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
                );
            })}

            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="relative bg-gradient-to-br from-green-900 to-green-500 p-6 rounded-xl w-full max-w-4xl shadow-lg">
                        <button onClick={() => setShowMapModal(false)} className="absolute top-2 right-4 text-white text-2xl">&times;</button>
                        <h2 className="text-xl text-white font-bold mb-4">📍 Map View</h2>
                        <div className="w-full h-[500px]">
                            <GoogleMapService pickup={pickup} />
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-[#355E3B] p-6 rounded-xl shadow-lg max-w-sm w-full">
                        <div style={{ display: 'flex', justifySelf: 'center' }}>
                            <h2 className="font-bold mb-4" style={{ fontSize: 80, padding: 1, backgroundColor: 'white', borderRadius: 60 }}>❓</h2>
                        </div>
                        <p className="text-white mb-6">
                            Are you sure you want to claim this item?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={confirmClaim}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Temporary success message */}
            {claimSuccess && (
                <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow">
                    Sack successfully claimed!
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