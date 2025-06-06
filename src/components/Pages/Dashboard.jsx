import { useEffect, useState } from "react";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import FilterButton from "../Extras/DropdownFilter";
import Datepicker from "../Extras/Datepicker";
import DashboardCard01 from "../partials/dashboard/DashboardCard01";
import DashboardCard02 from "../partials/dashboard/DashboardCard02";
import DashboardCard03 from "../partials/dashboard/DashboardCard03";
import DashboardCard04 from "../partials/dashboard/DashboardCard04";
import DashboardCard05 from "../partials/dashboard/DashboardCard05";
import DashboardCard12 from "../partials/dashboard/DashboardCard12";
import '../../index.css'
import axios from "axios";
import Footer from "../Navigation/Footer";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleCounts, setRoleCounts] = useState({ farmer: 0, composter: 0, vendor: 0 });
  const [numStalls, setStalls] = useState(0);
  const [sacks, setSacks] = useState([]);

  const fetchUserCounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
      const counts = { farmer: 0, composter: 0, vendor: 0 };
      response.data.users.forEach(user => {
        if (user.role === "farmer") counts.farmer++;
        else if (user.role === "composter") counts.composter++;
        else if (user.role === "vendor") counts.vendor++;
      });
      setRoleCounts(counts);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStoreCounts = async () => {
    try {
      const data = await axios.get(`${import.meta.env.VITE_API}/get-all-stalls`);
      setStalls(data.data.stalls.length);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  const fetchSackCounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/sack/get-sacks`);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const filtered = response.data.sacks.filter(sack => {
        const createdAt = new Date(sack.createdAt);
        return (
          createdAt.getMonth() === currentMonth &&
          createdAt.getFullYear() === currentYear
        );
      });
      setSacks(filtered);
    } catch (error) {
      console.error("Error fetching sacks:", error);
    }
  };

  useEffect(() => {
    fetchUserCounts();
    fetchStoreCounts();
    fetchSackCounts();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden fade-in">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content with footer */}
        <main className="grow flex flex-col justify-between min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard Title */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                Dashboard
              </h1>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <a href="/admin/farmers" className="text-white hover:text-gray-200">
                <StatCard title="Total Farmers" count={roleCounts.farmer} icon="🌾" />
              </a>
              <a href="/admin/composters" className="text-white hover:text-gray-200">
                <StatCard title="Total Composters" count={roleCounts.composter} icon="♻️" />
              </a>
              <a href="/admin/vendors" className="text-white hover:text-gray-200">
                <StatCard title="Total Vendors" count={roleCounts.vendor} icon="🧺" />
              </a>
              <StatCard title="Market Stalls" count={numStalls} icon="🏬" />
              <StatCard title="Sacks This Month" count={sacks.length} icon="🗑️" />
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-12 gap-6">
              <DashboardCard01 />
              <DashboardCard02 />
              <DashboardCard03 />
              <DashboardCard04 />
              <DashboardCard05 />
              <DashboardCard12 />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const StatCard = ({ title, count, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex items-center space-x-4 hover:shadow-xl transition">
    <div className="text-4xl">{icon}</div>
    <div>
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-3xl font-bold text-green-700">{count}</p>
    </div>
  </div>
);

export default Dashboard;
