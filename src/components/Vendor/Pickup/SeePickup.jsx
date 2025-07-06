import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../index.css';

const SeePickUp = () => {
  const location = useLocation();
  const { pickupData } = location.state || {};
  const pickup = pickupData;
  const user = getUser();
  const sellerId = user._id;
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [status, setStatus] = useState('Pending');

  const mySacks = pickup.sacks?.filter((sack) => sack.seller === sellerId) || [];
  const totalSellerKilo = mySacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);

  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/get-user/${pickup.user}`);
        setBuyer(response.data.user);
      } catch (error) {
        console.error('Error fetching buyer details:', error);
      }
    };

    const fetchSackStatus = async () => {
      try {
        const sackIds = mySacks.map((sack) => sack.sackId);
        const response = await axios.get(`${import.meta.env.VITE_API}/sack/see-sacks`, {
          params: { sackIds }
        });
        const allClaimed = response.data.sacks.every((sack) => sack.status === 'claimed');
        if (allClaimed) setStatus('Claimed');
      } catch (error) {
        console.error('Error checking sack status:', error);
      }
    };

    if (pickup._id) {
      fetchBuyer();
      fetchSackStatus();
    }
  }, [pickup._id]);

  const handleCompleteSackStatus = async () => {
    try {
      const sackIds = mySacks.map((sack) => sack.sackId);
      await axios.put(`${import.meta.env.VITE_API}/sack/update-status`, {
        status: 'claimed',
        sackIds
      });
      toast.success('All sacks marked as claimed.');
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error('Error updating sack status:', error);
    }
  };
  console.log(pickup, 'pickup')
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081c15] to-[#1b4332] text-white px-4 py-6 sm:px-8 md:px-12 lg:px-24 xl:px-40 font-sans">
      <ToastContainer />
      <div className="w-full max-w-6xl mx-auto bg-[#f1f5f9] text-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 relative transition-all duration-300 ease-in-out">
        {/* Status Badge */}
        <span
          className={`absolute top-6 right-6 px-4 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide
          ${status === 'Claimed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
        >
          {status}
        </span>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b4332] mb-2">
          Pickup Request
        </h1>
        <p className="text-sm text-green-700 font-mono mb-6 tracking-wider">
          Request ID: {pickup._id.slice(-6).toUpperCase()}
        </p>

        {/* Summary Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white shadow-inner rounded-xl p-4 hover:shadow-lg transition">
            <p className="text-sm text-gray-500">Total Waste</p>
            <p className="text-3xl font-bold text-green-900">{totalSellerKilo} kg</p>
          </div>
          <div className="bg-white shadow-inner rounded-xl p-4 hover:shadow-lg transition">
            {pickup.status !== "completed" && (
              <div>
                <p className="text-sm text-gray-500">Pickup Schedule</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(pickup.pickupTimestamp).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}{' '}
                  at{' '}
                  {new Date(pickup.pickupTimestamp).toLocaleTimeString('en-US', {
                    timeZone: 'UTC',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            )}
            {pickup.status === "completed" && (
              <div>
                <p className="text-sm text-gray-500">Pickup Completed On:</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(pickup.pickedUpDate).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}{' '}
                  at{' '}
                  {new Date(pickup.pickedUpDate).toLocaleTimeString('en-US', {
                    timeZone: 'UTC',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </p>

              </div>
            )}
          </div>
        </div>

        {/* Collector Info */}
        {buyer && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#1b4332] mb-4">Collector Info</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <img
                src={buyer.avatar?.url || 'https://via.placeholder.com/80'}
                alt="collector"
                className="w-24 h-24 rounded-full border-4 border-green-500 shadow-md"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm w-full">
                <div><span className="font-semibold">Name:</span> {buyer.name}</div>
                <div><span className="font-semibold">Email:</span> {buyer.email}</div>
                <div className="sm:col-span-2">
                  <span className="font-semibold">Address:</span>{' '}
                  {buyer.address?.lotNum}, {buyer.address?.street}, {buyer.address?.baranggay}, {buyer.address?.city}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        {pickup.status !== 'completed' && (
          <div className="text-center mb-12">
            <button
              onClick={handleCompleteSackStatus}
              className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full text-sm sm:text-base font-semibold shadow-lg transition duration-200"
            >
              ✅ Confirm Sack Handover
            </button>
          </div>
        )}

        {/* Sacks */}
        <h2 className="text-xl font-semibold text-[#1b4332] mb-4">Sack Details</h2>
        <div className="space-y-4">
          {mySacks.map((item, idx) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 w-full">
                <img
                  src={item.images[0]?.url || 'https://via.placeholder.com/80'}
                  alt="sack"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold text-gray-800">Stall {item.stallNumber}</p>
                  <p className="text-sm text-gray-600">{item.kilo} kg - {item.description}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500 sm:w-1/3">{item.location}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeePickUp;