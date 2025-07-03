import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../index.css";
import { getUser } from "../../../utils/helpers";

function formatFullDate(dateString) {
    const d = new Date(dateString);
    return `${d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })}`;
}

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function StallIndex() {
    const { id } = useParams();
    const [stall, setStall] = useState({});
    const [sacks, setSacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewFilter, setViewFilter] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);

    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const [stallRes, sacksRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API}/vendor/${id}`),
                    axios.get(`${import.meta.env.VITE_API}/sack/get-store-sacks/${id}`),
                ]);
                setStall(stallRes.data.stall);
                setSacks(sacksRes.data.sacks);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const now = new Date();

    const filteredSacks = sacks.filter((s) => {
        const c = new Date(s.createdAt);
        switch (viewFilter) {
            case "daily":
                return c.toDateString() === now.toDateString();
            case "weekly":
                {
                    const start = new Date(now);
                    start.setDate(now.getDate() - now.getDay());
                    return c >= start;
                }
            case "monthly":
                return (
                    c.getMonth() === selectedMonth &&
                    c.getFullYear() === selectedYear
                );
            case "yearly":
                return c.getFullYear() === selectedYear;
            default:
                return true;
        }
    });

    const yearOptions = [];
    for (let y = 2020; y <= now.getFullYear() + 1; y++) yearOptions.push(y);

    const sackColumns = [
        { name: "Sack ID", selector: r => `${r._id.slice(0, 6)}...${r._id.slice(-4)}`, grow: 2 },
        {
            name: "Image",
            cell: r => (
                <img
                    src={r.images?.[0]?.url}
                    alt="Sack"
                    className="w-16 h-16 object-cover rounded border"
                    onError={e => (e.target.style.display = "none")}
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
        { name: "Kilo", selector: r => `${r.kilo} kg`, sortable: true },
        { name: "Created At", selector: r => formatFullDate(r.createdAt), sortable: true },
        { name: "Spoilage Date", selector: r => formatFullDate(r.dbSpoil), sortable: true },
        {
            name: "Status",
            cell: r => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === "posted" ? "bg-green-200 text-green-800" :
                    r.status === "claimed" ? "bg-blue-200 text-blue-800" :
                        "bg-yellow-200 text-yellow-800"
                    }`}>
                    {r.status}
                </span>
            ),
            sortable: true,
        },
    ];

    function totalByPeriod(type) {
        const entries = {};
        sacks.forEach((s) => {
            const d = new Date(s.createdAt);
            let key;
            if (type === "weekly")
                key = d.toLocaleDateString("en-US", { weekday: "short" });
            if (type === "monthly") key = monthNames[d.getMonth()];
            if (type === "yearly") key = "" + d.getFullYear();
            entries[key] = (entries[key] || 0) + parseFloat(s.kilo);
        });

        if (type === "monthly") monthNames.forEach(m => (entries[m] = entries[m] || 0));
        if (type === "yearly") {
            const yearsAll = [...new Set(sacks.map(s => new Date(s.createdAt).getFullYear()))].sort();
            yearsAll.forEach(y => (entries["" + y] = entries["" + y] || 0));
        }

        return Object.entries(entries)
            .sort(([a], [b]) => {
                return type === "monthly"
                    ? monthNames.indexOf(a) - monthNames.indexOf(b)
                    : a < b
                        ? -1
                        : 1;
            })
            .map(([label, value]) => ({ label, value }));
    }

    useEffect(() => {
        if (!showModal || !chartRef.current) return;
        const ctx = chartRef.current.getContext("2d");
        if (chartInstance.current) chartInstance.current.destroy();

        const dataArr = totalByPeriod(modalType);
        chartInstance.current = new Chart(ctx, {
            type: modalType === "weekly" ? "bar" : "line",
            data: {
                labels: dataArr.map(d => d.label),
                datasets: [{
                    label:
                        modalType === "weekly" ? "Kg per day" :
                            modalType === "monthly" ? "Kg per month" :
                                "Kg per year",
                    data: dataArr.map(d => d.value),
                    backgroundColor: "rgba(34,197,94,0.4)",
                    borderColor: "rgba(34,197,94,1)",
                    fill: modalType !== "weekly",
                    tension: 0.3,
                }],
            },
            options: { responsive: true, maintainAspectRatio: false },
        });
    }, [showModal, modalType, sacks]);

    async function handlePrint() {
        const doc = new jsPDF("p", "pt", "a4");
        const title = `${viewFilter.charAt(0).toUpperCase() + viewFilter.slice(1)} Contributions Report`;
        doc.setFontSize(18);
        doc.text(title, 40, 40);

        let yPos = 60;

        // 1. Add stall image if exists
        if (stall.stallImage?.url) {
            try {
                const imgData = await getImageDataUrl(stall.stallImage.url);
                const imgWidth = 100;
                const imgHeight = 100;
                doc.addImage(imgData, "JPEG", 40, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
            } catch (err) {
                console.warn("Failed to load stall image for PDF:", err);
            }
        }

        // 2. Add description text below image
        const description = `Stall: ${stall.stallNumber || "N/A"}
Location: ${stall.stallAddress || "N/A"}
Store: ${stall.storeType || "N/A"}`

        doc.setFontSize(12);
        doc.text(description, 40, yPos);
        yPos += 50;

        // Prepare table data
        const tableData = modalType
            ? totalByPeriod(modalType)
            : filteredSacks.map(s => ({
                label: formatFullDate(s.createdAt),
                value: parseFloat(s.kilo),
            }));

        // 3. Calculate total kilos
        const totalKilos = tableData.reduce((sum, item) => sum + item.value, 0);

        // Print total kilos
        doc.setFontSize(14);
        doc.text(`Total Kilos: ${totalKilos.toFixed(2)} kg`, 40, yPos);
        yPos += 20;

        // Print the table starting below total kilos
        autoTable(doc, {
            startY: yPos,
            head: [["Period", "Kg"]],
            body: tableData.map(d => [d.label, d.value]),
            theme: "striped",
        });

        // Print the chart image for monthly/yearly filters
        if (["daily", "monthly", "yearly"].includes(viewFilter)) {
            const canvas = chartRef.current;
            if (canvas) {
                const imgData = canvas.toDataURL("image/png");
                const yOffset = doc.lastAutoTable.finalY + 20;
                const imgWidth = 500;
                const imgHeight = (canvas.height / canvas.width) * imgWidth;
                doc.addImage(imgData, "PNG", 40, yOffset, imgWidth, imgHeight);
            }
        }

        doc.save(`${title}.pdf`);
    }

    // Helper function to convert image URL to base64 Data URL for jsPDF
    function getImageDataUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous"); // Handle CORS if image is external
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/jpeg");
                resolve(dataURL);
            };
            img.onerror = (err) => reject(err);
            img.src = url;
        });
    }


    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold text-gray-600">Loading...</p>
            </div>
        );

    return (
        <div className="p-6 bg-gray-100 min-h-screen fade-in">
            <ToastContainer />
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">

                <a href="/admin/view/stalls" className="text-green-600 text-sm hover:underline">
                    ← Back to Directory
                </a>

                <div className="flex flex-wrap md:flex-nowrap gap-6 p-6">
                    <img
                        src={stall.stallImage?.url}
                        alt="Stall"
                        className="w-full md:w-1/3 h-80 object-cover border-4 border-green-500 rounded"
                    />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <h1 className="text-2xl font-bold">{stall.vendorName}</h1>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white uppercase ${stall.status?.toLowerCase() === "open" ? "bg-green-600" : "bg-red-600"
                                }`}>
                                {stall.status?.toUpperCase()}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            A produce vendor offering food waste as alternative feeds & composting.
                        </p>
                        <div className="mt-4 flex space-x-10 text-sm text-gray-700">
                            <div>
                                <span className="font-semibold">Stall #</span><br />
                                {stall.stallNumber || "N/A"}
                            </div>
                            <div>
                                <span className="font-semibold">Location</span><br />
                                {stall.stallAddress || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                    {["all", "daily", "weekly", "monthly", "yearly"].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setViewFilter(f); setModalType(null); }}
                            className={`px-4 py-2 rounded text-sm ${viewFilter === f ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}

                    {["daily", "weekly", "monthly", "yearly"].includes(viewFilter) && (
                        <>
                            <button
                                onClick={() => {
                                    setModalType(viewFilter);
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                            >
                                View {viewFilter.charAt(0).toUpperCase() + viewFilter.slice(1)} Chart
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-purple-600 text-white rounded text-sm ml-2"
                            >
                                Print
                            </button>
                        </>
                    )}


                    {viewFilter === "all" && (
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-purple-600 text-white rounded text-sm"
                        >
                            Print All Contributions
                        </button>
                    )}
                </div>

                {(viewFilter === "monthly" || viewFilter === "yearly") && (
                    <div className="flex items-center gap-4 mb-6">
                        {viewFilter === "monthly" && (
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(+e.target.value)}
                                className="border rounded px-3 py-1 text-sm w-27"
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i} value={i}>{m}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(+e.target.value)}
                            className="border rounded px-3 py-1 text-sm w-20"
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                )}

                <DataTable
                    title={`Sacks (${filteredSacks.length})`}
                    columns={sackColumns}
                    data={filteredSacks}
                    pagination
                    highlightOnHover
                    responsive
                    dense
                    striped
                />
            </div>

            {/* Chart Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Contributions
                        </h2>
                        <div className="w-full h-64">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StallIndex;