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
import DashboardCard14 from "../partials/MarketDashboard/DashboardCard04";
import DashboardCard15 from "../partials/MarketDashboard/DashboardCard05";

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
    const interval = setInterval(() => {
      fetchUserCounts();
      fetchStoreCounts();
      fetchSackCounts();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden fade-in">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}

        {/* Main content with footer */}
        <main className="grow flex flex-col justify-between min-h-screen bg-[#116937]">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-9xl mx-auto bg-[#116937]">
            {/* Dashboard Title */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-white-800 white:text-white-100 font-bold" style={{ color: 'white' }}>
                Dashboard
              </h1>
            </div>

            {/* Stat Header Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <a href="/admin/farmers" className="text-white hover:text-gray-200">
                <StatCard title="Farmer" count={roleCounts.farmer} icon="🌾" />
              </a>
              <a href="/admin/composters" className="text-white hover:text-gray-200">
                <StatCard title="Composter" count={roleCounts.composter} icon="♻️" />
              </a>
              <StatCard title="Sack Collected" count={sacks.length} icon="🗑️" />
              <a href="/admin/vendors" className="text-white hover:text-gray-200">
                <StatCard title="Vendors" count={roleCounts.vendor} icon="🧺" />
              </a>
              <StatCard title="Stalls" count={numStalls} icon="🏬" />
            </div>


            {/* Monthly Collection & Recent Activity Chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-4">
                <DashboardCard04 />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <DashboardCard14 />
              </div>
            </div>
            {/* Activity, Top Rated, Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-300 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <h2 className="font-semibold text-lg mb-2">Recent Activity</h2>
                <DashboardCard12 />
              </div>
              <div className="bg-gradient-to-br from-green-300 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <h2 className="font-semibold text-lg mb-2">Waste Collected Monthly</h2>
               <DashboardCard02/>
               <br></br>
               <DashboardCard03/>
               
              </div>
              <div className="bg-gradient-to-br from-green-300 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <h2 className="font-semibold text-lg mb-2">User Reviews</h2>
               <DashboardCard15 />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
const StatCard = ({ title, count, icon }) => (
  <div className="bg-gradient-to-r h-30 from-green-300 to-green-500 rounded-xl py-6 px-6 shadow-md hover:shadow-lg transition font-['Inter'] text-center flex flex-col items-center justify-center">
    <div className="flex items-center space-x-2 mb-3">
      <div className="text-[22px]">{icon}</div>
      <h2 className="font-bold text-[22px] text-black">{title}</h2>
    </div>
    <p className="text-[16px] font-bold text-black">{count}</p>
  </div>
);



export default Dashboard;
