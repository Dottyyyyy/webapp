import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from 'react-data-table-component';
import '../../../index.css';
import { getUser } from "../../../utils/helpers";

const CompPickup = () => {
    const navigate = useNavigate();
    const user = getUser();
    const userId = user._id;

    // State variables
    const [mySack, setMySacks] = useState([]); // Keep the full list of sacks
    const [statusFilter, setStatusFilter] = useState("all");
    const [filteredSacks, setFilteredSacks] = useState([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Fetch pickup sacks
    const fetchMySacks = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/sack/get-pickup-sacks/${userId}`);
            const pickUpSacks = response.data.pickUpSacks;

            if (!Array.isArray(pickUpSacks)) {
                console.error("pickUpSacks is not an array:", pickUpSacks);
                return;
            }

            const now = new Date();
            const nowUTC8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);

            // Clean up outdated pickup sacks
            for (const sack of pickUpSacks) {
                const pickupTimestamp = new Date(sack.pickupTimestamp);
                if (pickupTimestamp.getTime() <= nowUTC8.getTime() && sack.status !== "completed") {
                    const sackIds = sack.sacks.map(s => s.sackId);
                    await axios.delete(`${import.meta.env.VITE_API}/sack/delete-pickuped-sack/${sack._id}`, {
                        data: { sackIds }
                    });
                    toast.warning('You did not pick up the sack, it will return there');
                }
            }

            setMySacks(pickUpSacks); // Set all sacks before filtering
            setFilteredSacks(applyFilterAndPagination(pickUpSacks, dateFrom, dateTo, statusFilter)); // Apply filter and pagination
        } catch (error) {
            console.error("Error fetching sacks:", error.response?.data || error.message);
        }
    };

    // Apply filters
    const applyFilterAndPagination = (data, from, to, status) => {
        let filtered = [...data];

        if (status && status !== "all") {
            filtered = filtered.filter(item => item.status === status);
        }

        if (from && to) {
            const fromDate = new Date(from);
            const toDate = new Date(to);
            filtered = filtered.filter(item => {
                const created = new Date(item.createdAt);
                return created >= fromDate && created <= toDate;
            });
        }

        return filtered;
    };

    // Fetch sacks on mount
    useEffect(() => {
        if (userId) {
            fetchMySacks();
            const interval = setInterval(() => {
                fetchMySacks();
            }, 3000); // Refresh every 3 seconds
            return () => clearInterval(interval);
        }
    }, [userId]);

    // Re-filter sacks whenever relevant state changes
    useEffect(() => {
        setFilteredSacks(applyFilterAndPagination(mySack, dateFrom, dateTo, statusFilter));
    }, [mySack, statusFilter, dateFrom, dateTo]);

    // Handle status change
    const handleStatusChange = (status) => {
        setStatusFilter(status.toLowerCase());
    };

    // Count the number of sacks per status
    const countStatus = (status) => {
        return mySack.filter(item => item.status.toLowerCase() === status.toLowerCase()).length;
    };

    // Columns configuration for the DataTable
    const columns = [
        {
            name: 'Pickup No.',
            selector: row => row._id.slice(-5).toUpperCase(),
            sortable: true,
            style: {
                fontWeight: 'bold'
            }
        },
        {
            name: 'Stall No.',
            selector: row => row.sacks.map(sack => sack.stallNumber).join(", "),
            sortable: true,
        },
        {
            name: 'Weight',
            selector: row => `${row.totalKilo} kg`,
            sortable: true
        },
        {
            name: 'To Pickup',
            selector: row => row.sacks.length,
            sortable: true,
        },
        {
            name: "Pickup Date",
            selector: row =>
                new Date(row.status === 'completed' ? row.pickedUpDate : row.pickupTimestamp).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }),
        },
        {
            name: "Pickup Time",
            selector: row =>
                new Date(row.status === 'completed' ? row.pickedUpDate : row.pickupTimestamp).toLocaleTimeString("en-US", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => {
                let statusColor = '';
                let label = '';

                switch (row.status) {
                    case 'pending':
                        statusColor = 'bg-yellow-100 text-yellow-800';
                        label = 'Pending';
                        break;
                    case 'pickup':
                        statusColor = 'bg-blue-100 text-blue-800';
                        label = 'Ongoing Pickup';
                        break;
                    case 'completed':
                        statusColor = 'bg-green-100 text-green-800';
                        label = 'Completed';
                        break;
                    default:
                        statusColor = 'bg-gray-100 text-gray-800';
                        label = row.status;
                }

                return (
                    <span className={`capitalize px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {label}
                    </span>
                );
            }
        }
    ];

    return (
        <div className="flex-grow p-6 fade-in" style={{ background: "linear-gradient(to bottom right, #0A4724, #116937)", padding: 10 }}>
            <div className="flex justify-center items-center">
                <div className="w-full lg:w-[90%] bg-[#355E3B] border-2 border-green-900 p-6 rounded-lg">
                    {/* Filter Tabs */}
                    <div className="flex justify-center gap-6 mb-6">
                        {['Pending', 'Pickup', 'Completed'].map((status) => {
                            // Count statuses directly from the full list
                            const statusCount = countStatus(status);

                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`px-8 py-4 rounded-xl border-2 border-green-900 text-green-900 font-semibold ${statusFilter === status.toLowerCase() ? 'bg-green-100' : 'bg-white'}`}
                                >
                                    ({statusCount}) {/* Show the correct count */}
                                    <h1 style={{ fontSize: 30 }}>
                                        {status}
                                    </h1>
                                </button>
                            );
                        })}
                    </div>

                    {/* DataTable */}
                    <DataTable
                        columns={columns}
                        data={filteredSacks}
                        pagination
                        onRowClicked={(row) => navigate(`/pickup/see/${row._id}`, { state: { pickupData: row } })}
                        highlightOnHover
                        pointerOnHover
                        noDataComponent="No records found"
                    />
                </div>
            </div>
        </div>
    );
};

export default CompPickup;