import React from "react";
import { getUser } from "../../utils/helpers";
import Sidebar from "../Navigation/Sidebar";
import AdminDashboard from "../Admin/Screen/AdminDashboard";
import '../../index.css'
import ComposterIndex from "../Composter/ComposterIndex";

const Home = () => {
  const user = getUser();

  if (!user) {
    // Show landing page for unauthenticated users
    return (
      <div className="min-h-screen fade-in bg-gradient-to-br from-green-50 to-green-100">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between px-10 py-20">
          <div className="max-w-xl mb-10 lg:mb-0">
            <h1 className="text-4xl font-extrabold text-green-900 mb-4">
              Welcome to <span className="text-green-600">No Waste</span>
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Bridging the gap between <strong>pig farmers</strong>, <strong>composters</strong>, and <strong>market vendors</strong> by redistributing vegetable waste — all at no cost!
            </p>
            <a
              href="/login"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
            >
              Get Started
            </a>
          </div>
          <img
            src="/images/images.jpg"
            alt="Farmers collecting waste"
            className="w-full max-w-md rounded-lg shadow-lg h-70 w-100"
          />
        </section>

        {/* How It Works */}
        <section className="bg-white py-16 px-10">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-10">How No Waste Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-green-100 p-6 rounded-lg text-center shadow">
              <img src="/images/vendor.jpg" alt="Vendor" className="w-24 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Vendors</h3>
              <p className="text-gray-700">List unsold and spoiled vegetables instead of throwing them away.</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg text-center shadow">
              <img src="/images/farmer-composter.png" alt="Farmer" className="w-44 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Farmers & Composters</h3>
              <p className="text-gray-700">Pick up food waste for pig feed or composting, free of charge.</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg text-center shadow">
              <img src="/images/taytay-market.jpg" alt="Track waste" className="w-44 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track & Reduce Waste</h3>
              <p className="text-gray-700">Monitor data, reduce environmental impact, and promote sustainability.</p>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-16 px-10 bg-gradient-to-r from-green-100 to-green-200 text-center">
          <h2 className="text-3xl font-bold text-green-900 mb-4">Join our No Waste Movement</h2>
          <p className="text-lg text-gray-700 mb-6">Start reducing waste and making a difference today!</p>
          <a
            href="/register"
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-800 transition"
          >
            Sign Up for Free
          </a>
        </section>
      </div>
    );
  }

  // Logged-in user experience
  return (
    <div className="flex w-full h-full fade-in">
      <div className="flex-grow p-8 bg-gradient-to-br from-green-50 to-green-100 w-full h-full">
        {/* Admin View */}
        {user.role === "admin" && (
          <>
            <Sidebar />
            <AdminDashboard />
          </>
        )}

        {/* Vendor View */}
        {user.role === "vendor" && (
          <>
            <Sidebar />
            <div className="min-h-screen bg-green-50 flex flex-col items-center p-6">
              {/* Header */}
              <div className="text-center mt-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-green-900">
                  Welcome, Vendor {user.name}
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
          </>
        )}

        {/* Farmer View */}
        {user.role === "farmer" && (() => {
          const totalCollected = 250;
          const monthlyAverage = 45;
          const activeRequests = 2;
          const recentSacks = [
            { marketName: "Fresh Harvest Market", weight: 25, timeRemaining: "5 hours" },
            { marketName: "Green Garden Stall", weight: 18, timeRemaining: "3 hours" },
            { marketName: "Organic Oasis", weight: 30, timeRemaining: "1 hour" },
          ];
          return (
            <>
              <Sidebar />
              <h1 className="text-3xl font-extrabold text-green-900">Welcome, Farmer {user.name}</h1>
              <p className="text-md text-gray-700 mt-2">Track and manage your waste collections efficiently.</p>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
                <div className="p-6 bg-white shadow rounded-xl border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Total Collected</h2>
                  <p className="text-3xl font-bold text-green-700 mt-2">{totalCollected} kg</p>
                </div>
                <div className="p-6 bg-white shadow rounded-xl border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Monthly Average</h2>
                  <p className="text-3xl font-bold text-green-700 mt-2">{monthlyAverage} kg</p>
                </div>
                <div className="p-6 bg-white shadow rounded-xl border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Active Requests</h2>
                  <p className="text-3xl font-bold text-green-700 mt-2">{activeRequests}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                    View Available Sacks
                  </button>
                  <button className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                    My Collection History
                  </button>
                </div>
              </div>

              {/* Recent Available Sacks */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Available Sacks</h2>
                  <button className="text-sm text-green-700 hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {recentSacks.map((sack, index) => (
                    <div
                      key={index}
                      className="p-6 bg-white shadow-lg rounded-xl flex justify-between items-center border border-gray-200"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{sack.marketName}</h3>
                        <p className="text-sm text-gray-600">{sack.weight} kg</p>
                      </div>
                      <p className="text-sm text-gray-500">Time remaining: {sack.timeRemaining}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {user.role === "composter" && (
          <>
            <Sidebar />
            <ComposterIndex />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;