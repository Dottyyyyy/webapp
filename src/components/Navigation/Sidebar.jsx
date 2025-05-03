import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../utils/helpers";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons for menu toggle

const Sidebar = () => {
  const navigation = useNavigate();
  const [user, setUser] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  // console.log(user._id,'User Data')
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
      },
    ],
  };

  const vendorMenuItems = {
    top: [
      {
        name: "My Stall", icon: "📨", action: () => navigation(`/vendor/myStall/${user._id}`),
      },
      {
        name: "Pickup", icon: "🎒", action: () => navigation(`/vendor/pickup`),
      },
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
      {
        name: "Pick Up",
        icon: "📦",
        action: () => navigation("/pickup"),
      },
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
      },
    ],
  };

  const composterMenuItems = {
    top: [{ name: "View Market", icon: "♻️", action: () => navigation("/composter/market") },
      { name: "Pickup", icon: "📦", action: () => navigation("/composter/pickup") }
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
      },
    ],
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
      {!isSidebarOpen && ( // Render the button only when the sidebar is closed
        <button
          className="p-4 bg-gray-800 text-white fixed top-4 z-50 rounded-full shadow-lg transition-all duration-300 right-4"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-screen bg-gray-800 text-white flex flex-col z-40 transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
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