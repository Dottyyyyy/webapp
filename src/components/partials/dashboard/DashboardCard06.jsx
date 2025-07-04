import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "chart.js/auto";

function DashboardCard06({ onExportData }) {
  const [pickupData, setPickupData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchAllPickupSackStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/sack/get-all-pickup-sack-status`);
      setPickupData(res.data.pickups);
    } catch (error) {
      toast.warning("Error In Fetching Pickup Sack..");
    }
  };

  useEffect(() => {
    fetchAllPickupSackStatus();
    const interval = setInterval(() => {
      fetchAllPickupSackStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pickupData.length) return;

    const cancelled = {};
    const claimed = {};

    const getWeekKey = (dateStr) => {
      const date = new Date(dateStr);
      const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
      return firstDayOfWeek.toISOString().slice(0, 10);
    };

    pickupData.forEach((pickup) => {
      const weekKey = getWeekKey(pickup.pickedUpDate || pickup.createdAt);

      pickup.sacks.forEach((sack) => {
        if (sack.status === "cancelled") {
          cancelled[weekKey] = (cancelled[weekKey] || 0) + 1;
        } else if (pickup.status === "completed") {
          claimed[weekKey] = (claimed[weekKey] || 0) + 1;
        }
      });
    });

    const allKeys = Array.from(new Set([...Object.keys(claimed), ...Object.keys(cancelled)])).sort();

    const labels = allKeys.map((key) => {
      const date = new Date(key);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    });

    const claimedData = allKeys.map((key) => claimed[key] || 0);
    const cancelledData = allKeys.map((key) => cancelled[key] || 0);

    // 💾 Pass structured data to parent via onExportData
    if (onExportData) {
      const exportTable = allKeys.map((key) => ({
        week: new Date(key).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        claimed: claimed[key] || 0,
        cancelled: cancelled[key] || 0,
      }));
      onExportData(exportTable);
    }

    // 🎨 Render Chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Claimed Sacks",
            data: claimedData,
            backgroundColor: "rgba(34,197,94,0.8)",
          },
          {
            label: "Cancelled Sacks",
            data: cancelledData,
            backgroundColor: "rgba(239,68,68,0.8)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Weekly Sack Status Summary",
          },
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 30,
              callback: function (value) {
                return this.getLabelForValue(value);
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }, [pickupData]);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl p-4">
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Weekly Sack Report</h2>
      <canvas ref={chartRef} />
    </div>
  );
}

export default DashboardCard06;