import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../utils/helpers";

import SearchModal from "../Extras/ModalSearch";
import Notifications from "../Extras/DropdownNotifications";
import Help from "../Extras/DropdownHelp";
import UserMenu from "../Extras/DropdownProfile";
import ThemeToggle from "../Extras/ThemeToggle";

const Header = () => {
  const navigation = useNavigate();

  const [user, setUser] = React.useState(false);
  React.useEffect(() => {
    if (getUser() !== false) {
      setUser(getUser());
    }
  }, []);
  const handleLogout = () => {
    logout(() => {
      navigation("/login");
      window.location.reload();
    });
  };
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <header className="bg-[#255F38] p-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white"> NoWaste </h1>
        <nav>
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

            {/* {user && user.role === "admin" && (
                            <li><a href="/admin" className="text-white hover:text-gray-200">Admin</a></li>
                        )} */}

            {user && user !== false ? (
              <>
                <li>
                  <a href="/profile" className="text-white hover:text-gray-200">
                    Profile
                  </a>
                </li>
                {user.role === "seller" || user.role === "admin" ? (
                  <li>
                    <a
                      href="/dashboard"
                      className="text-white hover:text-gray-200"
                    >
                      Dashboard
                    </a>
                  </li>
                ) : null}
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-gray-200 bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </li>
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
