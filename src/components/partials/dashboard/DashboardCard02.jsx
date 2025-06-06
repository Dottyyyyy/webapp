import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EditMenu from "../../Extras/DropdownEditMenu";
import { chartAreaGradient } from "../../../charts/ChartjsConfig";
import { adjustColorOpacity, getCssVariable } from "../../../utils/Utils";
import axios from "axios";
import Chart from "chart.js/auto";

function DashboardCard02() {
  const canvasRef = useRef(null); // ✅ create ref
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [totalKilos, setTotalKilos] = useState(0);

  const fetchPickupFarmer = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/admin-farmers-pickup`
      );

      const rawData = response.data.data;

      // Get the date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Filter rawData to include only items within the last 7 days
      const filteredData = rawData.filter(item => {
        const itemDate = new Date(item._id.date);
        return itemDate >= sevenDaysAgo;
      });

      // Format labels and data points
      const labels = filteredData.map(item =>
        new Date(item._id.date).toLocaleDateString("en-PH", {
          month: "short",
          day: "2-digit",
        })
      );

      const dataPoints = filteredData.map(item => item.totalKilo);

      const total = dataPoints.reduce((sum, value) => sum + value, 0);
      setTotalKilos(total);

      setChartData({
        labels,
        datasets: [
          {
            data: dataPoints,
            fill: true,
            backgroundColor: function (context) {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              return chartAreaGradient(ctx, chartArea, [
                {
                  stop: 0,
                  color: adjustColorOpacity(getCssVariable("--color-green-500"), 0),
                },
                {
                  stop: 1,
                  color: adjustColorOpacity(getCssVariable("--color-green-500"), 0.2),
                },
              ]);
            },
            borderColor: getCssVariable("--color-green-500"),
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointBackgroundColor: getCssVariable("--color-green-500"),
            pointHoverBackgroundColor: getCssVariable("--color-green-500"),
            pointBorderWidth: 0,
            pointHoverBorderWidth: 0,
            clip: 20,
            tension: 0.2,
          },
        ],
      });

    } catch (error) {
      console.error("Error fetching pickup data:", error);
    }
  };


  useEffect(() => {
    fetchPickupFarmer();
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (!canvasRef.current || chartData.labels.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: getCssVariable("--color-gray-500") },
          },
          y: {
            ticks: { color: getCssVariable("--color-gray-500") },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }, [chartData]);


  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Pig Farmers
          </h2>
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 1
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 2
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3" to="#0">
                Remove
              </Link>
            </li>
          </EditMenu>
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">
          Waste Taken (Last 7 Days)
        </div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">
            {totalKilos} Kilos
          </div>
        </div>
      </div>
      <div className="grow max-sm:max-h-[128px] max-h-[128px] relative">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

export default DashboardCard02;