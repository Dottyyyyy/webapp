import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../utils/helpers";

import SearchModal from "../Extras/ModalSearch";
import Notifications from "../Extras/DropdownNotifications";
import Help from "../Extras/DropdownHelp";
import UserMenu from "../Extras/DropdownProfile";
import ThemeToggle from "../Extras/ThemeToggle";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();
  const userData = getUser();
  const userId = userData?._id;
  const [mySack, setMySacks] = useState([]);

  const [user, setUser] = React.useState(false);
  React.useEffect(() => {
    if (getUser() !== false) {
      setUser(getUser());
    }
  }, []);

  const fetchMySacks = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-my-sacks/${userId}`);
      const pendingSacks = data.mySack.filter(sack => sack.status === "pending");

      setMySacks(pendingSacks);
    } catch (error) {
      // console.error("Error fetching:", error);
    }
  };

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
      window.location.reload();
    });
  };

  useEffect(() => {
    if (userId) {
      fetchMySacks();
      const interval = setInterval(() => {
        fetchMySacks();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <header className="bg-[#fffff] p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">
            <a href="/" className="hover:text-gray-200">NoWaste</a>
          </h1>
          <nav>
            <ul className="flex items-center space-x-4">
              <li>
                <a href="/"
                  className="relative flex items-center gap-2 px-4 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                >
                  {user ? "Dashboard" : "Home"}
                </a>
              </li>
              <li>
                <a href="/about"
                  className="relative flex items-center gap-2 px-4 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                >
                  About
                </a>
              </li>

              {user && user !== false ? (
                <>
                  {user && (user.role === "farmer") ? (
                    <li className="flex items-center gap-4">
                      {/* View Sacks Button */}
                      <a
                        href='/viewStalls'
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        Stalls
                      </a>
                      <a
                        href='/pickup'
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        Pickup
                      </a>
                      <a
                        href="/mySack"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        🗑️
                        <span className="ml-1 flex items-center justify-center w-3 mb-3 h-3 text-xs bg-green-500 text-white font-bold rounded-full">
                          {mySack.length || 0}
                        </span>
                      </a>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-red border-2 border-red-600 rounded-md hover:text-red hover:bg-red-600 transition"
                      >
                        Logout
                      </button>
                    </li>

                  ) : null}
                  {user && (user.role === "composter") ? (
                    <li className="flex items-center gap-4">
                      {/* View Sacks Button */}
                      <a
                        href='/composter/market'
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        Stalls
                      </a>
                      <a
                        href='/composter/pickup'
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        Pickup
                      </a>
                      <a
                        href="/mySack"
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-green border-2 border-green-600 rounded-md hover:text-green hover:bg-green-600 transition"
                      >
                        🗑️
                        <span className="ml-1 flex items-center justify-center w-3 mb-3 h-3 text-xs bg-green-500 text-white font-bold rounded-full">
                          {mySack.length || 0}
                        </span>
                      </a>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-red border-2 border-red-600 rounded-md hover:text-red hover:bg-red-600 transition"
                      >
                        Logout
                      </button>
                    </li>

                  ) : null}
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
                  {user && (user.role === "admin") ? (
                    <li className="flex items-center gap-4">
                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="relative flex items-center gap-2 px-5 py-2 text-black font-semibold rounded-full bg-red border-2 border-red-600 rounded-md hover:text-red hover:bg-red-600 transition"
                      >
                        Logout
                      </button>
                    </li>

                  ) : null}
                </>
              ) : (
                <>
                  <li>
                    <a
                      href="/register"
                      className="relative inline-block px-6 py-2 font-bold text-black bg-white border-2 border-green-600 rounded-md hover:text-white hover:bg-green-600 transition"
                    >
                      Register
                    </a>
                  </li>
                  <li>
                    <a
                      href="/login"
                      className="relative inline-block px-6 py-2 font-bold text-black bg-white border-2 border-green-600 rounded-md hover:text-white hover:bg-green-600 transition"
                    >
                      Login
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header >
      <div className="bg-green-500 h-2 w-full">
      </div>
    </>
  );
};

export default Header;