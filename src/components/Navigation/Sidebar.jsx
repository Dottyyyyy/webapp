import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../utils/helpers";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons for menu toggle

const Sidebar = () => {
  const navigation = useNavigate();
  const [user, setUser] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const sidebarRef = React.useRef(null);

  React.useEffect(() => {
    if (getUser() !== false) {
      setUser(getUser());
    }
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout(() => {
      navigation("/login");
      window.location.reload();
    });
  };

  const adminMenuItems = {
    top: [
      { name: "Manage Users", icon: "👥" },
      { name: "System Settings", icon: "⚙️" },
    ],
    bottom: [
      {
        name: "Profile",
        icon: "👤",
        action: () => navigation("/profile"),
      },
      {
        name: "Logout",
        icon: "🔓",
        action: handleLogout,
        onClick: handleLogout,
      },
    ],
  };

  const vendorMenuItems = {
    top: [
      { name: "View Request", icon: "📨" },
      { name: "Manage Sacks", icon: "🎒" },
    ],
    bottom: [
        {
          name: "Profile",
          icon: "👤",
          action: () => navigation("/profile"),
        },
        {
          name: "Logout",
          icon: "🔓",
          action: handleLogout,
          onClick: handleLogout,
        },
      ],
  };

  const farmerMenuItems = {
    top: [
      { 
        name: "View Stalls", 
        icon: "🏪",
        action: () => navigation("/viewstalls"),
      },
      { name: "Manage Sacks", icon: "🎒" },
      { name: "Notifications", icon: "🔔" },
    ],
    bottom: [
      {
        name: "Profile",
        icon: "👤",
        action: () => navigation("/profile"),
      },
      { 
        name: "Dashboard", 
        icon: "📊",
        action: () => navigation("/dashboard"),
      },
      {
        name: "Logout",
        icon: "🔓",
        action: handleLogout,
        onClick: handleLogout,
      },
    ],
  };

  const composterMenuItems = {
    top: [{ name: "View Market", icon: "♻️" }],
    bottom: [{ name: "Composting Guide", icon: "📘" }],
  };

  const renderMenuItems = (menuItems) => (
    <>
      <ul>
        {menuItems.top.map((item, index) => (
          <li
            key={`top-${index}`}
            className="flex items-center p-4 hover:bg-gray-700 cursor-pointer"
            onClick={item.action || null}
          >
            <span className="text-2xl mr-4">{item.icon}</span>
            <span className="text-lg">{item.name}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-auto">
        {menuItems.bottom.map((item, index) => (
          <li
            key={`bottom-${index}`}
            className="flex items-center p-4 hover:bg-gray-700 cursor-pointer"
            onClick={item.action || null}
          >
            <span className="text-2xl mr-4">{item.icon}</span>
            <span className="text-lg">{item.name}</span>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div>
      {/* Toggle Button */}
      <button
        className={`p-4 bg-gray-800 text-white fixed top-4 z-50 rounded-full shadow-lg transition-all duration-300 ${
          isSidebarOpen ? "left-48" : "left-4"
        }`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-white flex flex-col z-40 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64`}
      >
        <h2 className="text-xl font-bold p-4 border-b border-gray-700">Menu</h2>
        <div className="flex-1 flex flex-col">
          {user && user.role === "admin" && renderMenuItems(adminMenuItems)}
          {user && user.role === "vendor" && renderMenuItems(vendorMenuItems)}
          {user && user.role === "farmer" && renderMenuItems(farmerMenuItems)}
          {user && user.role === "composter" && renderMenuItems(composterMenuItems)}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;