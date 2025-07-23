import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../../utils/helpers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import CreateSack from './CreateSack';
import { FaTrash, FaPlus, FaStar } from 'react-icons/fa';

const MyStall = () => {
    const { id } = useParams();
    const [stall, setStall] = useState(null);
    const [sacks, setStoreSacks] = useState([]);
    const [filter, setFilter] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [sackToDelete, setSackToDelete] = useState(null);

    const user = getUser();

    const fetchStore = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/vendor/${id}`);
            setStall(data.stall);
        } catch (error) {
            console.error("Error fetching stall:", error);
        }
    };

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-store-sacks/${user._id}`);
            setStoreSacks(data.sacks);
        } catch (error) {
            console.error("Error fetching sacks:", error);
        }
    };

    useEffect(() => {
        fetchStore();
        fetchStoreSacks();
    }, []);

    const getAverageRating = (ratings = []) => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, item) => sum + item.value, 0);
        return (total / ratings.length).toFixed(1);
    };

    const filteredSacks = sacks.filter((sack) => {
        const sackDate = new Date(sack.dbSpoil).toISOString().split("T")[0];
        const isStatusMatch = filter === "All" || sack.status.toLowerCase() === filter.toLowerCase();
        const isWithinDateRange = (!fromDate || sackDate >= fromDate) && (!toDate || sackDate <= toDate);
        return isStatusMatch && isWithinDateRange;
    });

    const sortedSacks = [...filteredSacks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleDeleteClick = (sack) => {
        setSackToDelete(sack);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteSack = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API}/sack/delete-sack/${sackToDelete._id}`);
            toast.success("Sack successfully deleted.");
            fetchStoreSacks();
        } catch (error) {
            console.error("Error deleting sack:", error);
        } finally {
            setShowDeleteConfirm(false);
            setSackToDelete(null);
        }
    };

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#064e3b',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
            },
        },
        rows: {
            style: {
                fontSize: '14px',
                minHeight: '60px',
                borderBottom: '1px solid #e5e7eb',
            },
        },
        pagination: {
            style: {
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
            },
        },
    };

    const columns = [
        {
            name: 'Image',
            selector: row => <img src={row.images?.[0]?.url || 'https://via.placeholder.com/100x80'} alt="sack" className="w-16 h-12 object-cover rounded" />,
            sortable: false,
        },
        {
            name: 'Weight (kg)',
            selector: row => row.kilo,
            sortable: true,
        },
        {
            name: 'Location',
            selector: row => row.location,
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: false,
            wrap: true
        },
        {
            name: 'Spoiled Date',
            selector: row => new Date(row.dbSpoil).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            cell: row => {
                const displayStatus = row.status === 'posted' ? 'Recently' : row.status.charAt(0).toUpperCase() + row.status.slice(1);
                return (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'claimed' ? 'bg-green-100 text-green-700' :
                        row.status === 'trashed' ? 'bg-red-100 text-red-700' :
                            row.status === 'spoiled' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-200 text-gray-800'
                        }`}>
                        {displayStatus}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                ['posted', 'spoiled'].includes(row.status.toLowerCase()) && (
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <FaTrash />
                    </button>
                )
            ),
        },
    ];

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-green-900 to-green-700 text-white">
            <ToastContainer />

            {stall ? (
                <div className="max-w-6xl mx-auto mb-10 bg-white text-gray-900 rounded-xl shadow-md overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-6 p-6">
                        <img
                            src={stall.stallImage?.url || "https://via.placeholder.com/800x400"}
                            alt="Stall"
                            className="rounded-xl w-full h-64 object-cover"
                        />
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{stall.stallName}</h2>
                            <p><strong>Stall #:</strong> {stall.stallNumber}</p>
                            <p><strong>Address:</strong> {stall.stallAddress}</p>
                            <p className="mb-2"><strong>Description:</strong> {stall.stallDescription}</p>
                            <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-500" />
                                <span>{getAverageRating(stall.rating)} ({stall.rating?.length || 0} ratings)</span>
                            </div>
                            <div className="mt-3 space-x-2">
                                {[
                                    { label: "All", value: "All" },
                                    { label: "Recently", value: "Posted" },
                                    { label: "Spoiled", value: "Spoiled" },
                                    { label: "Claimed", value: "Claimed" },
                                    { label: "Trashed", value: "Trashed" },
                                ].map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setFilter(value)}
                                        className={`text-sm px-3 py-1 rounded-full font-medium transition ${filter === value ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-white">Loading stall details...</p>
            )}


            <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-2">
                    <label>From:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-2 py-1 rounded text-black"
                    />
                    <label>To:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-2 py-1 rounded text-black"
                    />
                    {(fromDate || toDate) && (
                        <button
                            onClick={() => { setFromDate(""); setToDate(""); }}
                            className="text-sm text-red-200 underline"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                >
                    <FaPlus /> Create New Post
                </button>
            </div>

            <div className="max-w-6xl mx-auto bg-white rounded shadow overflow-hidden">
                <DataTable
                    columns={columns}
                    data={sortedSacks}
                    pagination
                    highlightOnHover
                    defaultSortFieldId={1}
                    responsive
                    dense
                    customStyles={customStyles}
                />
            </div>

            {showModal && <CreateSack onClose={() => setShowModal(false)} />}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-white mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-white mb-6">Are you sure you want to delete this sack?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSackToDelete(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteSack}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyStall;