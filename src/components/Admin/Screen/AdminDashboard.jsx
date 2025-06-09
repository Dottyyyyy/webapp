import { useEffect, useState } from "react";

import '../../../index.css'
import axios from "axios";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import DashboardCard02 from "../../partials/MarketDashboard/DashboardCard02";
import DashboardCard03 from "../../partials/MarketDashboard/DashboardCard03";
import DashboardCard04 from "../../partials/MarketDashboard/DashboardCard04";
import DashboardCard05 from "../../partials/MarketDashboard/DashboardCard05";
import DashboardCard12 from "../../partials/MarketDashboard/DashboardCard12";
import MarketDashboardCard01 from "../../partials/MarketDashboard/DashboardCard01";
import DashboardCard01 from "../../partials/dashboard/DashboardCard01";

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [allRatings, setAllRatings] = useState([]);

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

    return (
        <div className="flex h-screen overflow-hidden fade-in">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-[#E9FFF3]">
                {/* Header */}

                {/* Main content with footer */}
                <main className="grow flex flex-col justify-between min-h-screen">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        {/* Dashboard Title */}
                        <div className="sm:flex sm:justify-between sm:items-center mb-8">
                            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                                📉
                                Market Analytics
                            </h1>
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
                            <DashboardCard04 />
                            <DashboardCard05 />
                            <MarketDashboardCard01 />
                            <DashboardCard01 />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;