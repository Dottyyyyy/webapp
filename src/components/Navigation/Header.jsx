import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../utils/helpers";

import SearchModal from "../Extras/ModalSearch";
import Notifications from "../Extras/DropdownNotifications";
import Help from "../Extras/DropdownHelp";
import UserMenu from "../Extras/DropdownProfile";
import ThemeToggle from "../Extras/ThemeToggle";
import axios from "axios";
import Sidebar from "./Sidebar";

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
      <header className="bg-[#FFFFFF] p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">
            <a href="/" className="hover:text-gray-200">NoWaste</a>
          </h1>
          <nav>
            <ul className="flex items-center space-x-4">
              {user && (
                <Sidebar />
              )}
              {!user && (
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