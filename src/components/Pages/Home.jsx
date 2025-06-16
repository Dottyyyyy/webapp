import React, { useEffect, useState } from "react";
import { getUser } from "../../utils/helpers";
import Sidebar from "../Navigation/Sidebar";
import AdminDashboard from "../Admin/Screen/AdminDashboard";
import '../../index.css';
import ComposterIndex from "../Composter/ComposterIndex";
import UserIndex from "../User/UserIndex";
import Footer from "../Navigation/Footer";
import VendorIndex from "../Vendor/VendorIndex";
import Dashboard from "./Dashboard";
import Header from "../Navigation/Header";
import axios from "axios";

const Home = () => {
  const user = getUser();
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


  const features = [
    {
      title: 'Fresh & Organic',
      desc: 'All our vendors are committed to providing the freshest, highest quality organic produce straight from their farms.',
      icon: '🥗'
    },
    {
      title: 'Fast Pickup',
      desc: 'Schedule convenient pickup times and track your orders in real-time. Get your fresh produce when you need it.',
      icon: '🛻'
    },
    {
      title: 'Local Community',
      desc: 'Support local farmers and small businesses while building stronger community connections through fresh food.',
      icon: '🤝'
    },
  ];

  if (!user) {
    // Show landing page for unauthenticated users
    return (
      <>
        <div id="home" className="text-white px-6 py-20" style={{
          background: 'linear-gradient(to bottom right, #0A4724, #116937)',
        }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1">
              <div className="mb-4 inline-block bg-green-900 px-4 py-2 rounded-full text-sm font-medium border border-green-300">
                🌱 Connect with local partners and reduce waste
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Bridging Waste Alternatives<br />at Your Fingertips
              </h1>
              <p className="text-lg text-green-100 mb-6">
                Discover the best local farmers and vendors at NPTM Market. Fresh vegetables, fruits, and artisanal products delivered straight from farm to table.
              </p>
              <div className="flex gap-4 mb-6">
                <a href="#stalls" className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-100 transition">
                  Top Stalls ⭐
                </a>
                <a href="/about" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-800 transition">
                  Learn More
                </a>
              </div>
              <div className="flex gap-8 text-green-100 font-medium">
                <div><span className="text-white text-xl font-bold">{vendorCount}</span><br />Local Vendors</div>
                <div><span className="text-white text-xl font-bold">500+</span><br />Happy Customers</div>
                <div><span className="text-white text-xl font-bold">{overallAverageRating}★</span><br />Average Rating</div>
              </div>
            </div>

            {/* Right Content - Placeholder for Image */}
            <div className="flex-1">
              <div className="w-full h-full bg-green-700 rounded-xl flex items-center justify-center text-lg text-white border border-green-300">
                <img
                  src="/images/taytay-market.jpg"
                  alt="Food waste management"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div id="about" className="bg-white text-gray-800 px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#0A4724' }}>Why Choose NPTM Market?</h2>
            <p className="text-gray-600 mb-12">
              Experience the best of local farming with our curated selection of vendors and seamless shopping experience.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((item, index) => (
                <div key={index} className="bg-white border border-green-200 rounded-xl shadow p-6 text-left hover:shadow-md transition">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-green-600 text-xl font-bold">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="stalls" className="bg-[#116937] text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Featured Stalls</h2>
            <p className="text-green-100 mb-10">
              Discover some of our most popular vendors offering the best local produce and artisanal goods.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {topVendors.map((vendor, index) => {
                const {
                  name,
                  stall: { stallDescription, stallImage, stallAddress, stallNumber, status },
                  _id
                } = vendor;

                const isOpen = status === 'open';
                const badgeColors = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];
                const badgeColor = badgeColors[index] || 'bg-green-500';

                return (
                  <div
                    key={_id}
                    className="bg-green-800 rounded-xl shadow-lg overflow-hidden border border-green-700 flex flex-col relative"
                  >
                    {/* Top Rank Badge */}
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-black ${badgeColor}`}>
                      Top #{index + 1}
                    </div>

                    <div className="bg-green-600 h-40 flex items-center justify-center">
                      <img
                        src={stallImage?.url}
                        alt={name}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{name}</h3>
                        <p className="text-green-100 text-sm mb-2">{stallDescription}</p>
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <span>{stallAddress}</span>
                          <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{stallNumber}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-sm">
                          <span>
                            {isOpen ? 'Open' : 'Closed'}
                            <span className={`ml-2 w-2 h-2 inline-block rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  }

  // Logged-in user experience
  return (
    <>
      <div className="bg-green-500 h-1 w-full"></div>
      {user.role === "admin" && (
        <>
          <Sidebar />
          <Dashboard />
        </>
      )}
      <div sty className="flex w-full h-full fade-in">
        <div className="w-full">
          {user.role === "vendor" && (
            <>
              <VendorIndex />
            </>
          )}

          {/* Farmer View */}
          {user.role === "farmer" && (
            <>
              <UserIndex />
            </>
          )}

          {user.role === "composter" && (
            <>
              <ComposterIndex />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;