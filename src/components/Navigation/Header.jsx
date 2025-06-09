import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const interval = setInterval(() => {
        fetchMySacks();
      }, 5000);
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
      <header className="bg-[#FFFFFF] p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">
            <a href="/" className="hover:text-gray-200">NoWaste</a>
          </h1>
          <nav>
            <ul className="flex items-center space-x-4">

              {user?.role === "admin" && (
                <Sidebar />
              )}

              {!user || user.role !== "admin" && (
                <>
                  <li>
                    <a
                      href="/"
                      className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                    >
                      {user ? "Dashboard" : "Home"}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/messenger"
                      className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                    >
                      Chats
                    </a>
                  </li>

                  {user?.role === "farmer" && (
                    <li className="flex items-center gap-4">
                      <a href="/viewStalls"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >Stalls</a>
                      <a href="/pickup"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >Pickup</a>
                      <a href="/mySack"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs bg-green-500 text-white font-bold rounded-full">
                          {mySack.length || 0}
                        </span>
                        🗑️
                      </a>
                      <button onClick={handleLogout}
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-red border-2 border-red-600 rounded-md hover:text-red hover:bg-red-600 transition"
                      >
                        Logout
                      </button>
                    </li>
                  )}

                  {user?.role === "composter" && (
                    <li className="flex items-center gap-4">
                      <a href="/composter/market"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition">                        Stalls</a>
                      <a href="/composter/pickup"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition">                        Pickup</a>
                      <a href="/mySack"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition">                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs bg-green-500 text-white font-bold rounded-full">
                          {mySack.length || 0}
                        </span>
                        🗑️
                      </a>
                      <button onClick={handleLogout}
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-red border-2 border-red-600 rounded-md hover:text-red hover:bg-red-600 transition">                        Logout
                      </button>
                    </li>
                  )}
                </>
              )}
              {user && (user.role === "vendor") ? (
                <li className="flex items-center gap-4">
                  {/* Logout Button */}
                  <button
                    onClick={() => navigate(`/vendor/myStall/${user._id}`)}
                    className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                  >
                    My Stall
                  </button>
                  <a
                    href='/vendor/pickup'
                    className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                  >
                    Pickup
                  </a>
                  <button
                    onClick={handleLogout}
                    className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-red border-2 border-red-600 rounded-md hover:text-red hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </li>

              ) : null}
              {!user && (
                <>
                  <li>
                    <a href="/register"
                      className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                    >Register</a>
                  </li>
                  <li>
                    <a href="/login"
                      className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                    >Login</a>
                  </li>
                </>
              )}

            </ul>
          </nav>
        </div>
      </header>

      <div className="bg-green-500 h-2 w-full"></div>

      {/* Optional: Search Modal */}
      {searchModalOpen && <SearchModal />}
    </>
  );
};

export default Header;
