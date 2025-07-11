import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

function DashboardCard14() {
  const [allRatings, setAllRatings] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  /* ─────────────────────────  FETCH  ───────────────────────── */
  const fetchReviewRating = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/get-ratings-reviews`
      );

      const flatValues = data.data.flatMap((user) => {
        const ratingsArr = user.stall?.rating ?? [];
        return ratingsArr.map((r) => r.value);
      });

      setAllRatings(flatValues);
    } catch (err) {
      console.error("Error fetching ratings:", err);
    }
  };

  /* ─────────────────────────  LOAD  ───────────────────────── */
  useEffect(() => {
    fetchReviewRating();
    const interval = setInterval(() => {
      fetchReviewRating();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────────  CHART  ───────────────────────── */
  useEffect(() => {
  if (!chartRef.current) return;
  if (chartInstanceRef.current) chartInstanceRef.current.destroy();

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allRatings.forEach((v) => {
    const num = Number(v);
    if (num >= 1 && num <= 5) counts[num]++;
  });

  const ctx = chartRef.current.getContext("2d");
  chartInstanceRef.current = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      datasets: [
        {
          label: "Rating Distribution",
          data: Object.values(counts),
          backgroundColor: [
            "#f87171", // red
            "#facc15", // yellow
            "#34d399", // green
            "#60a5fa", // blue
            "#a78bfa", // purple
          ],
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#1f2937", // tailwind's gray-800 (dark grey text)
            font: { size: 14 },
            generateLabels(chart) {
              const { labels } = chart.data;
              const { data, backgroundColor } = chart.data.datasets[0];
              return labels.map((lbl, i) => ({
                text: `${lbl} – ${data[i]}`,
                fillStyle: backgroundColor[i],
                strokeStyle: backgroundColor[i],
                color: "#1f2937", // dark grey
                index: i,
              }));
            },
          },
        },
      },
    },
  });
}, [allRatings]);


  /* ─────────────────────────  UI  ───────────────────────── */
  return (
    <div className="flex flex-col col-span-full sm:col-span-6 rounded-2xl">
  <header className="px-5 py-4 border-b border-gray-100 bg-transparent">
    <h2 className="font-semibold text-gray-800">
      Ratings Overview
    </h2>
  </header>

  <div className="p-4 flex items-center justify-center bg-transparent">
    <canvas ref={chartRef} width={350} height={350} />
  </div>
</div>

  );
}

export default DashboardCard14;