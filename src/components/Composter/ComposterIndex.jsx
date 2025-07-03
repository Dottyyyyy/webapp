import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getUser } from '../../utils/helpers';
import Chart from "chart.js/auto";
import { useNavigate } from 'react-router-dom';

function ComposterIndex() {
  const navigate = useNavigate();
  const user = getUser();
  const userId = user._id;
  const [todaysCollected, setTodaysCollected] = useState(0);
  const [wasteCollected, setWasteCollected] = useState(0);
  const [monthlyWasteCollected, setMonthlyWasteCollected] = useState(0);
  const [activePickupRequest, setActivePickupRequest] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [chartFilter, setChartFilter] = useState('daily');
  const [topVendors, setTopVendors] = useState([]);
  const [vendorCount, setVendorCount] = useState(0);
  const [overallAverageRating, setOverallAverageRating] = useState(0);

  const fetchTopVendors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
      const allUsers = response.data.users;

      const filteredVendors = allUsers
        .filter(user => user.role === 'vendor')
        .map(vendor => {
          const ratings = vendor.stall?.rating || [];
          const ratingSum = ratings.reduce((sum, r) => sum + r.value, 0);
          const avgRating = ratings.length > 0 ? ratingSum / ratings.length : 0;
          return { ...vendor, avgRating, ratingCount: ratings.length, ratingSum };
        });

      const sortedVendors = filteredVendors
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 3);

      const totalRatings = filteredVendors.reduce((acc, vendor) => acc + vendor.ratingCount, 0);
      const totalRatingValue = filteredVendors.reduce((acc, vendor) => acc + vendor.ratingSum, 0);
      const averageOfAllRatings = totalRatings > 0 ? totalRatingValue / totalRatings : 0;

      setTopVendors(sortedVendors);
      setVendorCount(filteredVendors.length);
      setOverallAverageRating(averageOfAllRatings.toFixed(2));
    } catch (error) {
      console.error('Error in getting the users', error);
    }
  };

  useEffect(() => {
    fetchTopVendors();
    const interval = setInterval(() => {
      fetchTopVendors();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchPickupSacks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/sack/get-pickup-sacks/${userId}`);
      const pickups = res.data.pickUpSacks;

      const completedPickups = pickups.filter(p => p.status === 'completed');
      const requestedPickups = pickups.filter(p => p.status !== 'completed');

      let total = 0;
      let thisMonthTotal = 0;
      let todayTotal = 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).toLocaleDateString('en-CA');

      completedPickups.forEach(pickup => {
        const kilo = parseFloat(pickup.totalKilo || 0);
        const pickupDate = new Date(pickup.pickupTimestamp);
        const pickupDateStr = new Date(
          pickupDate.getFullYear(),
          pickupDate.getMonth(),
          pickupDate.getDate()
        ).toLocaleDateString('en-CA');

        total += kilo;

        if (
          pickupDate.getFullYear() === now.getFullYear() &&
          pickupDate.getMonth() === now.getMonth()
        ) {
          thisMonthTotal += kilo;
        }

        if (pickupDateStr === today) {
          todayTotal += kilo;
        }
      });

      setWasteCollected(total);
      setMonthlyWasteCollected(thisMonthTotal);
      setTodaysCollected(todayTotal);
      setActivePickupRequest(requestedPickups.length);

      // Prepare chart data based on the filter selection
      if (chartFilter === 'daily') {
        setChartData(prepareDailyChartData(pickups));
      } else if (chartFilter === 'monthly') {
        setChartData(prepareMonthlyChartData(pickups));
      }
    } catch (error) {
      console.error('Error getting Pickups:', error.message);
    }
  };

  // Function to prepare daily chart data
  const prepareDailyChartData = (pickups) => {
    const dailyData = {};

    pickups.forEach((pickup) => {
      const pickupDate = new Date(pickup.pickupTimestamp);
      const formattedDate = pickupDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dailyData[formattedDate]) {
        dailyData[formattedDate] = 0;
      }

      dailyData[formattedDate] += parseFloat(pickup.totalKilo || 0);
    });

    // Sort the dates in reverse chronological order (most recent last)
    const sortedLabels = Object.keys(dailyData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB; // Sort in ascending order (oldest first)
    });

    // Sort the values to match the sorted labels
    const sortedValues = sortedLabels.map(label => dailyData[label]);

    return {
      labels: sortedLabels,
      values: sortedValues,
    };
  };

  // Function to prepare monthly chart data
  const prepareMonthlyChartData = (pickups) => {
    const monthlyData = {};

    pickups.forEach((pickup) => {
      const pickupMonth = new Date(pickup.pickupTimestamp).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
      if (!monthlyData[pickupMonth]) {
        monthlyData[pickupMonth] = 0;
      }
      monthlyData[pickupMonth] += parseFloat(pickup.totalKilo || 0);
    });

    // Sort the months in reverse chronological order (most recent last)
    const sortedLabels = Object.keys(monthlyData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB; // Sort in ascending order (oldest first)
    });

    // Sort the values to match the sorted months
    const sortedValues = sortedLabels.map(label => monthlyData[label]);

    return {
      labels: sortedLabels,
      values: sortedValues,
    };
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/notifications/get-notif`);
      const spoiledNotifications = data.notifications.filter(notification => notification.type === 'spoiled');
      setNotifications(spoiledNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchPickupSacks();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchPickupSacks();
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, chartFilter]);

  // Initialize chart after chart data is updated
  useEffect(() => {
    if (!chartData.labels.length) return;

    const ctx = document.getElementById('wasteChart').getContext('2d');

    if (window.wasteChartInstance) {
      window.wasteChartInstance.destroy();
    }

    window.wasteChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Kg Collected',
          data: chartData.values,
          backgroundColor: '#32CD32',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: context => `${context.raw.toFixed(2)} kg`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Kilograms'
            }
          },
          x: {
            title: {
              display: true,
              text: chartFilter === 'daily' ? 'Day' : 'Month'
            }
          }
        }
      }
    });
  }, [chartData]);

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0) return `${count} ${i.label}${count !== 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };


  const handleNotificationClick = (stallId) => {
    // console.log(stallId,'stallId')
    navigate(`/composter/market/detail/${stallId}`);
  };

  return (
    <>
      <section
        id="home"
        className="px-6"
        style={{
          background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 10
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-white">
              Welcome, {user.name}
            </h1>
            <div className="inline-block bg-green-900 px-4 py-2 rounded-full text-sm font-medium text-white mb-6 border border-green-300">
              🌱 Connect with local partners and reduce waste
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
              Fresh Local Produce <br /> at Your Fingertips
            </h2>
            <p className="text-lg text-white mb-6">
              Discover the best local farmers at Taytaym, and vendors at New Taytay Public Market. Fresh
              vegetables, fruits, and artisanal products delivered straight from to you.
            </p>
            <div className="mb-6">
              <button className="bg-[#03431A] text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-800 transition">
                Browse Stalls
              </button>
            </div>
            <div className="flex gap-8 text-white font-medium">
              <div>
                <span className="text-white text-xl font-bold">{vendorCount}</span>
                <br />
                Local Vendors
              </div>
              <div>
                <span className="text-white text-xl font-bold">100+</span>
                <br />
                Happy Customers
              </div>
              <div>
                <span className="text-white text-xl font-bold">
                  {overallAverageRating}★
                </span>
                <br />
                Average Rating
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="w-full h-full rounded-xl overflow-hidden border border-green-300 shadow-lg">
              <img
                src="/images/taytay-market.jpg"
                alt="Food waste management"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-[#E9FFF3]">
        <main className="p-6 max-w-7xl mx-auto">
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setChartFilter('daily')}
              className={`px-6 py-2 rounded-full ${chartFilter === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-800'}`}
            >
              Daily Graph
            </button>
            <button
              onClick={() => setChartFilter('monthly')}
              className={`px-6 py-2 rounded-full ${chartFilter === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-800'}`}
            >
              Monthly Graph
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ marginLeft: 225 }}>
                Collected Waste Graph 📊
              </h2>
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ marginRight: 60 }}>
                {user.name}'s Statistics 📶
              </h2>
            </div>
            <div className="relative h-[375px] w-full" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              {chartData.labels.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8 mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {chartFilter === 'daily' ? 'Daily' : 'Monthly'} Collected Waste
                  </h2>
                  <div className="relative h-[225px] w-175">
                    <canvas id="wasteChart"></canvas>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8 text-center text-gray-500">
                  No collection data available yet.
                </div>
              )}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-10">
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-30">
                    <h3 className="text-sm text-gray-500 font-medium">Total Collected</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">{wasteCollected}kg</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-30">
                    <h3 className="text-sm text-gray-500 font-medium">Monthly Average</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">{monthlyWasteCollected}kg</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-30">
                    <h3 className="text-sm text-gray-500 font-medium">Today's Collected</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">{todaysCollected}kg</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-10">
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-25 w-98 mt-5" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h3 className="text-sm text-gray-500 font-medium">Active Requests: </h3>
                    <p className="text-2xl font-bold text-green-600 ml-2">{activePickupRequest}</p>
                  </div>
                </div>
                <div className="flex justify-center ml-15">
                  <div className="mb-10">
                    <br />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="/composter/market/"
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition"
                      >
                        View Available Sacks
                      </a>
                      <a
                        href="/composter/pickup/"
                        className="px-6 py-3 bg-white border border-green-600 text-green-600 font-semibold rounded-full shadow-md hover:bg-green-50 transition"
                      >
                        Pickup Request
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div style={{ background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 50 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Available Sacks</h2>
          <a href="/composter/market" className="text-sm text-white hover:underline">
            View All
          </a>
        </div>
        <div className="grid gap-4">
          {notifications.filter((notif) => !notif.isRead).length > 0 ? (
            notifications
              .filter((notif) => !notif.isRead)
              .slice(0, 5)
              .map((notif, i) => (
                <div
                  key={notif._id || i}
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded cursor-pointer"
                  onClick={() => handleNotificationClick(notif.stall.user)} // Redirect to stall
                >
                  <p className="text-sm font-medium">{notif.message}</p>
                  <p className="text-sm font-medium">{timeAgo(notif.createdAt)}</p>
                </div>
              ))
          ) : (
            <h1 className="text-gray-500">No New Waste Sacks</h1>
          )}
        </div>
      </div>
    </>
  );
}

export default ComposterIndex;