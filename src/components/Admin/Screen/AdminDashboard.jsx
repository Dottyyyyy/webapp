import { useEffect, useState } from "react";

import '../../../index.css'
import axios from "axios";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import MarketDashboardCard01 from "../../partials/marketdashboard/MarketDashboardCard01";
import DashboardCard01 from "../../partials/dashboard/DashboardCard01";
import DashboardCard14 from "../../partials/marketdashboard/DashboardCard14";
import DashboardCard15 from "../../partials/marketdashboard/DashboardCard15";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [allRatings, setAllRatings] = useState([]);
    const [dashboardCard01ExportData, setDashboardCard01ExportData] = useState([]);
    const [marketDashboardExportData, setMarketDashboardExportData] = useState(null);
    const [ratingDistributionExportData, setRatingDistributionExportData] = useState([]);
    const [reviewExportData, setReviewExportData] = useState([]);

    // console.log(allRatings, 'allRatings')

    const fetchReviewRating = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API}/get-ratings-reviews`);
            const stalls = res.data.data;
            setAllRatings(stalls);
        } catch (error) {
            console.error("Error fetching stalls:", error);
        }
    };

    useEffect(() => {
        fetchReviewRating();
        const interval = setInterval(() => {
            fetchReviewRating();
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    const [topSeller, setTopSeller] = useState(null);

    useEffect(() => {
        if (allRatings.length > 0) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const ratingsThisMonth = allRatings.map(seller => {
                const ratings = seller.stall?.rating || [];

                const thisMonthRatings = ratings.filter(r =>
                    r?.date &&
                    new Date(r.date).getMonth() === currentMonth &&
                    new Date(r.date).getFullYear() === currentYear
                );

                const avgRating = thisMonthRatings.length > 0
                    ? (thisMonthRatings.reduce((sum, r) => sum + (r.value || 0), 0) / thisMonthRatings.length)
                    : 0;

                return {
                    name: seller.name,
                    email: seller.email,
                    avgRating,
                    totalReviews: thisMonthRatings.length,
                };
            }).filter(s => s.totalReviews > 0);

            // Get top seller
            const top = ratingsThisMonth.sort((a, b) => b.avgRating - a.avgRating)[0];
            setTopSeller(top);
        }
    }, [allRatings]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Analytics Report", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

        let nextY = 35;

        // 🥇 Top Rated Vendor (This Month)
        if (topSeller) {
            doc.setFontSize(14);
            doc.text("Top Rated Waste Distributor (This Month)", 14, nextY);

            autoTable(doc, {
                head: [["Name", "Email", "Avg Rating", "Total Reviews"]],
                body: [[
                    topSeller.name,
                    topSeller.email,
                    `${topSeller.avgRating} star`,
                    topSeller.totalReviews,
                ]],
                startY: nextY + 4,
            });

            nextY = doc.lastAutoTable.finalY + 10;
        }

        // 🧮 CO2 Saved
        if (dashboardCard01ExportData.length > 0) {
            const totalCO2 = dashboardCard01ExportData.reduce((sum, row) => {
                const value = parseFloat(row.co2Saved.replace(' kg', '')) || 0;
                return sum + value;
            }, 0).toFixed(2);

            doc.setFontSize(14);
            doc.text("CO2 Saved (This Month)", 14, nextY);

            autoTable(doc, {
                head: [['Total CO2 Saved (kg)']],
                body: [[`${totalCO2} kg`]],
                startY: nextY + 4,
            });

            nextY = doc.lastAutoTable.finalY + 10;
        }

        // ⭐ Average Rating (All Stalls)
        if (marketDashboardExportData) {
            doc.setFontSize(14);
            doc.text("Average Rating (All Stalls)", 14, nextY);

            autoTable(doc, {
                head: [['Total Avg Rating', 'Total Stalls']],
                body: [[
                    marketDashboardExportData.totalAverageRating,
                    marketDashboardExportData.stallCount
                ]],
                startY: nextY + 4,
            });

            nextY = doc.lastAutoTable.finalY + 10;
        }

        // 📈 Vendor Average Ratings (sorted descending)
        const vendorAverages = allRatings.map((user) => {
            const ratings = user.stall?.rating || [];
            const total = ratings.length;
            const avg = total > 0
                ? (ratings.reduce((sum, r) => sum + r.value, 0) / total).toFixed(2)
                : 0;
            return {
                name: user.name || 'Unknown',
                email: user.email || '',
                avg,
                total,
            };
        }).filter(v => v.total > 0).sort((a, b) => b.avg - a.avg);

        if (vendorAverages.length > 0) {
            doc.setFontSize(14);
            doc.text("Vendor Average Ratings", 14, nextY);

            autoTable(doc, {
                head: [["Vendor", "Email", "Avg Rating", "Total Ratings"]],
                body: vendorAverages.map(v => [v.name, v.email, `${v.avg} star`, v.total]),
                startY: nextY + 4,
            });

            nextY = doc.lastAutoTable.finalY + 10;
        }

        // 🍰 Rating Distribution
        if (ratingDistributionExportData.length > 0) {
            doc.setFontSize(14);
            doc.text("Rating Distribution", 14, nextY);

            autoTable(doc, {
                head: [["Rating", "Count"]],
                body: ratingDistributionExportData.map((row) => [row.rating, row.count]),
                startY: nextY + 4,
            });

            nextY = doc.lastAutoTable.finalY + 10;
        }

        // 📝 Latest Reviews
        if (reviewExportData.length > 0) {
            const reviewTable = reviewExportData.slice(0, 10); // limit to 10

            doc.setFontSize(14);
            doc.text("Latest Reviews", 14, nextY);

            autoTable(doc, {
                head: [["Date", "Vendor", "Email", "Review"]],
                body: reviewTable.map((r) => [
                    r.date,
                    r.userName,
                    r.userEmail,
                    r.text.length > 50 ? r.text.slice(0, 50) + "..." : r.text,
                ]),
                startY: nextY + 4,
                styles: { fontSize: 8 },
                columnStyles: {
                    3: { cellWidth: 90 }
                }
            });

            nextY = doc.lastAutoTable.finalY + 10;
        }

        // 📋 All Individual Ratings
        const flatRatings = allRatings.flatMap((user) =>
            (user.stall?.rating || []).map((r) => ({
                name: user.name || "Unknown",
                email: user.email || "N/A",
                value: r.value,
                date: new Date(r.date).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                }),
            }))
        );

        if (flatRatings.length > 0) {
            doc.setFontSize(14);
            doc.text("All Individual Ratings", 14, nextY);

            autoTable(doc, {
                head: [["Date", "Vendor", "Email", "Rating"]],
                body: flatRatings.map((r) => [r.date, r.name, r.email, `${r.value} star`]),
                startY: nextY + 4,
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 20 },
                },
            });
        }

        doc.save(`New-Taytay-Market-Analytics-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="flex h-screen overflow-hidden fade-in">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-[#E9FFF3]">
                {/* Header */}

                {/* Main content with footer */}
                <main className="grow flex flex-col justify-between min-h-screen">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-9xl mx-auto">
                        {/* Dashboard Title */}
                        <div className="sm:flex sm:justify-between sm:items-center mb-8">
                            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                                📉
                                Market Analytics
                            </h1>
                            <button
                                onClick={handleDownloadPDF}
                                className="mb-6 bg-white text-green-700 font-semibold px-4 py-2 rounded shadow hover:bg-green-100"
                            >
                                📄 Download Analytics PDF
                            </button>
                        </div>
                        {topSeller && (
                            <div className="mt-8 p-6 rounded-xl bg-white shadow-lg dark:bg-gray-800 text-gray-800 dark:text-white">
                                <h2 className="text-xl font-semibold mb-2">🏆 Top Rated Waste Distributor This Month</h2>
                                <p><strong>Name:</strong> {topSeller.name}</p>
                                <p><strong>Email:</strong> {topSeller.email}</p>
                                <p><strong>Average Rating:</strong> {topSeller.avgRating} ⭐</p>
                                <p><strong>Total Reviews:</strong> {topSeller.totalReviews}</p>
                            </div>
                        )}

                        {/* Dashboard Cards */}
                        <div className="grid grid-cols-12 gap-6">
                            <DashboardCard14 onExportData={setRatingDistributionExportData} />
                            <DashboardCard15 onExportData={setReviewExportData} />
                            <MarketDashboardCard01 onExportData={setMarketDashboardExportData} />
                            <DashboardCard01 onExportData={setDashboardCard01ExportData} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;