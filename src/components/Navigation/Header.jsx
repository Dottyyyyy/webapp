import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../utils/helpers";

import SearchModal from "../Extras/ModalSearch";
import Notifications from "../Extras/DropdownNotifications";
import Help from "../Extras/DropdownHelp";
import UserMenu from "../Extras/DropdownProfile";
import ThemeToggle from "../Extras/ThemeToggle";
import axios from "axios";

const Header = () => {
  const navigation = useNavigate();
  const userData = getUser();
  const userId = userData._id;
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
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchMySacks()
  }, []);

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <header className="bg-[#255F38] p-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center mr-20">
        <h1 className="text-3xl font-bold text-white">
          <a href="/" className="hover:text-gray-200">NoWaste</a>
        </h1>
        <nav className="mr-13">
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="text-white hover:text-gray-200">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="text-white hover:text-gray-200">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="text-white hover:text-gray-200">
                Contact
              </a>
            </li>

            {user && user !== false ? (
              <>
                {user && (user.role === "farmer" || user.role === "composter") ? (
                  <li className="relative ">
                    <a
                      href="/MySack"
                      className="text-white hover:text-gray-200 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 2C8.134 2 5 5.134 5 9c0 3.866 3.134 7 7 7s7-3.134 7-7c0-3.866-3.134-7-7-7zM5 9c0 3.866 3.134 7 7 7s7-3.134 7-7"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 9c0 3.866 3.134 7 7 7s7-3.134 7-7"
                        />
                      </svg>
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                        {mySack.length || 0}
                      </span>
                    </a>
                  </li>
                ) : null}
              </>
            ) : (
              <>
                <li>
                  <a href="/login" className="text-white hover:text-gray-200">
                    Login
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;