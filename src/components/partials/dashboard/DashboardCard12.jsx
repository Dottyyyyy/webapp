import axios from "axios";
import React, { useEffect, useState } from "react";

function DashboardCard12() {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  const fetchAllNotifications = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/notifications/get-notif`
      );
      // Limit to 25 notifications max
      const limited = data.notifications.slice(0, 25);
      setNotifications(limited);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  // Calculate indexes for pagination
  const indexOfLast = currentPage * notificationsPerPage;
  const indexOfFirst = indexOfLast - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Recent Activity
        </h2>
      </header>

      <div className="p-3">
        {/* List notifications */}
        <ul className="my-1">
          {currentNotifications.map((notif) => (
            <li key={notif._id} className="flex px-2 mb-2">
              <div className="w-9 h-9 rounded-full shrink-0 bg-green-500 my-2 mr-3 flex items-center justify-center">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 36 36">
                  <path d="M15 13v-3l-5 4 5 4v-3h8a1 1 0 000-2h-8zM21 21h-8a1 1 0 000 2h8v3l5-4-5-4v3z" />
                </svg>
              </div>
              <div className="grow flex items-center text-sm py-2 border-b border-gray-100 dark:border-gray-700/60">
                <div className="grow flex justify-between">
                  <div className="self-center text-gray-800 dark:text-gray-100">
                    {notif.message}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded-full text-sm ${
                currentPage === index + 1
                  ? "bg-violet-500 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard12;