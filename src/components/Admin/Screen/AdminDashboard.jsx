import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../../utils/helpers";
import axios from "axios";
import Chart from "chart.js/auto";

const AdminDashboard = () => {
    const user = getUser();
    const [roleCounts, setRoleCounts] = useState({ farmer: 0, composter: 0, vendor: 0 });
    const [numStalls, setStalls] = useState(0);
    const [sacks, setSacks] = useState([]);
    const [barData, setBarData] = useState([]);
    const [barMonth, setBarMonth] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [predictedWaste, setPredictedWaste] = useState([]);
    const [optimalSchedule, setOptimalSchedule] = useState([]);
    const [co2Data, setCo2Data] = useState([]);
    const [wasteData, setWasteData] = useState([]);
    const [wasteGeneration, setWasteGeneration] = useState([]);
    const lineChartRef = useRef(null);
    const barChartRef = useRef(null);
    const radarChartRef = useRef(null);
    const lineChartInstance = useRef(null);
    const barChartInstance = useRef(null);
    const radarChartInstance = useRef(null);
    const wasteGenerationChartRef = useRef(null);
    const optimalScheduleChartRef = useRef(null);
    const predictedWasteChartRef = useRef(null);

    const wasteGenerationChartInstance = useRef(null);
    const optimalScheduleChartInstance = useRef(null);
    const predictedWasteChartInstance = useRef(null);


    console.log(wasteGeneration)

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
    console.log(optimalSchedule);

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

        if (optimalSchedule.length > 0) {
            // Group by date and sum the predicted_kilos
            const aggregatedData = optimalSchedule.reduce((acc, item) => {
                // If the date already exists, add to the existing value
                if (acc[item.date]) {
                    acc[item.date] += item.predicted_kilos;
                } else {
                    // If it's a new date, initialize with the current predicted_kilos
                    acc[item.date] = item.predicted_kilos;
                }
                return acc;
            }, {});

            // Convert aggregated data into arrays for labels and values
            const labels = Object.keys(aggregatedData);
            const values = Object.values(aggregatedData);

            const ctx = optimalScheduleChartRef.current.getContext("2d");

            if (optimalScheduleChartInstance.current) {
                optimalScheduleChartInstance.current.destroy();
            }

            optimalScheduleChartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels, // The dates
                    datasets: [
                        {
                            label: "Optimal Collection Schedule",
                            data: values, // Aggregated values
                            backgroundColor: "#32CD32",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            ticks: {
                                display: false // 👈 Hide x-axis labels (dates)
                            },
                            grid: {
                                display: false // 👈 Optional: hide grid lines
                            },
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
                                label: function (context) {
                                    const date = context.label;
                                    const entriesForDate = optimalSchedule.filter(d => d.date === date);

                                    const lines = entriesForDate.map(entry =>
                                        `• ${entry.stallNumber}: ${entry.predicted_kilos.toFixed(2)} Kg`
                                    );

                                    const total = context.raw.toFixed(2);

                                    return [`Total: ${total} Kg`, ...lines];
                                }
                            }
                        }
                    }
                }
            });
        }
    }, [predictedWaste, wasteGeneration, optimalSchedule]);


    useEffect(() => {
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

            const barData = Object.entries(statusCounts).map(([status, count]) => ({
                label: status.charAt(0).toUpperCase() + status.slice(1),
                value: count,
            }));

            setBarMonth(barData)
            // Check if the bar data really needs to be updated
            if (JSON.stringify(barData) !== JSON.stringify(barData)) {
                setBarData(barData);
            }
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
        if (barMonth.length) {
            const ctx = barChartRef.current.getContext("2d");

            if (barChartInstance.current) {
                barChartInstance.current.destroy();
            }

            barChartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: barMonth.map((item) => item.label),
                    datasets: [
                        {
                            label: "Sacks by Status",
                            data: barMonth.map((item) => item.value),
                            backgroundColor: ["#D70040", "#097969", "#F88379", "#EC5800"],
                        },
                    ],
                },
            });
        }
    }, [barMonth]);

    useEffect(() => {
        if (pieData.length) {
            const ctx = radarChartRef.current.getContext("2d");

            if (radarChartInstance.current) {
                radarChartInstance.current.destroy();
            }

            radarChartInstance.current = new Chart(ctx, {
                type: "radar",
                data: {
                    labels: pieData.map((item) => item.label),
                    datasets: [
                        {
                            label: "Sack Distribution This Month",
                            data: pieData.map((item) => item.value),
                            backgroundColor: "rgba(34,197,94,0.2)",
                            borderColor: "#22C55E",
                        },
                    ],
                },
                options: {
                    scales: {
                        r: {
                            angleLines: { display: false },
                            suggestedMin: 0,
                        },
                    },
                },
            });
        }
    }, [pieData]);
    useEffect(() => {
        return () => {
            if (lineChartInstance.current) lineChartInstance.current.destroy();
            if (barChartInstance.current) barChartInstance.current.destroy();
            if (radarChartInstance.current) radarChartInstance.current.destroy();
            if (wasteGenerationChartInstance.current) wasteGenerationChartInstance.current.destroy();
            if (optimalScheduleChartInstance.current) optimalScheduleChartInstance.current.destroy();
            if (predictedWasteChartInstance.current) predictedWasteChartInstance.current.destroy();
        };
    }, []);

    const totalWaste = wasteData.reduce((sum, item) => sum + item.value, 0);
    const totalCO2 = co2Data.reduce((sum, item) => sum + item.value, 0);

    console.log(pieData, 'pieData')
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold text-green-900">Welcome, Admin {user?.name}</h1>
                <p className="text-md text-gray-700 mt-2">Manage the platform and oversee user activities.</p>
            </header>

            {/* Dashboard Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <a href="/admin/farmers" className="text-white hover:text-gray-200">
                    <StatCard title="Total Farmers" count={roleCounts.farmer} icon="🌾" />
                </a>
                <a href="/admin/composters" className="text-white hover:text-gray-200">
                    <StatCard title="Total Composters" count={roleCounts.composter} icon="♻️" />
                </a>
                <a href="/admin/vendors" className="text-white hover:text-gray-200">
                    <StatCard title="Total Vendors" count={roleCounts.vendor} icon="🧺" />
                </a>
                <StatCard title="Market Stalls" count={numStalls} icon="🏬" />
                <StatCard title="Sacks This Month" count={sacks.length} icon="🗑️" />
            </div>

            {/* Waste Generation Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md w-1/3 w-350">
                <h2 className="text-lg font-semibold mb-2 text-green-800 text-center">Waste Generation</h2>
                <canvas ref={wasteGenerationChartRef} className="mx-auto w-250" />
            </div>

            {/* Optimal Schedule Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md w-1/3 w-350">
                <h2 className="text-lg font-semibold mb-2 text-green-800 text-center">Optimal Collection Schedule</h2>
                <canvas ref={optimalScheduleChartRef} className="mx-auto  w-250" />
            </div>

            {/* Predicted Waste Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md w-1/3 w-350">
                <h2 className="text-lg font-semibold mb-2 text-green-800 text-center">Predicted Waste</h2>
                <canvas ref={predictedWasteChartRef} className="mx-auto  w-250" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-15">
                {/* Line Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold mb-2 text-green-800 text-center">Waste vs CO2</h2>
                    <canvas ref={lineChartRef} className="mx-auto" />
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Total Waste: <span className="font-bold text-green-700">{totalWaste} kg</span><br />
                        Total CO₂: <span className="font-bold text-red-600">{totalCO2.toFixed(2)} kg</span>
                    </p>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold mb-2 text-green-800 text-center">Sack Status This Month</h2>
                    <canvas ref={barChartRef} className="mx-auto" />
                </div>

                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold mb-2 text-green-800 text-center">Sack Kilo Distribution (Radar)</h2>
                    <canvas ref={radarChartRef} className="mx-auto" />
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Total Kilos: <span className="font-bold text-green-700">
                            {pieData.reduce((sum, item) => sum + item.value, 0)} kg
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, count, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex items-center space-x-4 hover:shadow-xl transition">
        <div className="text-4xl">{icon}</div>
        <div>
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <p className="text-3xl font-bold text-green-700">{count}</p>
        </div>
    </div>
);

export default AdminDashboard;