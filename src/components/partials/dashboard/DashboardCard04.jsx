import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

function DashboardCard04({ onExportData }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const farmersResponse = await axios.get(
          `${import.meta.env.VITE_API}/admin-farmers-pickup`
        );
        const compostersResponse = await axios.get(
          `${import.meta.env.VITE_API}/admin-composters-pickup`
        );

        const farmersData = farmersResponse.data.data || [];
        const compostersData = compostersResponse.data.data || [];

        const formatDate = (dateStr) =>
          new Date(dateStr).toISOString().slice(0, 10);

        const allDatesSet = new Set([
          ...farmersData.map((item) => formatDate(item._id.date)),
          ...compostersData.map((item) => formatDate(item._id.date)),
        ]);

        const allDates = Array.from(allDatesSet).sort(
          (a, b) => new Date(a) - new Date(b)
        );

        const farmersMap = new Map(
          farmersData.map((item) => [formatDate(item._id.date), item.totalKilo])
        );

        const compostersMap = new Map(
          compostersData.map((item) => [formatDate(item._id.date), item.totalKilo])
        );

        setChartData({
          labels: allDates,
          farmers: allDates.map((date) => farmersMap.get(date) || 0),
          composters: allDates.map((date) => compostersMap.get(date) || 0),
        });
        
        if (onExportData) {
          const exportData = allDates.map((date) => ({
            date,
            farmers: farmersMap.get(date) || 0,
            composters: compostersMap.get(date) || 0,
          }));
          onExportData(exportData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (chartData && chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Pig Farmers",
              data: chartData.farmers,
              backgroundColor: "#38bdf8", // Tailwind sky-500
            },
            {
              label: "Composters",
              data: chartData.composters,
              backgroundColor: "#22c55e", // Tailwind green-500
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                display: false, // 👈 hide the dates
              },
              grid: {
                display: false, // optional: hide x-axis grid lines
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Kilos",
              },
            },
          },
          plugins: {
            legend: { display: false },
          },
        }
      });
    }
  }, [chartData]);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Pig Farmers and Composters Monthly Waste Collection
        </h2>
      </header>
      <canvas ref={chartRef} width={595} height={248} />
    </div>
  );
}

export default DashboardCard04;