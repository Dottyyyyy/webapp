import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../../utils/helpers";
import axios from "axios";
import Chart from "chart.js/auto";

function DashboardCard05() {
  const user = getUser();
  const [roleCounts, setRoleCounts] = useState({ farmer: 0, composter: 0, vendor: 0 });
  const [numStalls, setStalls] = useState(0);
  const [sacks, setSacks] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [predictedWaste, setPredictedWaste] = useState([]);
  const [optimalSchedule, setOptimalSchedule] = useState([]);
  const [co2Data, setCo2Data] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [wasteGeneration, setWasteGeneration] = useState([]);
  const wasteGenerationChartRef = useRef(null);
  const optimalScheduleChartRef = useRef(null);
  const predictedWasteChartRef = useRef(null);

  const wasteGenerationChartInstance = useRef(null);
  const optimalScheduleChartInstance = useRef(null);
  const predictedWasteChartInstance = useRef(null);


  // console.log(wasteGeneration)

  const fetchStoreCounts = async () => {
    try {
      const data = await axios.get(`${import.meta.env.VITE_API}/get-all-stalls`);
      setStalls(data.data.stalls.length);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  const fetchUserCounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/get-all-users`);
      const counts = { farmer: 0, composter: 0, vendor: 0 };
      response.data.users.forEach(user => {
        if (user.role === "farmer") counts.farmer++;
        else if (user.role === "composter") counts.composter++;
        else if (user.role === "vendor") counts.vendor++;
      });
      setRoleCounts(counts);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSackCounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/sack/get-sacks`);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const filtered = response.data.sacks.filter(sack => {
        const createdAt = new Date(sack.createdAt);
        return (
          createdAt.getMonth() === currentMonth &&
          createdAt.getFullYear() === currentYear
        );
      });
      setSacks(filtered);
    } catch (error) {
      console.error("Error fetching sacks:", error);
    }
  };

  const fetchPredictedWaste = async () => {
    try {

      //predict-waste-data
      const predictWaste = await axios.get(`${import.meta.env.VITE_API}/ml/predict-waste`);
      setPredictedWaste(predictWaste.data);

      //optimal-collection-schedule-data
      const optimalSchedule = await axios.get(`${import.meta.env.VITE_API}/ml/optimal-collection-schedule`);
      setOptimalSchedule(optimalSchedule.data);

      //waste-collected-progress-data
      const collectedProgress = await axios.get(`${import.meta.env.VITE_API}/ml/waste-collected-progress`);
      const pastData = collectedProgress.data?.past_data || [];
      const predictions = collectedProgress.data?.predictions || [];
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

    if (wasteGeneration.length > 0 && wasteGenerationChartRef.current) {
      if (wasteGenerationChartInstance.current) {
        wasteGenerationChartInstance.current.destroy();
      }

      wasteGenerationChartInstance.current = new Chart(wasteGenerationChartRef.current, {
        type: "line",
        data: {
          labels: wasteGeneration.map((_, index) => index), // use index for visual clarity
          datasets: [
            {
              label: 'Prediction',
              data: wasteGeneration.map(d => d.yhat),
              borderColor: 'green',
              fill: false,
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

  }, [predictedWaste, wasteGeneration, optimalSchedule]);

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
    fetchStoreCounts();
    fetchUserCounts();
    fetchSackCounts();
  }, []);

  useEffect(() => {
    if (sacks.length > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const sacksThisMonth = sacks.filter((sack) => {
        const createdAt = new Date(sack.createdAt);
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
      });

      const statusKilos = sacksThisMonth.reduce((acc, sack) => {
        const status = sack.status.toLowerCase();
        const kilo = parseFloat(sack.kilo) || 0;

        acc[status] = (acc[status] || 0) + kilo;
        return acc;
      }, {});

      const statusColors = {
        spoiled: "#D70040",
        claimed: "#097969",
        posted: "#F88379",
        pickup: "#EC5800"
      };

      const formattedPieData = Object.keys(statusKilos).map((status) => ({
        value: statusKilos[status],
        label: status.charAt(0).toUpperCase() + status.slice(1),
        color: statusColors[status.toLowerCase()] || "#CCCCCC"
      }));

      // Check if the pie data really needs to be updated
      if (JSON.stringify(pieData) !== JSON.stringify(formattedPieData)) {
        setPieData(formattedPieData);
      }

      const statusCounts = sacks.reduce((acc, sack) => {
        acc[sack.status] = (acc[sack.status] || 0) + 1;
        return acc;
      }, {});
    }
  }, [sacks, pieData]);

  useEffect(() => {
    return () => {
      if (wasteGenerationChartInstance.current) wasteGenerationChartInstance.current.destroy();
      if (optimalScheduleChartInstance.current) optimalScheduleChartInstance.current.destroy();
      if (predictedWasteChartInstance.current) predictedWasteChartInstance.current.destroy();
    };
  }, []);

  const totalWaste = wasteData.reduce((sum, item) => sum + item.value, 0);
  const totalCO2 = co2Data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Waste Generation Trend
        </h2>
      </header>
      <canvas ref={wasteGenerationChartRef} width={595} height={256} />
    </div>
  );
}

export default DashboardCard05;
