import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUser } from "../../utils/helpers";
import '../../index.css';
import Sidebar from "../partials/Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        const interval = setInterval(fetchStalls, 2000);
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
    console.log(stalls, 'Stalls')
    return (
        <div className="flex h-screen overflow-hidden fade-in">
            <ToastContainer />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col bg-gray-100 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none w-200">
                <main className="grow min-h-screen">
                    <h1 className="text-3xl font-bold mb-6">Admin Stall Management</h1>
                    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                        <table className="min-w-full text-sm text-left text-black">
                            <thead className="bg-green-700 text-white uppercase">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">Stall Number</th>
                                    <th className="px-4 py-3">Address</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stalls.map((stall, index) => (
                                    <tr key={stall._id} className="border-b hover:bg-gray-100">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{stall.name}</td>
                                        <td className="px-4 py-3">{stall.stall.stallNumber}</td>
                                        <td className="px-4 py-3">{stall.stall.stallAddress}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${stall.stall.status === "open" ? "bg-green-600" : "bg-red-600"}`}>
                                                {stall.stall.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <img
                                                src={stall?.stall?.stallImage?.url}
                                                alt="Stall"
                                                className="w-20 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedVendorId(stall._id);
                                                    setFormValues({
                                                        stallDescription: stall.stall.stallDescription || '',
                                                        stallAddress: stall.stall.stallAddress || '',
                                                        stallNumber: stall.stall.stallNumber || '',
                                                        openHours: stall.stall.openHours || '',
                                                        closeHours: stall.stall.closeHours || '',
                                                    });
                                                    setPreview(stall.stall.stallImage?.url || null);
                                                    setShowStallModal(true);
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded"
                                            >
                                                Edit
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                </main>
            </div>
        </div>
    );
}

export default AdminViewStalls;