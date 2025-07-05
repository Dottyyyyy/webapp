import React, { useEffect, useState, useRef } from 'react';
import { getUser } from '../../utils/helpers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function VendorIndex() {
    const user = getUser();
    const navigate = useNavigate();
    const userId = user._id;
    const [postedCounts, setPostedCount] = useState(0);
    const [pickupCount, setPickupCount] = useState(0);
    const [claimedCount, setClaimedCount] = useState(0);
    const [totalKilo, setTotalKilo] = useState(0);
    const [monthlyAverage, setMonthlyAverage] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [chartView, setChartView] = useState('daily');
    const [chartData, setChartData] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);
    const [dailyTotal, setDailyTotal] = useState(0);
    const [chartDataForAll, setChartDataForAll] = useState([]);

    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const notifRes = await axios.get(`${import.meta.env.VITE_API}/notifications/get-pickup-request/${userId}`);
                setPostedCount(notifRes.data.postedSacksCount);
                setPickupCount(notifRes.data.pickupSacksCount);
                setClaimedCount(notifRes.data.claimedSacksCount);

                const sackRes = await axios.get(`${import.meta.env.VITE_API}/sack/get-store-sacks/${userId}`);
                const allSacks = sackRes.data.sacks || [];
                setChartDataForAll(allSacks); // ✅ Add this line

                const total = allSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);
                setTotalKilo(total);
                const todayStr = new Date().toISOString().split('T')[0];
                const todayTotal = allSacks
                    .filter(s => new Date(s.createdAt).toISOString().split('T')[0] === todayStr)
                    .reduce((sum, s) => sum + parseFloat(s.kilo || 0), 0);
                setDailyTotal(todayTotal);

                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const monthlySacks = allSacks.filter(s => new Date(s.createdAt).getMonth() === currentMonth && new Date(s.createdAt).getFullYear() === currentYear);
                const monthlySum = monthlySacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);
                setMonthlyAverage(monthlySum);

                generateChartData(chartView, allSacks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [userId, chartView]);

    const generateChartData = (view, sacks) => {
        const now = new Date();
        let labels = [];
        let data = [];

        if (view === 'daily') {
            const today = now.toISOString().split('T')[0];
            const total = sacks
                .filter(s => new Date(s.createdAt).toISOString().split('T')[0] === today)
                .reduce((sum, s) => sum + parseFloat(s.kilo || 0), 0);
            labels = ['Today'];
            data = [total];
        } else if (view === 'weekly') {
            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            labels = weekdays;
            data = weekdays.map((_, i) => {
                const day = new Date(weekStart);
                day.setDate(weekStart.getDate() + i);
                const dayStr = day.toISOString().split('T')[0];
                return sacks
                    .filter(s => new Date(s.createdAt).toISOString().split('T')[0] === dayStr)
                    .reduce((sum, s) => sum + parseFloat(s.kilo || 0), 0);
            });
        } else if (view === 'monthly') {
            labels = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
            data = new Array(12).fill(0);
            sacks.forEach(s => {
                const d = new Date(s.createdAt);
                const month = d.getMonth();
                data[month] += parseFloat(s.kilo || 0);
            });
        } else if (view === 'yearly') {
            const yearMap = {};
            sacks.forEach(s => {
                const year = new Date(s.createdAt).getFullYear();
                yearMap[year] = (yearMap[year] || 0) + parseFloat(s.kilo || 0);
            });
            labels = Object.keys(yearMap).sort();
            data = labels.map(year => yearMap[year]);
        }

        setChartLabels(labels);
        setChartData(data);
    };

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstanceRef.current) chartInstanceRef.current.destroy();

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Kilos',
                        data: chartData,
                        backgroundColor: '#34D399',
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        return () => chartInstanceRef.current?.destroy();
    }, [chartLabels, chartData]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleString();
        const userName = user?.name || "Vendor";

        doc.setFontSize(18);
        doc.text(`Waste Contribution Report`, 14, 20);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Vendor: ${userName}`, 14, 30);
        doc.text(`Date Generated: ${currentDate}`, 14, 36);

        const views = ['daily', 'weekly', 'monthly', 'yearly'];
        let currentY = 46;

        views.forEach(view => {
            // Generate chart data for the given view
            const now = new Date();
            const labels = [];
            const data = [];

            if (view === 'daily') {
                const today = now.toISOString().split('T')[0];
                const total = chartDataForAll.filter(s => new Date(s.createdAt).toISOString().split('T')[0] === today)
                    .reduce((sum, s) => sum + parseFloat(s.kilo || 0), 0);
                labels.push('Today');
                data.push(total);
            } else if (view === 'weekly') {
                const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                for (let i = 0; i < 7; i++) {
                    const day = new Date(weekStart);
                    day.setDate(weekStart.getDate() + i);
                    const dayStr = day.toISOString().split('T')[0];
                    const total = chartDataForAll.filter(s => new Date(s.createdAt).toISOString().split('T')[0] === dayStr)
                        .reduce((sum, s) => sum + parseFloat(s.kilo || 0), 0);
                    labels.push(weekdays[i]);
                    data.push(total);
                }
            } else if (view === 'monthly') {
                const months = Array.from({ length: 12 }, (_, i) =>
                    new Date(0, i).toLocaleString('default', { month: 'short' })
                );
                const monthTotals = new Array(12).fill(0);
                chartDataForAll.forEach(s => {
                    const d = new Date(s.createdAt);
                    const month = d.getMonth();
                    monthTotals[month] += parseFloat(s.kilo || 0);
                });
                labels.push(...months);
                data.push(...monthTotals);
            } else if (view === 'yearly') {
                const yearMap = {};
                chartDataForAll.forEach(s => {
                    const year = new Date(s.createdAt).getFullYear();
                    yearMap[year] = (yearMap[year] || 0) + parseFloat(s.kilo || 0);
                });
                const years = Object.keys(yearMap).sort();
                labels.push(...years);
                data.push(...years.map(y => yearMap[y]));
            }

            // Add view header
            doc.setFontSize(14);
            doc.setTextColor(0, 102, 51);
            doc.text(`${view.charAt(0).toUpperCase() + view.slice(1)} Contribution`, 14, currentY);
            currentY += 6;

            // Add chart data table
            autoTable(doc, {
                startY: currentY,
                head: [['Period', 'Total Waste (kg)']],
                body: labels.map((label, i) => [label, `${data[i]} kg`]),
                theme: 'striped',
                styles: { fontSize: 10 },
            });

            currentY = doc.lastAutoTable.finalY + 10;
        });

        // Add stat summary at the end
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 51);
        doc.text('Overall Summary', 14, currentY);

        autoTable(doc, {
            startY: currentY + 6,
            head: [['Statistic', 'Value']],
            body: [
                ['Today’s Contribution', `${dailyTotal} kg`],
                ['Monthly Waste', `${monthlyAverage} kg`],
                ['Total Waste', `${totalKilo} kg`],
                ['Posted Sacks', `${postedCounts}`],
                ['Claimed Requests', `${claimedCount}`],
                ['Active Requests', `${pickupCount}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [34, 139, 34] },
            styles: { fontSize: 10 },
        });
        currentY = doc.lastAutoTable.finalY + 10

        doc.save(`Contribution_Report_${userName.replace(/\s/g, "_")}.pdf`);
    };

    return (
        <div style={{ background: 'linear-gradient(to bottom right, #0A4724, #116937)', padding: 10 }}>
            <section
                className="px-6"
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h1>
                        <div className="inline-block bg-green-900 px-4 py-2 rounded-full text-sm font-medium text-white mb-6 border border-green-300">
                            🌱 Connect with local partners and reduce waste
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why reuse your <br /> vegetable waste?</h2>
                        <p className="text-lg text-white mb-6">
                            Manage your waste sacks and requests efficiently and learn how your vegetable waste can bring new value!
                        </p>
                    </div>
                    <div className="flex-1">
                        <img src="/images/taytay-market.jpg" alt="Market" className="w-full h-full rounded-xl border shadow-lg" />
                    </div>
                </div>
            </section>

            <div className="flex justify-center gap-4 mt-10" >
                <button onClick={() => navigate(`/vendor/myStall/${userId}`)} className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-medium transition">
                    My Contribution
                </button>
                <button onClick={() => navigate(`/vendor/pickup`)} className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-medium transition">
                    Collection Request
                </button>
            </div>
            <br /><br />

            <div className="bg-white shadow rounded-xl p-6 max-w-6xl mx-auto">
                {/* Header and Dropdown */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h2 className="text-xl font-semibold text-gray-700">Waste Summary</h2>

                    <div className="flex items-center">
                        <label htmlFor="chartView" className="text-sm font-medium text-gray-600 mr-2">
                            View:
                        </label>
                        <select
                            id="chartView"
                            value={chartView}
                            onChange={(e) => setChartView(e.target.value)}
                            className="border border-gray-300 p-2 rounded-md text-sm w-40"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <button
                            onClick={handleExportPDF}
                            className="ml-4 bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm rounded-md shadow"
                        >
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Chart and Stats Grid */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Chart */}
                    <div className="flex-1">
                        <canvas ref={chartRef} height="250"></canvas>
                    </div>

                    <div className="flex-1 space-y-6">
                        {/* Grid: 2 Columns */}
                        {/* Daily Stat */}
                        <div className="bg-gray-50 shadow-sm rounded-lg p-5 text-center">
                            <h3 className="text-sm text-gray-500 mb-1">Today's Contribution</h3>
                            <p className="text-2xl font-bold text-gray-800">{dailyTotal}<span className="text-base">kg</span></p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gray-50 shadow-sm rounded-lg p-5 text-center">
                                <h3 className="text-sm text-gray-500 mb-1">Total Waste</h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {totalKilo}<span className="text-base">kg</span>
                                </p>
                            </div>

                            <div className="bg-gray-50 shadow-sm rounded-lg p-5 text-center">
                                <h3 className="text-sm text-gray-500 mb-1">Monthly Waste</h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {monthlyAverage}<span className="text-base">kg</span>
                                </p>
                            </div>

                            <div className="bg-gray-50 shadow-sm rounded-lg p-5 text-center">
                                <h3 className="text-sm text-gray-500 mb-1">Posted Sacks</h3>
                                <p className="text-2xl font-bold text-gray-800">{postedCounts}</p>
                            </div>

                            <div className="bg-gray-50 shadow-sm rounded-lg p-5 text-center">
                                <h3 className="text-sm text-gray-500 mb-1">Claimed Requests</h3>
                                <p className="text-2xl font-bold text-gray-800">{claimedCount}</p>
                            </div>
                        </div>

                        {/* Active Request Stat */}
                        <div className="bg-gray-50 shadow-sm rounded-lg p-5 text-center">
                            <h3 className="text-sm text-gray-500 mb-1">Active Requests</h3>
                            <p className="text-2xl font-bold text-gray-800">{pickupCount}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorIndex;