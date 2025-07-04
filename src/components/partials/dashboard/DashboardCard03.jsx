import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import EditMenu from "../../Extras/DropdownEditMenu";
import Chart from "chart.js/auto";
import { adjustColorOpacity, getCssVariable } from "../../../utils/Utils";

function DashboardCard03({ onExportData }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [chartData, setChartData] = useState(null);
  const [totalKilos, setTotalKilos] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch the composter pickup data
  const fetchComposterPickup = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/admin-composters-pickup`);
      const rawData = response.data.data;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const filteredData = rawData.filter(item => {
        const itemDate = new Date(item._id.date);
        return itemDate >= sevenDaysAgo;
      });

      const dataToUse = filteredData.length > 0 ? filteredData : rawData;

      const labels = dataToUse.map(item =>
        new Date(item._id.date).toLocaleDateString("en-PH", {
          month: "short",
          day: "2-digit",
        })
      );

      const dataPoints = dataToUse.map(item => item.totalKilo);

      const total = dataPoints.reduce((sum, val) => sum + val, 0);
      setTotalKilos(total);
      if (onExportData) {
        const exportRows = dataToUse.map(item => ({
          date: new Date(item._id.date).toLocaleDateString("en-PH", {
            month: "long",
            day: "2-digit",
            year: "numeric"
          }),
          totalKilo: item.totalKilo
        }));
        onExportData(exportRows);
      }
      setChartData({
        labels,
        datasets: [
          {
            label: "Composter Pickup",
            data: dataPoints,
            fill: true,
            backgroundColor: function (context) {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                // If chartArea not ready yet, fallback color
                return getCssVariable("--color-green-500");
              }
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, adjustColorOpacity(getCssVariable("--color-green-500"), 0));
              gradient.addColorStop(1, adjustColorOpacity(getCssVariable("--color-green-500"), 0.2));
              return gradient;
            },
            borderColor: getCssVariable("--color-green-500"),
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointBackgroundColor: getCssVariable("--color-green-500"),
            pointHoverBackgroundColor: getCssVariable("--color-green-500"),
            tension: 0.2,
          },
        ],
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching composter pickup data:", error);
      setLoading(false);
    }
  };


  // Initialize chart or update when chartData changes
  useEffect(() => {
    fetchComposterPickup();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !chartData) return;

    // Destroy old chart instance if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            display: true,
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              color: getCssVariable("--color-gray-200"),
            },
          },
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 3,
          },
          line: {
            borderWidth: 2,
            fill: "start",
            tension: 0.2,
          },
        },
        interaction: {
          mode: "nearest",
          intersect: false,
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Composters
          </h2>
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <a
                href="#0"
                className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3"
              >
                Option 1
              </a>
            </li>
            <li>
              <a
                href="#0"
                className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3"
              >
                Option 2
              </a>
            </li>
            <li>
              <a
                href="#0"
                className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3"
              >
                Remove
              </a>
            </li>
          </EditMenu>
        </header>

        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
          Waste Taken (Last 7 Days)
        </div>

        <div className="flex items-start">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mr-2" style={{ marginBottom: 8 }}>
            {loading ? "Loading..." : `${totalKilos} Kilos`}
          </div>
        </div>
      </div>

      <div
        className="grow max-sm:max-h-[128px] xl:max-h-[128px]"
        style={{ position: "relative", height: 128 }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default DashboardCard03;
