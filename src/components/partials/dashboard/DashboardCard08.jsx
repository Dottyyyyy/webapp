import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

function DashboardCard08() {
  const [predictedWaste, setPredictedWaste] = useState([]);
  const [actualWaste, setActualWaste] = useState([]);
  const [viewMode, setViewMode] = useState('actual'); // State to toggle between actual/predicted
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Function to fetch predicted waste data
  const fetchPredictedWaste = async () => {
    try {
      // Fetch predicted waste data
      const response = await axios.get(`${import.meta.env.VITE_API}/ml/predict-waste`);
      setPredictedWaste(response.data);
    } catch (error) {
      console.error("Error fetching predicted waste data:", error);
    }
  };

  // Function to fetch actual waste data
  const fetchActualWaste = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/sack/get-sacks`);
      setActualWaste(response.data.sacks);
    } catch (error) {
      console.error("Error fetching actual waste data:", error);
    }
  };

  // Generate a random color
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    fetchPredictedWaste();
    fetchActualWaste();
  }, []);

  useEffect(() => {
    if (predictedWaste.length > 0 && actualWaste.length > 0) {
      // Grouping the actual waste data by date and stall
      const groupedActualData = {};
      actualWaste.forEach(item => {
        const date = item.createdAt.split('T')[0]; // Get date only
        if (!groupedActualData[date]) {
          groupedActualData[date] = {};
        }
        groupedActualData[date][item.stallNumber] = item.kilo;
      });

      // Grouping the predicted waste data by date and stall
      const groupedPredictedData = {};
      predictedWaste.forEach(item => {
        const date = item.date; // Assuming predicted date is directly available
        if (!groupedPredictedData[date]) {
          groupedPredictedData[date] = {};
        }
        groupedPredictedData[date][item.stallNumber] = item.predicted_kilos;
      });

      // Get unique dates (x-axis labels)
      const allDates = [
        ...new Set([...Object.keys(groupedActualData), ...Object.keys(groupedPredictedData)])
      ];

      // Get unique stall numbers
      const stallNumbers = [
        ...new Set([
          ...actualWaste.map(item => item.stallNumber),
          ...predictedWaste.map(item => item.stallNumber),
        ])
      ];

      // Prepare datasets for each stall
      const datasets = stallNumbers.map(stall => {
        const actualData = allDates.map(date => groupedActualData[date]?.[stall] || 0);
        const predictedData = allDates.map(date => groupedPredictedData[date]?.[stall] || 0);
        const color = generateRandomColor(); // Assign random color to each stall

        return {
          label: `Stall ${stall}`,
          data: viewMode === 'actual' ? actualData : predictedData, // Toggle between actual or predicted data
          fill: false,
          borderColor: color,
          borderWidth: 2,
          borderDash: viewMode === 'actual' ? [] : [5, 5], // Solid for actual, dashed for predicted
        };
      });

      // Destroy the previous chart instance (if any) before creating a new one
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Initialize the new chart
      if (chartRef.current) {
        chartInstance.current = new Chart(chartRef.current, {
          type: "line",
          data: {
            labels: allDates.map(date => {
              const d = new Date(date);
              return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }); // e.g., "June 23"
            }),
            datasets: datasets, // Y-axis: kilos for each stall
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Date",
                },
                ticks: {
                  autoSkip: false,
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Waste (kg)",
                },
                beginAtZero: false,
              },
            },
            plugins: {
              legend: {
                position: "top",
              },
            },
          },
        });
      }
    }
  }, [predictedWaste, actualWaste, viewMode]); // Re-run when data or viewMode changes

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl w-245">
      <a style={{ textAlign: 'center' }}>
        Predictive & Actual Waste per Stall
      </a>
      <div style={{ backgroundColor: 'white', marginTop: 5, padding: 20 }}>
        <div className="flex justify-center mb-4">
          {/* Toggle Button */}
          <button
            onClick={() => setViewMode(viewMode === 'actual' ? 'predicted' : 'actual')}
            className="px-3 py-1 bg-green-500 text-white rounded-lg"
          >
            {viewMode === 'actual' ? 'Show Predicted' : 'Show Actual'}
          </button>
        </div>
        <div className="grow h-64 px-5 pb-5 overflow-hidden w-full">
          <canvas ref={chartRef} width={700} height={340}></canvas>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard08;