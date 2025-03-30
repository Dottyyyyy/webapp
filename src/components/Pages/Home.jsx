import React from "react";
import { getUser } from "../../utils/helpers";
import Sidebar from "../Navigation/Sidebar";

const Home = () => {
  const user = getUser();

  return (
    <div className="flex w-full h-full">

      {/* Main Content */}
      <div className="flex-grow p-8 bg-gradient-to-br from-green-50 to-green-100">
        {/* Admin View */}
        {user && user.role === "admin" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-green-900">Welcome, Admin {user.name}</h1>
              <p className="text-md text-gray-700 mt-2">
                Manage the platform and oversee user activities.
              </p>
            </div>
          </>
        )}

        {/* Vendor View */}
        {user && user.role === "vendor" && (
          <>
            <Sidebar user={user} />

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-green-900">Welcome, Vendor {user.name}</h1>
              <p className="text-md text-gray-700 mt-2">
                Manage your waste sacks and requests efficiently.
              </p>
            </div>
          </>
        )}

        {/* Farmer View */}
        {user && user.role === "farmer" && (
          <>
            <Sidebar user={user} /> {/* Pass the user object as a prop */}

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-green-900">Welcome, Farmer {user.name}</h1>
              <p className="text-md text-gray-700 mt-2">
                Track and manage your waste collections efficiently.
              </p>
            </div>

            {/* Farmer-Specific Data */}
            {(() => {
              const totalCollected = 250; // Sample data
              const monthlyAverage = 45; // Sample data
              const activeRequests = 2; // Sample data
              const recentSacks = [
                { marketName: "Fresh Harvest Market", weight: 25, timeRemaining: "5 hours" },
                { marketName: "Green Garden Stall", weight: 18, timeRemaining: "3 hours" },
                { marketName: "Organic Oasis", weight: 30, timeRemaining: "1 hour" },
              ];

              return (
                <>
                  {/* Statistics Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Total Collected</h2>
                      <p className="text-3xl font-bold text-green-700 mt-2">{totalCollected} kg</p>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Monthly Average</h2>
                      <p className="text-3xl font-bold text-green-700 mt-2">{monthlyAverage} kg</p>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Active Requests</h2>
                      <p className="text-3xl font-bold text-green-700 mt-2">{activeRequests}</p>
                    </div>
                  </div>

                  {/* Quick Actions Section */}
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

                  {/* Recent Available Sacks Section */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Home;