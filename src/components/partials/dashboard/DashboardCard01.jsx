import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LineChart from "../../../charts/LineChart01";
import { chartAreaGradient } from "../../../charts/ChartjsConfig";
import EditMenu from "../../Extras/DropdownEditMenu";
import Chart from "chart.js/auto";

// Import utilities
import { adjustColorOpacity, getCssVariable } from "../../../utils/Utils";
import { getUser } from "../../../utils/helpers";
import axios from "axios";

function DashboardCard01() {
  const [sacks, setSacks] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [predictedWaste, setPredictedWaste] = useState([]);
  const [co2Data, setCo2Data] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [wasteGeneration, setWasteGeneration] = useState([]);
  const lineChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const predictedWasteChartRef = useRef(null);
  const predictedWasteChartInstance = useRef(null);

  const fetchPredictedWaste = async () => {
    try {

      //predict-waste-data
      const predictWaste = await axios.get(`${import.meta.env.VITE_API}/ml/predict-waste`);
      setPredictedWaste(predictWaste.data);
      //waste-collected-progress-data
      const collectedProgress = await axios.get(`${import.meta.env.VITE_API}/ml/waste-collected-progress`);
      const pastData = collectedProgress.data?.past_data || [];
      // Process past data (Actual waste collected)
      const wastePoints = pastData.map((item, index) => ({
        value: item.total_kilo,
        label: new Date(item.date).getDate().toString(),
      }));
      setWasteData(wastePoints);
      const co2Points = pastData.map((item, index) => ({
        value: item.total_kilo * 0.7,
        label: new Date(item.date).getDate().toString(),
      }));
      setCo2Data(co2Points);

      //waste-generation-trend-data
      const wasteGeneration = await axios.get(`${import.meta.env.VITE_API}/ml/waste-generation-trend`);
      // console.log("Waste Generation Data:", wasteGeneration.data);
      setWasteGeneration(wasteGeneration.data);
    } catch (error) {
      console.error("Error fetching predicted waste data:", error);
    }
  };
  // console.log(optimalSchedule);

  useEffect(() => {
    if (predictedWaste.length > 0 && predictedWasteChartRef.current) {
      if (predictedWasteChartInstance.current) {
        predictedWasteChartInstance.current.destroy();
      }

      predictedWasteChartInstance.current = new Chart(predictedWasteChartRef.current, {
        type: "line",
        data: {
          labels: predictedWaste.map((_, index) => index),
          datasets: [
            {
              label: "Predicted Waste for each Stall (kg)",
              data: predictedWaste.map((item) => item.predicted_kilos),
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                color: "#ffffff", // Pure white
              },
              title: {
                display: true,
                text: "Index",
                color: "#ffffff", // Pure white
              },
              grid: {
                color: "#ffffff", // Pure white grid lines
              },
            },
            y: {
              ticks: {
                color: "#ffffff",
              },
              title: {
                display: true,
                text: "Kg",
                color: "#ffffff",
              },
              grid: {
                color: "#ffffff",
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#ffffff", // Pure white legend
              },
            },
            tooltip: {
              callbacks: {
                title: function (context) {
                  const index = context[0].dataIndex;
                  return `Date: ${wasteGeneration[index].ds}`;
                },
                label: function (context) {
                  const index = context.dataIndex;
                  const yhat = wasteGeneration[index].yhat.toFixed(2);
                  return `Predicted: ${yhat} Kg`;
                },
              },
            },
          },
        }
      });
    }

  }, [predictedWaste]);

  const fetchReviewRating = async () => {
    try {
      const data = await axios.get(`${import.meta.env.VITE_API}/get-ratings-reviews`);
      // console.log(data.data, 'This is Review Rating')
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  useEffect(() => {
    fetchReviewRating(); 
    fetchPredictedWaste();
  }, []);

  useEffect(() => {
    if (sacks.length > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const sacksThisMonth = sacks.filter((sack) => {
        const createdAt = new Date(sack.createdAt);
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
      });
    }
  }, [sacks, pieData]);

  useEffect(() => {
    if (wasteData.length && co2Data.length) {
      const ctx = lineChartRef.current.getContext("2d");

      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }

      lineChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: wasteData.map((item) => item.label),
          datasets: [
            {
              label: "Waste Collected (kg)",
              data: wasteData.map((item) => item.value),
              borderColor: "#16A34A",
              fill: false,
              tension: 0.4,
            },
            {
              label: "CO2 Saved (kg)",
              data: co2Data.map((item) => item.value),
              borderColor: "rgb(6, 23, 214)",
              fill: false,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                color: "#ffffff", // Pure white
              },
              grid: {
                color: "#ffffff", // Pure white grid lines
              },
            },
            y: {
              ticks: {
                color: "#ffffff",
              },
              grid: {
                color: "#ffffff",
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#ffffff",
              },
            },
          },
        }
      });
    }
  }, [wasteData, co2Data]);

  useEffect(() => {
    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl w-145">
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center bg-[#4eff56]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          CO2 & Waste Reserve
        </h2>
      </header>
      <div style={{ backgroundColor: '#1D3B29', marginTop: 5, padding: 20 }}>
        {/* Chart built with Chart.js 3 */}
        <div className="grow h-64 px-5 pb-5 overflow-hidden h-100 w-135" style={{ borderWidth: 1, borderColor: 'white' }}>
          <div className="grow h-64 px-5 pb-5 overflow-hidden h-100 w-200">
            <canvas ref={lineChartRef} width={350} height={340} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard01;
