import { useEffect, useState } from "react";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import DashboardCard01 from "../partials/dashboard/DashboardCard01";
import DashboardCard02 from "../partials/dashboard/DashboardCard02";
import DashboardCard03 from "../partials/dashboard/DashboardCard03";
import DashboardCard04 from "../partials/dashboard/DashboardCard04";
import DashboardCard05 from "../partials/dashboard/DashboardCard05";
import DashboardCard12 from "../partials/dashboard/DashboardCard12";
import DashboardCard06 from "../partials/dashboard/DashboardCard06";
import DashboardCard14 from "../partials/MarketDashboard/DashboardCard04";
import DashboardCard15 from "../partials/MarketDashboard/DashboardCard05";
import Footer from "../Navigation/Footer";
import '../../index.css';
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import DashboardCard08 from "../partials/dashboard/DashboardCard08";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleCounts, setRoleCounts] = useState({ farmer: 0, composter: 0, vendor: 0 });
  const [numStalls, setStalls] = useState(0);
  const [sacks, setSacks] = useState([]);
  const pdfRef = useRef();

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    // Inject fallback styles
    const style = document.createElement("style");
    style.innerHTML = `
    * {
      color: #000 !important;
      background-color: #fff !important;
    }
  `;
    element.appendChild(style);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      element.removeChild(style);
    }
  };

  const fetchUserCounts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
      const counts = { farmer: 0, composter: 0, vendor: 0 };
      res.data.users.forEach(user => {
        if (counts[user.role] !== undefined) counts[user.role]++;
      });
      setRoleCounts(counts);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchStoreCounts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/get-all-stalls`);
      setStalls(res.data.stalls.length);
    } catch (err) {
      console.error("Error fetching stalls:", err);
    }
  };

  const fetchSackCounts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/sack/get-sacks`);
      const now = new Date();
      const filtered = res.data.sacks.filter(sack => {
        const date = new Date(sack.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
      setSacks(filtered);
    } catch (err) {
      console.error("Error fetching sacks:", err);
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
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden fade-in">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col bg-gray-100 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        <main className="grow min-h-screen bg-green-600">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-9xl mx-auto bg-green-600">

            <div className="sm:flex sm:justify-between sm:items-center mb-8" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <h1 className="text-2xl md:text-3xl font-bold text-black">Dashboard</h1>
              <button
                onClick={handleDownloadPDF}
                className="mb-6 bg-white text-green-700 font-semibold px-4 py-2 rounded shadow hover:bg-green-100"
              >
                📄 Download Dashboard PDF
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <a href="/admin/farmers"><StatCard title="Farmer" count={roleCounts.farmer} icon="🌾" /></a>
              <a href="/admin/composters"><StatCard title="Composter" count={roleCounts.composter} icon="♻️" /></a>
              <StatCard title="Sack Collected" count={sacks.length} icon="🗑️" />
              <a href="/admin/vendors"><StatCard title="Vendors" count={roleCounts.vendor} icon="🧺" /></a>
              <StatCard title="Stalls" count={numStalls} icon="🏬" />
            </div>

            <div ref={pdfRef} style={{ marginBottom: 20 }} className="bg-green-600">
              {/* Main Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
                  <DashboardCard06 />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <DashboardCard14 />
                </div>
              </div>

              {/* Info Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">Recent Activity</h2>
                  <DashboardCard12 />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">Waste Collected Monthly</h2>
                  <DashboardCard02 />
                  <div className="mt-4">
                    <DashboardCard03 />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">User Reviews</h2>
                  <DashboardCard15 />
                </div>
              </div>

              {/* Bottom Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <DashboardCard05 />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <DashboardCard04 />
                </div>
              </div>
              <div className="grid rounded-2x grid-cols-1 bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <DashboardCard08 />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const StatCard = ({ title, count, icon }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300">
    <div className="text-4xl mb-3">{icon}</div>
    <h2 className="text-gray-700 font-semibold text-lg">{title}</h2>
    <p className="text-2xl font-bold text-indigo-600">{count}</p>
  </div>
);


export default Dashboard;
