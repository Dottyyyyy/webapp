import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Navigation/Sidebar";
import { getUser } from "../../../utils/helpers";
import axios from "axios";
import DataTable from "react-data-table-component";
import '../../../index.css';

const VendorPickup = () => {
    const navigate = useNavigate();
    const user = getUser();
    const sellerId = user._id;
    const [mySack, setMySacks] = useState([]);
    const [filteredSacks, setFilteredSacks] = useState([]);
    const [sellers, setSellers] = useState({});
    const [users, setUsers] = useState({});
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState('all'); // default is All


    const fetchMySacks = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/sack/stall-pickup-sacks/${sellerId}`);
            const pickUpSacks = response.data;

            const filtered = pickUpSacks.map(pickup => {
                const sellerSacks = pickup.sacks.filter(sack => sack.seller === sellerId);
                const totalKilo = sellerSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);
                return {
                    ...pickup,
                    sacks: sellerSacks,
                    totalKilo: totalKilo.toString(),
                };
            }).filter(pickup => pickup.sacks.length > 0);

            setMySacks(filtered);
            setFilteredSacks(applyDateFilter(filtered, dateFrom, dateTo));
            fetchUsers(filtered);
        } catch (err) {
            console.error("Failed to fetch sacks:", err);
        }
    };
    console.log(users, 'users')

    const fetchUsers = async (sacks) => {
        try {
            const userIds = [...new Set(sacks.map(s => s.user))];

            const idsToFetch = userIds.filter(id => !(id in users)); // Use the current users state

            if (idsToFetch.length === 0) return;

            const fetchedUsers = {};
            await Promise.all(idsToFetch.map(async id => {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/get-user/${id}`);
                fetchedUsers[id] = data.user.name;
            }));

            setUsers(prev => ({ ...prev, ...fetchedUsers }));
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };
    console.log(users, 'users')

    const applyDateFilter = (data, from, to) => {
        let filtered = [...data];
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

    useEffect(() => {
        fetchMySacks();
        const interval = setInterval(fetchMySacks, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const result = applyAllFilters(mySack);
        setFilteredSacks(result);
    }, [statusFilter, dateFrom, dateTo, mySack]);

    const columns = [
        {
            name: "Pickup ID",
            selector: row => row._id.slice(-5).toUpperCase(),
            sortable: true,
            grow: 2
        },
        {
            name: "Total Kilo",
            selector: row => row.totalKilo,
            sortable: true,
        },
        {
            name: "Status",
            cell: row => (
                <span
                    className={`font-bold px-3 py-1 rounded-full text-white text-sm ${row.status.toLowerCase() === "completed" ? "bg-green-600" :
                        row.status.toLowerCase() === "ongoing" ? "bg-orange-500" :
                            "bg-gray-400"
                        }`}
                >
                    {row.status}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Pickup Date",
            selector: row => new Date(row.pickupTimestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        },
        {
            name: "Pickup Time",
            selector: row => new Date(row.pickupTimestamp).toLocaleTimeString("en-US", {
                timeZone: "UTC",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        },
    ];

    const applyAllFilters = (data) => {
        let filtered = [...data];

        // Filter by date
        if (dateFrom && dateTo) {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            filtered = filtered.filter(item => {
                const created = new Date(item.createdAt);
                return created >= from && created <= to;
            });
        }

        // Filter by status (only if not 'all')
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
        }

        return filtered;
    };

    const countStatus = (status) => {
        if (status.toLowerCase() === 'all') return mySack.length;
        return mySack.filter(pickup => pickup.status.toLowerCase() === status.toLowerCase()).length;
    };
    const handleStatusChange = (status) => {
        setStatusFilter(status.toLowerCase());
    };

    return (
        <div className="p-6 fade-in" style={{ background: 'linear-gradient(to bottom right, #0A4724, #116937)' }}>
            <h1 className="text-white text-2xl font-bold mb-4 text-center">Pickup Waste</h1>
            <div className="mb-4 flex gap-4 flex justify-center">
                <div>
                    <label className="block text-white font-medium mb-1 text-center">From:</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-white font-medium mb-1 text-center">To:</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="p-2 rounded"
                    />
                </div>
            </div>
            {(dateFrom || dateTo) && (
                <div className="flex" style={{ justifySelf: 'center' }}>
                    <button
                        onClick={() => { setDateFrom(""); setDateTo(""); }}
                        className="text-red-200 underline text-sm ml-4"
                    >
                        Clear
                    </button>
                </div>
            )}

            <div className="flex justify-center gap-6 mb-6">
                {['All', 'Pickup', 'Completed'].map((status) => {
                    const statusCount = countStatus(status);
                    return (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-8 py-4 rounded-xl border-2 border-green-900 text-green-900 font-semibold ${statusFilter === status.toLowerCase() ? 'bg-green-100' : 'bg-white'
                                }`}
                        >
                            ({statusCount})
                            <h1 style={{ fontSize: 30 }}>
                                {status}
                            </h1>
                        </button>
                    );
                })}
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredSacks}
                    pagination
                    onRowClicked={(row) => navigate(`/vendor/pickup-detail/${row._id}`, { state: { pickupData: row } })}
                    highlightOnHover
                    striped
                    persistTableHead
                />
            </div>
        </div>
    );
};

export default VendorPickup;