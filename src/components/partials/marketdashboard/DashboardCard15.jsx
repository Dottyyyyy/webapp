import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardCard15 = ({ onExportData }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  useEffect(() => {
    const fetchReviewRating = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/get-ratings-reviews`);
        const combinedReviews = [];

        data?.data?.forEach((user) => {
          const reviewsArray = user.stall?.review;

          if (Array.isArray(reviewsArray)) {
            reviewsArray.forEach((review) => {
              if (typeof review.text === "string" && review.text.trim() !== "") {
                combinedReviews.push({
                  text: review.text,
                  date: new Date(review.date).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  }),
                  userName: user.name || "Unknown",
                  userEmail: user.email || "",
                });
              }
            });
          }
        });

        setReviews(combinedReviews);

        // ⬇️ Pass to parent
        if (onExportData) onExportData(combinedReviews);

      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviewRating();
    const interval = setInterval(fetchReviewRating, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-2xl" style={{ backgroundColor: '#1D3B29' }}>


      <div className="p-6 space-y-4 min-h-[250px]">
        {paginatedReviews.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No reviews available.</p>
        ) : (
          paginatedReviews.map((review, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm text-sm text-gray-800 dark:text-gray-100"
            >
              <p>“{review.text}”</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                To — {review.userName} {review.userEmail && `(${review.userEmail})`}
              </p>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 px-6 pb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCard15;