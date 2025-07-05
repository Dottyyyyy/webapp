import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// Utils
import { getUser, logout } from "../../utils/helpers";
// Components
import SearchModal from "../Extras/ModalSearch";
import DashboardCard12 from "../partials/dashboard/DashboardCard12";
import Profile from "../Pages/Profile";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mySack, setMySacks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);  // State for dropdown visibility
  const userData = getUser();
  const userId = userData?._id;
  const [showProfileModal, setShowProfileModal] = useState(false);
  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, []);

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

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/notifications/users-get-notif/${userId}`);

      let filteredNotifications = [];

      if (user?.role === "farmer") {
        filteredNotifications = data.notifications.filter(notification => notification.type === 'new_sack');
      } else if (user?.role === "composter") {
        filteredNotifications = data.notifications.filter(notification => notification.type === 'spoiled');
      } else if (user?.role === "vendor") {
        filteredNotifications = data.notifications.filter(notification =>
          ['pickup', 'trashed', 'spoiled', 'claimed', 'pickup_completed'].includes(notification.type)
        );
      } else if (user?.role === "admin") {
        filteredNotifications = data.notifications.filter(notification =>
          ['new_sack', 'trashed', 'pickup_completed'].includes(notification.type)
        );
      }

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchStalls = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/get-all-stalls`
      );
      setStalls(response.data.stalls);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMySacks();
      fetchStalls();

      const interval = setInterval(() => {
        fetchMySacks();
        fetchStalls();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, user?.role]);

  const handleNotificationClick = (stallId) => {
    if (user.role === 'farmer') {
      setDropdownOpen(false)
      navigate(`/stalls/${stallId}`);
      window.location.reload()
    } else if (user.role === 'composter') {
      setDropdownOpen(false)
      navigate(`/composter/market/detail/${stallId}`);
      window.location.reload()
    } else {
      setDropdownOpen(false)
      navigate(`/vendor/pickup`);
      window.location.reload()
    }
  };

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0) return `${count} ${i.label}${count !== 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };

  // Check if a notification is today
  const isNotificationToday = (notificationDate) => {
    const notificationTime = new Date(notificationDate);
    const today = new Date();
    return (
      notificationTime.getDate() === today.getDate() &&
      notificationTime.getMonth() === today.getMonth() &&
      notificationTime.getFullYear() === today.getFullYear()
    );
  };

  // Filter today's notifications
  const todaysNotifications = notifications.filter((notif) => isNotificationToday(notif.createdAt));
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <>
      {/* Sticky Header */}
      <header className="bg-[#EBFFF3] p-6 shadow-lg sticky top-0 z-50">
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
            {user?.role === "admin" && (
              <div ref={dropdownRef} className={`relative ${sidebarExpanded ? "block" : "hidden"}`}>
                <span
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="cursor-pointer transition-all duration-200"
                >
                  🔔
                </span>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                  >
                    <DashboardCard12 />
                  </div>
                )}
              </div>
            )}

            {/* Vendor View */}
            {user?.role === "vendor" && (
              <>
                <div className="flex items-center space-x-8 text-green-900 font-medium">
                  <a href="/" className="hover:underline">Home</a>
                  <button onClick={() => navigate(`/vendor/myStall/${user._id}`)} className="hover:underline underline-offset-4 decoration-green-600">My stall</button>
                  <a href="/about" className="hover:underline">About</a>
                  <a href='/vendor/pickup' className="hover:underline font-semibold">Pick up</a>
                  <div ref={dropdownRef} className="relative">
                    <button className="text-xl hover:text-green-600" onClick={toggleDropdown}>
                      🔔 {todaysNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full">{todaysNotifications.length}</span>
                      )}
                    </button>
                    {/* Notification Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                        <div className="grid gap-4">
                          {notifications.filter((notif) => !notif.isRead).length > 0 ? (
                            notifications
                              .filter((notif) => !notif.isRead)
                              .slice(0, 5)
                              .map((notif, i) => (
                                <div
                                  key={notif._id || i}
                                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded cursor-pointer"
                                  onClick={() => handleNotificationClick()}
                                >
                                  <p className="text-sm font-medium">{notif.message}</p>
                                  <p className="text-sm font-medium">{timeAgo(notif.createdAt)}</p>
                                </div>
                              ))
                          ) : (
                            <h1 className="text-gray-500">No New Waste Sacks</h1>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold transition" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                      <span className="text-xl">👤</span> {user?.name} ▼
                    </button>
                    <div className="absolute right-0 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50" style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                      <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">👤 Profile</a>
                      <a href="/messenger" className="block px-4 py-2 hover:bg-gray-100">💬 Chats</a>
                      <a href="/vendor/market-list" className="block px-4 py-2 hover:bg-gray-100">📋 MarketList</a>
                      <button
                        onClick={handleLogout}
                        className="w-[95%] text-left px-4 py-2 hover:bg-gray-100 ml-1" style={{ borderRadius: 10 }}
                      > ტ Log out</button>
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
                  <a href={user.role === "farmer" ? "/viewposts" : "/composter/viewposts"} className="hover:underline">Posts</a>
                  <a href={user.role === "farmer" ? "/viewStalls" : "/composter/market"} className="hover:underline">Stalls</a>
                  <a href="/about" className="hover:underline">About</a>
                  <a href={user.role === "farmer" ? "/pickup" : "/composter/pickup"} className="hover:underline font-semibold">Pick up</a>
                  <div ref={dropdownRef} className="relative">
                    <button className="text-xl hover:text-green-600" onClick={toggleDropdown}>
                      🔔 {todaysNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full">{todaysNotifications.length}</span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                        <div className="grid gap-4">
                          {notifications.filter((notif) => !notif.isRead).length > 0 ? (
                            notifications
                              .filter((notif) => !notif.isRead)
                              .slice(0, 5)
                              .map((notif, i) => (
                                <div
                                  key={notif._id || i}
                                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded cursor-pointer"
                                  onClick={() => handleNotificationClick(notif.stall.user)}
                                >
                                  <p className="text-sm font-medium">{notif.message}</p>
                                  <p className="text-sm font-medium">{timeAgo(notif.createdAt)}</p>
                                </div>
                              ))
                          ) : (
                            <h1 className="text-gray-500">No New Waste Sacks</h1>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold transition" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                      <span className="text-xl">👤</span> {user?.name || "Farmer"} ▼
                    </button>
                    <div className="absolute right-0 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50" style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                      <a href="/mySack" className="block px-4 py-2 hover:bg-gray-100">🛒My Sack </a>
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        👤 Profile
                      </button>
                      <a href="/messenger" className="block px-4 py-2 hover:bg-gray-100">💬 Chats</a>
                      <button
                        onClick={handleLogout}
                        className="w-[95%] text-left px-4 py-2 hover:bg-gray-100 ml-1" style={{ borderRadius: 10 }}
                      >
                        ტ Log out
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
      {showProfileModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg relative scrollbar-hide">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 font-bold text-xl"
            >
              &times;
            </button>
            <Profile />
          </div>
        </div>
      )}


      {/* Optional: Search Modal */}
      {searchModalOpen && <SearchModal />}
    </>
  );
};

export default Header;