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
import DashboardCard14 from "../partials/marketdashboard/DashboardCard14";
import DashboardCard15 from "../partials/marketdashboard/DashboardCard15";
import Footer from "../Navigation/Footer";
import '../../index.css';
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from 'jspdf-autotable';
import { useRef } from "react";
import DashboardCard08 from "../partials/dashboard/DashboardCard08";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleCounts, setRoleCounts] = useState({ farmer: 0, composter: 0, vendor: 0 });
  const [numStalls, setStalls] = useState(0);
  const [sacks, setSacks] = useState([]);
  const pdfRef = useRef();
  const [dashboardCard06ExportData, setDashboardCard06ExportData] = useState([]);
  const [dashboardCard14ExportData, setDashboardCard14ExportData] = useState([]);
  const [dashboardCard02ExportData, setDashboardCard02ExportData] = useState([]);
  const [dashboardCard03ExportData, setDashboardCard03ExportData] = useState([]);
  const [dashboardCard05ExportData, setDashboardCard05ExportData] = useState([]);
  const [dashboardCard04ExportData, setDashboardCard04ExportData] = useState([]);
  const [dashboardCard08ExportData, setDashboardCard08ExportData] = useState([]);

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Dashboard Report", 14, 22);

    if (dashboardCard06ExportData.length > 0) {
      doc.setFontSize(14);
      doc.text("Weekly Sack Report", 14, 35);

      autoTable(doc, {
        startY: 40,
        head: [['Week', 'Claimed Sacks', 'Cancelled Sacks']],
        body: dashboardCard06ExportData.map(row => [
          row.week,
          row.claimed,
          row.cancelled,
        ]),
      });
    }
    if (dashboardCard14ExportData.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Ratings Overview", 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Rating', 'Count']],
        body: dashboardCard14ExportData.map(row => [row.rating, row.count]),
        styles: {
          fontSize: 12,
          cellPadding: 4,
        },
        theme: 'striped'
      });
    }
    if (dashboardCard02ExportData.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Pig Farmers' Waste Pickup (Last 7 Days)", 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Total Kilos']],
        body: dashboardCard02ExportData.map(row => [
          row.date,
          row.totalKilo
        ]),
        styles: {
          fontSize: 12,
          cellPadding: 4,
        },
        theme: 'striped'
      });
    }
    if (dashboardCard03ExportData.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Composters' Waste Pickup (Last 7 Days)", 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Total Kilos']],
        body: dashboardCard03ExportData.map(row => [
          row.date,
          row.totalKilo
        ]),
        styles: {
          fontSize: 12,
          cellPadding: 4,
        },
        theme: 'striped'
      });
    }
    if (dashboardCard05ExportData.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Waste Generation Trend", 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Waste Trend Amount (kg)']],
        body: dashboardCard05ExportData.map(row => [
          new Date(row.ds).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          row.yhat.toFixed(2)
        ]),
        styles: {
          fontSize: 12,
          cellPadding: 4,
        },
        theme: 'striped'
      });
    }
    if (dashboardCard04ExportData.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Pig Farmers and Composters Monthly Waste Collection", 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Pig Farmers (kg)', 'Composters (kg)']],
        body: dashboardCard04ExportData.map(row => [
          new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          row.farmers.toFixed(2),
          row.composters.toFixed(2)
        ]),
        styles: {
          fontSize: 12,
          cellPadding: 4,
        },
        theme: 'striped'
      });
    }
    if (dashboardCard08ExportData.length > 0) {
      doc.addPage("landscape"); 
      doc.setFontSize(16);
      doc.text("Predictive & Actual Waste per Stall", 14, 22);

      const allKeys = Object.keys(dashboardCard08ExportData[0]).filter(k => k !== 'date');
      const stallBaseNames = Array.from(
        new Set(
          allKeys.map(k => k.replace(/\s+\(Actual\)|\s+\(Predicted\)/g, ''))
        )
      );

      // Sub-headers (actual/predicted)
      const headers = ['Date', ...stallBaseNames.flatMap(stall => [`${stall} (Actual)`, `${stall} (Predicted)`])];

      // Body rows
      const body = dashboardCard08ExportData.map(row =>
        headers.map(col =>
          col === 'Date'
            ? new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : (Number(row[col]) || 0).toFixed(2)
        )
      );

      autoTable(doc, {
        startY: 30,
        head: [headers],
        body,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          halign: 'center',
        },
        theme: 'striped',
      });
    }
    doc.save(`New-Taytay-Market-Dashboard-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

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
              <a href="/admin/vendors"><StatCard title="Vendors" count={roleCounts.vendor} icon="🧺" /></a>
              <a href="/admin/view/stalls"><StatCard title="Stalls" count={numStalls} icon="🏬" /></a>
              <StatCard title="Sack Collected" count={sacks.length} icon="🗑️" />
            </div>

            <div ref={pdfRef} style={{ marginBottom: 20 }} className="bg-green-600">
              {/* Main Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
                  <DashboardCard06 onExportData={setDashboardCard06ExportData} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <DashboardCard14 onExportData={setDashboardCard14ExportData} />
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
                  <DashboardCard02 onExportData={setDashboardCard02ExportData} />
                  <div className="mt-4">
                    <DashboardCard03 onExportData={setDashboardCard03ExportData} />
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
                  <DashboardCard05 onExportData={setDashboardCard05ExportData} />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <DashboardCard04 onExportData={setDashboardCard04ExportData} />
                </div>
              </div>
              <div className="grid rounded-2x grid-cols-1 bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <DashboardCard08 onExportData={setDashboardCard08ExportData} />
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