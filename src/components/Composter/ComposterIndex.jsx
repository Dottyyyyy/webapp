import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getUser } from '../../utils/helpers';
import Footer from '../Navigation/Footer';

function ComposterIndex() {
  const user = getUser();
  const userId = user._id
  const [wasteCollected, setWasteCollected] = useState(0);
  const [monthlyWasteCollected, setMonthlyWasteCollected] = useState(0);
  const [activePickupRequest, setActivePickupRequest] = useState(0);
  const [notifications, setNotifications] = useState([]);


  const fetchPickupSacks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/sack/get-pickup-sacks/${userId}`);
      const pickups = res.data.pickUpSacks;

      const completedPickups = pickups.filter(p => p.status === 'completed');
      const requestedPickups = pickups.filter(p => p.status !== 'completed');

      let total = 0;
      let thisMonthTotal = 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      completedPickups.forEach(pickup => {
        const kilo = parseFloat(pickup.totalKilo || 0);
        total += kilo;

        const pickupDate = new Date(pickup.pickupTimestamp);
        if (
          pickupDate.getFullYear() === currentYear &&
          pickupDate.getMonth() === currentMonth
        ) {
          thisMonthTotal += kilo;
        }
      });

      setWasteCollected(total);
      setMonthlyWasteCollected(thisMonthTotal);
      setActivePickupRequest(requestedPickups.length)
    } catch (error) {
      console.error('Error getting Pickups:', error.message);
    }
  };


  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/notifications/users-get-notif/${userId}`);
      const spoiledNotifications = data.notifications.filter(notification => notification.type === 'spoiled');
      console.log(spoiledNotifications);
      setNotifications(spoiledNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };


  useEffect(() => {
    fetchPickupSacks();
    fetchNotifications();
  }, [userId]);
  console.log(notifications, 'Notif')
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="p-8 md:ml-64">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-1">Track and manage your waste collections efficiently.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-sm text-gray-500 font-medium">Total Collected</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{wasteCollected} kg</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-sm text-gray-500 font-medium">Monthly Average</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{monthlyWasteCollected} kg</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-sm text-gray-500 font-medium">Active Requests</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">{activePickupRequest}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/viewstalls" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition">
                View Available Sacks
              </a>
              <a href='/pickup' className="px-6 py-3 bg-white border border-green-600 text-green-600 font-semibold rounded-full shadow-md hover:bg-green-50 transition">
                Pickup Request
              </a>
            </div>
          </div>

          {/* Recent Available Sacks */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Available Sacks</h2>
              <button className="text-sm text-green-700 hover:underline">View All</button>
            </div>
            <div className="grid gap-4">

              {/* Notifications */}
              {notifications.filter((notif) => !notif.isRead).length > 0 ? (
                notifications.filter((notif) => !notif.isRead).map((notif, i) => (
                  <div
                    key={notif._id || i}
                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded"
                  >
                    <p className="text-sm font-medium">{notif.message}</p>
                  </div>
                ))
              ) : (
                <h1>No New Spoiled Sacks</h1>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
export default ComposterIndex