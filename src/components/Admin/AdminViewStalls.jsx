import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isBetween from "dayjs/plugin/isBetween";
import { ToastContainer, toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { Chart } from "chart.js/auto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../partials/Sidebar"; // Adjust according to your import
import { getUser } from "../../utils/helpers";

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

function AdminViewStalls() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const user = getUser();
    const [stalls, setStalls] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [formValues, setFormValues] = useState({
        stallDescription: '',
        stallAddress: '',
        stallNumber: '',
        openHours: '',
        closeHours: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const [showStallModal, setShowStallModal] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);

    // Market report states
    const [showMarketReportModal, setShowMarketReportModal] = useState(false);
    const [marketSacks, setMarketSacks] = useState([]);
    const [marketViewFilter, setMarketViewFilter] = useState("all"); // all, daily, weekly, monthly, yearly

    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Fetch stalls
    const fetchStalls = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/get-all-stalls`);
            setStalls(response.data.stalls);
        } catch (error) {
            console.error("Error fetching stalls:", error);
        }
    };

    useEffect(() => {
        fetchStalls();
        const interval = setInterval(fetchStalls, 7000);
        return () => clearInterval(interval);
    }, []);


    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // console.log(avatar,'Avatar')

    const validateForm = () => {
        const errors = {};
        if (!formValues.stallDescription) errors.stallDescription = 'Description is required';
        if (!formValues.stallAddress) errors.stallAddress = 'Address is required';
        if (!formValues.stallNumber) errors.stallNumber = 'Stall number is required';
        if (!formValues.openHours) errors.openHours = 'Opening hours are required';
        if (!formValues.closeHours) errors.closeHours = 'Closing hours are required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure time values are in the correct format (HH:mm)
        const formatTime = (time) => {
            if (!time || !time.match(/^(\d{2}):(\d{2})$/)) {
                return '';
            }
            const [hours, minutes] = time.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        };

        const updatedFormValues = {
            ...formValues
        };

        if (validateForm()) {
            try {
                const formData = new FormData();
                formData.append('stallDescription', updatedFormValues.stallDescription);
                formData.append('stallAddress', updatedFormValues.stallAddress);
                formData.append('stallNumber', updatedFormValues.stallNumber);
                formData.append('openHours', formValues.openHours);
                formData.append('closeHours', formValues.closeHours);

                // If an avatar is selected, append it as well
                if (avatar) {
                    formData.append('avatar', avatar);
                }

                const response = await axios.put(`${import.meta.env.VITE_API}/vendor/add-stall/${selectedVendorId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                setShowStallModal(false);
                setFormValues({
                    stallDescription: '',
                    stallAddress: '',
                    stallNumber: '',
                    openHours: '',
                    closeHours: '',
                });
                setSelectedVendorId(null);
                setAvatar(null);
                setPreview(null);
                toast.success('Edit Stall Credentials was successful.');
                fetchStalls()
            } catch (error) {
                console.error(error);
                toast.error('Failed to add stall. Please try again.');
            }
        } else {
            toast.error('Please fill in all required fields.');
        }
    };

    const generateTimeOptions = () => {
        const times = [];
        const pad = (n) => (n < 10 ? `0${n}` : n);
        for (let h = 1; h <= 12; h++) {
            for (let m = 0; m < 60; m += 15) {
                ['am', 'pm'].forEach((ampm) => {
                    times.push(`${pad(h)}:${pad(m)} ${ampm}`);
                });
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    // Fetch sacks for Market Report modal
    useEffect(() => {
        if (showMarketReportModal) {
            axios
                .get(`${import.meta.env.VITE_API}/sack/get-sacks`)
                .then((res) => {
                    setMarketSacks(res.data.sacks || []);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Failed to load sacks for market report");
                });
        }
    }, [showMarketReportModal]);

    // Filter sacks based on period
    function filterSacksByPeriod(sacks, period) {
        if (period === "all") return sacks;
        const now = dayjs();
        return sacks.filter((s) => {
            const date = dayjs(s.createdAt);
            if (period === "daily") return date.isSame(now, "day");
            if (period === "weekly") return date.isSame(now, "week");
            if (period === "monthly") return date.isSame(now, "month");
            if (period === "yearly") return date.isSame(now, "year");
            return true;
        });
    }

    const filteredSacks = filterSacksByPeriod(marketSacks, marketViewFilter);

    // Aggregate sacks with custom logic for week, month, year
    function aggregateSacks(sacks, period) {
        const groups = {};

        if (period === "weekly") {
            const now = dayjs();
            const startOfWeek = now.startOf("isoWeek");
            const endOfWeek = now.endOf("isoWeek");

            for (let i = 0; i < 7; i++) {
                const dayName = startOfWeek.add(i, "day").format("dddd");
                groups[dayName] = 0;
            }

            sacks.forEach((s) => {
                const date = dayjs(s.createdAt);
                if (date.isBetween(startOfWeek.subtract(1, "second"), endOfWeek.add(1, "second"))) {
                    const dayName = date.format("dddd");
                    groups[dayName] += parseFloat(s.kilo);
                }
            });
        } else if (period === "monthly") {
            const months = Array.from({ length: 12 }, (_, i) => dayjs().month(i).format("MMMM"));
            months.forEach((m) => (groups[m] = 0));

            sacks.forEach((s) => {
                const date = dayjs(s.createdAt);
                const monthName = date.format("MMMM");
                groups[monthName] += parseFloat(s.kilo);
            });
        } else if (period === "yearly") {
            if (sacks.length === 0) return [];

            const years = sacks.map((s) => dayjs(s.createdAt).year());
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);

            for (let y = minYear; y <= maxYear; y++) {
                groups[y.toString()] = 0;
            }

            sacks.forEach((s) => {
                const year = dayjs(s.createdAt).year().toString();
                groups[year] += parseFloat(s.kilo);
            });
        } else {
            sacks.forEach((s) => {
                const date = dayjs(s.createdAt).format("MMMM D, YYYY");
                if (!groups[date]) groups[date] = 0;
                groups[date] += parseFloat(s.kilo);
            });
        }

        return Object.entries(groups).map(([label, value]) => ({ label, value }));
    }

    const aggregatedData = aggregateSacks(filteredSacks, marketViewFilter);

    // Setup Chart.js chart
    useEffect(() => {
        if (!showMarketReportModal) return;
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: "bar",
            data: {
                labels: aggregatedData.map((d) => d.label),
                datasets: [
                    {
                        label: "Kg",
                        data: aggregatedData.map((d) => d.value),
                        backgroundColor: "rgba(34,197,94,0.7)",
                        borderColor: "rgba(34,197,94,1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                },
            },
        });
    }, [aggregatedData, showMarketReportModal]);

    // Print report function
    const handlePrintMarketReport = () => {
        const doc = new jsPDF("p", "pt", "a4");
        const title = `Market Contributions Report - ${marketViewFilter.charAt(0).toUpperCase() + marketViewFilter.slice(1)}`;

        doc.setFontSize(18);
        doc.text(title, 40, 40);

        const tableOptions = {
            startY: 60,
            head: [["#", "Period", "Kg"]],
            body: filteredSacks.map((row, idx) => [
                idx + 1,
                dayjs(row.createdAt).format("MMMM D, YYYY h:mm A"),
                parseFloat(row.kilo).toFixed(2),
            ]),
            theme: "striped",
            pageBreak: "auto",         // ensures table spans pages
            headStyles: { fillColor: [34, 197, 94] },
            styles: { fontSize: 10 },
            margin: { top: 60, bottom: 40 },
        };

        autoTable(doc, tableOptions);

        const totalKg = filteredSacks.reduce((sum, r) => sum + parseFloat(r.kilo), 0);
        const yOffset = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text(`Total Kg: ${totalKg.toFixed(2)}`, 40, yOffset);

        if (chartRef.current) {
            const imgData = chartRef.current.toDataURL("image/png");
            const imgWidth = doc.internal.pageSize.getWidth() - 80;
            const imgHeight = (chartRef.current.height / chartRef.current.width) * imgWidth;

            let imgY = yOffset + 20;
            if (imgY + imgHeight > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                imgY = 40;
            }

            doc.addImage(imgData, "PNG", 40, imgY, imgWidth, imgHeight);
        }

        doc.save(`${title}.pdf`);
    };

    // Market report table columns
    const marketReportColumns = [
        { name: "#", selector: (row, i) => i + 1, width: "40px" },
        { name: "Date", selector: (row) => dayjs(row.createdAt).format("MMMM D, YYYY h:mm A"), sortable: true },
        {
            name: "Kg",
            selector: (row) => parseFloat(row.kilo).toFixed(2),
            sortable: true,
        },
    ];

    return (
        <div className="flex h-screen overflow-hidden fade-in">
            <ToastContainer />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col bg-gray-100 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none w-200 p-6">
                <main className="grow min-h-screen">
                    {/* Market Report Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setShowMarketReportModal(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            View Market Report
                        </button>
                    </div>

                    <DataTable
                        title="Admin Stall Management"
                        columns={[
                            {
                                name: "#",
                                selector: (row, index) => index + 1,
                                sortable: true,
                                width: "60px",
                            },
                            {
                                name: "Vendor",
                                selector: (row) => row.name,
                                sortable: true,
                            },
                            {
                                name: "Stall Number",
                                selector: (row) => row.stall?.stallNumber,
                                sortable: true,
                            },
                            {
                                name: "Address",
                                selector: (row) => row.stall?.stallAddress,
                                sortable: true,
                            },
                            {
                                name: "Status",
                                cell: (row) => (
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full text-white ${row.stall?.status === "open" ? "bg-green-600" : "bg-red-600"
                                            }`}
                                    >
                                        {row.stall?.status}
                                    </span>
                                ),
                                sortable: true,
                            },
                            {
                                name: "Image",
                                cell: (row) => (
                                    <img
                                        src={row?.stall?.stallImage?.url}
                                        alt="Stall"
                                        className="w-20 h-16 object-cover rounded"
                                    />
                                ),
                            },
                            {
                                name: "Action",
                                cell: (row) => (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                navigate(`/admin/stall-index/${row.stall.user}`, {
                                                    state: { stallId: row.stall.user, vendorId: row._id },
                                                })
                                            }
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedVendorId(row.stall.user);
                                                setFormValues({
                                                    stallDescription: row.stall.stallDescription || '',
                                                    stallAddress: row.stall.stallAddress || '',
                                                    stallNumber: row.stall.stallNumber || '',
                                                    openHours: row.stall.openHours || '',
                                                    closeHours: row.stall.closeHours || '',
                                                });
                                                setPreview(row.stall.stallImage?.url || null);
                                                setShowStallModal(true);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        data={stalls}
                        pagination
                        highlightOnHover
                        responsive
                        striped
                        dense
                        persistTableHead
                        customStyles={{
                            headRow: {
                                style: {
                                    backgroundColor: "#047857",
                                    color: "white",
                                    fontWeight: "bold",
                                },
                            },
                        }}
                    />

                    {showStallModal && (
                        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto px-4">
                            <div className="p-6 rounded-lg shadow-lg w-full max-w-4xl relative overflow-y-auto max-h-screen" style={{
                                background: 'linear-gradient(to bottom right,rgb(19, 117, 61),rgb(30, 157, 85))',
                            }}>
                                <button
                                    onClick={() => setShowStallModal(false)}
                                    className="absolute top-2 right-4 text-gray-700 text-3xl font-bold"
                                >
                                    &times;
                                </button>

                                <h1 className="text-center text-2xl font-bold mb-4">Change Stall Credentials</h1>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex justify-center">
                                        <label htmlFor="avatar-upload" className="cursor-pointer group">
                                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100 hover:border-green-600 transition">
                                                {preview ? (
                                                    <img
                                                        src={preview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl text-gray-400 group-hover:text-green-600">+</span>
                                                )}
                                            </div>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <textarea
                                            id="stallDescription"
                                            name="stallDescription"
                                            value={formValues.stallDescription}
                                            onChange={handleInputChange}
                                            placeholder="Stall Description"
                                            className="w-full border rounded p-2"
                                        />
                                        {formErrors.stallDescription && (
                                            <p className="text-red-600 text-sm">{formErrors.stallDescription}</p>
                                        )}
                                    </div>

                                    {/* Address and Number */}
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            name="stallAddress"
                                            placeholder="Stall Address"
                                            value={formValues.stallAddress}
                                            onChange={handleInputChange}
                                            className="w-1/2 border rounded p-2"
                                        />
                                        <input
                                            type="text"
                                            name="stallNumber"
                                            placeholder="Stall Number"
                                            value={formValues.stallNumber}
                                            onChange={handleInputChange}
                                            className="w-1/2 border rounded p-2"
                                        />
                                    </div>

                                    {/* Open/Close Hours */}
                                    <div className="flex gap-4">
                                        <div className="w-1/2">
                                            <label className="block text-sm mb-1">Open Hours</label>
                                            <select
                                                name="openHours"
                                                value={formValues.openHours}
                                                onChange={handleInputChange}
                                                className="w-full border rounded p-2"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {timeOptions.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-sm mb-1">Close Hours</label>
                                            <select
                                                name="closeHours"
                                                value={formValues.closeHours}
                                                onChange={handleInputChange}
                                                className="w-full border rounded p-2"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {timeOptions.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Edit Stall Credentials
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}


                    {/* Market Report Modal */}
                    {showMarketReportModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
                            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-135 p-6 relative overflow-auto">
                                <button
                                    onClick={() => setShowMarketReportModal(false)}
                                    className="absolute top-3 right-4 text-gray-700 text-3xl font-bold hover:text-black"
                                >
                                    &times;
                                </button>
                                <h2 className="text-xl font-bold mb-4">
                                    Market Contributions Report -{" "}
                                    {marketViewFilter.charAt(0).toUpperCase() + marketViewFilter.slice(1)}
                                </h2>

                                {/* Filter Buttons */}
                                <div className="flex gap-3 mb-4">
                                    {["all", "daily", "weekly", "monthly", "yearly"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setMarketViewFilter(f)}
                                            className={`px-4 py-2 rounded text-sm ${marketViewFilter === f
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-200 text-gray-800"
                                                }`}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handlePrintMarketReport}
                                        className="ml-auto px-4 py-2 bg-purple-600 text-white rounded text-sm"
                                    >
                                        Print Report
                                    </button>
                                </div>

                                {/* Total Kg Display */}
                                <div className="mt-4 font-semibold text-lg">
                                    Total Kg: {aggregatedData.reduce((acc, d) => acc + d.value, 0).toFixed(2)}
                                </div>
                                {/* Aggregated Data Table */}
                                <DataTable
                                    columns={marketReportColumns}
                                    data={filteredSacks}
                                    pagination
                                    highlightOnHover
                                    dense
                                    striped
                                    noHeader
                                    customStyles={{
                                        headRow: { style: { backgroundColor: "#22c55e", color: "white", fontWeight: "bold" } },
                                    }}
                                />

                                {/* Chart */}
                                <div className="mt-6">
                                    <canvas ref={chartRef} height="150"></canvas>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminViewStalls;