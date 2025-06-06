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
              title: {
                display: true,
                text: "Index"
              }
            },
            y: {
              title: {
                display: true,
                text: "Kg"
              }
            }
          },
          plugins: {
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
          }
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
    fetchReviewRating(); 7
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
              borderColor: "#4B5563",
              fill: false,
              tension: 0.4,
            },
          ],
        },
      });
    }
  }, [wasteData, co2Data]);

  useEffect(() => {
    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            CO2 & Waste Reserve
          </h2>
          {/* Menu button */}
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <Link
                className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3"
                to="#0"
              >
                Option 1
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3"
                to="#0"
              >
                Option 2
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3"
                to="#0"
              >
                Remove
              </Link>
            </li>
          </EditMenu>
        </header>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">
           -------
          </div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        {/* Change the height attribute to adjust the chart height */}
        <canvas ref={lineChartRef} width={389} height={128} />
      </div>
    </div>
  );
}

export default DashboardCard01;
