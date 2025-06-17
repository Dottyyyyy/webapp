import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Utils
import { getUser, logout } from "../../utils/helpers";

// Components
import Sidebar from "./Sidebar";
import SearchModal from "../Extras/ModalSearch";
import Notifications from "../Extras/DropdownNotifications";
import Help from "../Extras/DropdownHelp";
import UserMenu from "../Extras/DropdownProfile";
import ThemeToggle from "../Extras/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mySack, setMySacks] = useState([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const userData = getUser();
  const userId = userData?._id;

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMySacks();
      const interval = setInterval(() => fetchMySacks(), 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchMySacks = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-my-sacks/${userId}`);
      const pendingSacks = data.mySack.filter(sack => sack.status === "pending");
      setMySacks(pendingSacks);
    } catch (error) {
      // console.error("Error fetching sacks:", error);
    }
  };

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
      window.location.reload();
    });
  };

  return (
    <>
      <header className="bg-[#EBFFF3] p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo and App Title */}
          <Link to="/">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-bold">♻️</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-green-900">
                  {user ? "No Waste" : "NPTM Market"}
                </h1>
                <p className="text-xs text-green-700 -mt-1">
                  {user
                    ? "Bridging waste from NPTM to Pig Farmers / Composters"
                    : "Local • Sustainable • Waste"}
                </p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {/* Admin View */}
            {user?.role === "admin"}

            {/* Vendor View */}
            {user?.role === "vendor" && (
              <>
                <div className="flex items-center space-x-8 text-green-900 font-medium">
                  <a href='/' className="hover:underline">Home</a>
                  <button onClick={() => navigate(`/vendor/myStall/${user._id}`)} className="hover:underline underline-offset-4 decoration-green-600">My stall</button>
                  <a href="/about" className="hover:underline">About</a>
                  <a href="/messenger" className="hover:underline">Chats</a>
                  <a href='/vendor/pickup' className="hover:underline font-semibold">Pick up</a>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold transition" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                      <span className="text-xl">👤</span> {user?.name} ▼
                    </button>
                    <div className="absolute right-0 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50" style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                      <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
                      <a href="/vendor/market-list" className="block px-4 py-2 hover:bg-gray-100">MarketList</a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Farmer/Composter View */}
            {(user?.role === "farmer" || user?.role === "composter") && (
              <>
                <div className="flex items-center space-x-8 text-green-900 font-medium">
                  <a href="/" className="hover:underline underline-offset-4 decoration-green-600">Home</a>
                  <a href={user.role === "farmer" ? "/viewStalls" : "/composter/market"} className="hover:underline">Stalls</a>
                  <a href="/about" className="hover:underline">About</a>
                  <a href="/messenger" className="hover:underline">Chats</a>
                  <a href={user.role === "farmer" ? "/pickup" : "/composter/pickup"} className="hover:underline font-semibold">Pick up</a>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold transition" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                      <span className="text-xl">👤</span> {user?.name || "Farmer"} ▼
                    </button>
                    <div className="absolute right-0 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50" style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                      <a href="/mySack" className="block px-4 py-2 hover:bg-gray-100">My Sack</a>
                      <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Guest View */}
            {!user && (
              <>
                <div className="flex items-center space-x-8 text-green-900 font-medium">
                  <a href="/" className="hover:underline">Home</a>
                  <a href="/about" className="hover:underline">About</a>
                </div>
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-green-900 font-medium hover:underline">Login</Link>
                  <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-full shadow">Get Started</Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Accent Divider */}
      <div className="bg-green-500 h-2 w-full"></div>

      {/* Optional: Search Modal */}
      {searchModalOpen && <SearchModal />}
    </>
  );
};

export default Header;