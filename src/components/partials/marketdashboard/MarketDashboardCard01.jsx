import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EditMenu from "../../Extras/DropdownEditMenu";
import Chart from "chart.js/auto";
import axios from "axios";

function MarketDashboardCard01() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [stalls, setStalls] = useState([]);

  const fetchStalls = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/get-all-stalls`);
      const fetchedStalls = response.data.stalls;
      // console.log(fetchedStalls,'das')
      const processed = fetchedStalls.map(s => {
        const ratings = s.stall?.rating ?? [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
            : 0;

        return {
          name: s.name,
          averageRating: avgRating.toFixed(2),
        };
      });

      setStalls(processed);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  useEffect(() => {
    fetchStalls();
    const interval = setInterval(() => {
      fetchStalls();
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (stalls.length && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: stalls.map(s => s.name),
          datasets: [
            {
              label: "Average Rating",
              data: stalls.map(s => s.averageRating),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            x: {
              ticks: {
                display: false, // hides seller names on X-axis
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              max: 5,
              title: {
                display: true,
                text: "Rating (0–5)",
                color: "#ffffff", // 👈 makes the Y-axis title white
                font: {
                  size: 14,
                  weight: "bold"
                }
              },
              ticks: {
                color: "#ffffff", // 👈 makes the Y-axis tick numbers white too
              },
              grid: {
                color: "rgba(255,255,255,0.1)", // optional: faint white grid lines
              },
            },
          }
        }
      });
    }
  }, [stalls]);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl w-145">
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center bg-[#4eff56]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Ratings Overview
        </h2>
      </header>
      <div style={{ backgroundColor: '#1D3B29', marginTop: 10, height: 435 }}>
        <div className="text-sm text-white-500 mb-2">
          <a style={{ color: 'white', marginLeft: 20, marginTop: 30, }}>
            Average rating per stall
          </a>
        </div>
        <div className="grow h-64 px-5 pb-5 overflow-hidden h-97 w-135" style={{ borderWidth: 1, borderColor: 'white', marginLeft: 20, }}>
          <div style={{ minWidth: `${stalls.length * 60}px` }}>
            <canvas ref={chartRef} width={400} height={350}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketDashboardCard01;