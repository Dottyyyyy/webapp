import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditVendorModal = ({ isOpen, onClose, vendor, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: {
            lotNum: "",
            street: "",
            baranggay: "",
            city: ""
        },
        stall: {
            stallDescription: "",
            stallAddress: "",
            stallNumber: "",
            openHours: "",
            closeHours: "",
            stallImage: {
                public_id: "",
                url: ""
            }
        }
    });
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [stallImage, setStallImage] = useState(null);
    const [stallPreview, setStallPreview] = useState(null);


    useEffect(() => {
        if (vendor) {
            setFormData({
                _id: vendor._id || "",
                name: vendor.name || "",
                email: vendor.email || "",
                phone: vendor.phone || "",
                address: {
                    lotNum: vendor.address?.lotNum || "",
                    street: vendor.address?.street || "",
                    baranggay: vendor.address?.baranggay || "",
                    city: vendor.address?.city || ""
                },
                stall: {
                    stallDescription: vendor.stall?.stallDescription || "",
                    stallAddress: vendor.stall?.stallAddress || "",
                    stallNumber: vendor.stall?.stallNumber || "",
                    openHours: vendor.stall?.openHours || "",
                    closeHours: vendor.stall?.closeHours || "",
                    stallImage: {
                        public_id: vendor.stall?.stallImage?.public_id || "",
                        url: vendor.stall?.stallImage?.url || ""
                    }
                }
            });

            // Reset preview images when vendor changes
            setPreview(null);
            setAvatar(null);
            setStallPreview(null);
            setStallImage(null);
        }
    }, [vendor]);


    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    const handleStallImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStallImage(file);
            setStallPreview(URL.createObjectURL(file));
        }
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNestedChange = (e, parentKey) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [name]: value
            }
        }));
    };

    const handleDeepNestedChange = (e, parentKey, subKey) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [subKey]: {
                    ...prev[parentKey][subKey],
                    [name]: value
                }
            }
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);

        data.append("lotNum", formData.address.lotNum);
        data.append("street", formData.address.street);
        data.append("baranggay", formData.address.baranggay);
        data.append("city", formData.address.city);

        data.append("stallDescription", formData.stall.stallDescription);
        data.append("stallAddress", formData.stall.stallAddress);
        data.append("stallNumber", formData.stall.stallNumber);
        data.append("openHours", formData.stall.openHours);
        data.append("closeHours", formData.stall.closeHours);

        if (avatar) {
            data.append("avatar", avatar);
        }
        if (stallImage) {
            data.append("stallImage", stallImage);
        }
        console.log('FormData content:');
        for (let pair of data.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        try {
            await axios.put(`${import.meta.env.VITE_API}/update-user/${vendor._id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Update User Successfully.");
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating vendor:", error);
            toast.error("Update User Error.");
        }
    };


    if (!isOpen || !vendor) return null;
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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 overflow-auto" style={{ height: '90%', marginTop: 20, }}>
            <ToastContainer />
            <div className="bg-[#4eff56] rounded-xl shadow-xl p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Vendor</h2>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Personal Info */}
                    {/* Avatar */}

                    <div style={{ marginTop: 120, }}>
                        <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                        <div className="flex justify-center mb-6 relative">
                            <label htmlFor="avatar-upload" className="cursor-pointer group">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100 hover:border-green-600 transition">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Avatar Preview"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="lotNum" value={formData.address.lotNum} onChange={(e) => handleNestedChange(e, "address")} placeholder="Lot Number" className="border px-3 py-2 rounded" />
                            <input name="street" value={formData.address.street} onChange={(e) => handleNestedChange(e, "address")} placeholder="Street" className="border px-3 py-2 rounded" />
                            <input name="baranggay" value={formData.address.baranggay} onChange={(e) => handleNestedChange(e, "address")} placeholder="Baranggay" className="border px-3 py-2 rounded" />
                            <input name="city" value={formData.address.city} onChange={(e) => handleNestedChange(e, "address")} placeholder="City" className="border px-3 py-2 rounded" />
                        </div>
                    </div>

                    {vendor.role === 'vendor' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Stall Information</h3>
                            <div className="flex justify-center mb-6 relative">
                                <label htmlFor="stall-upload" className="cursor-pointer group">
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100 hover:border-green-600 transition">
                                        {stallPreview ? (
                                            <img
                                                src={stallPreview}
                                                alt="Avatar Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl text-gray-400 group-hover:text-green-600">+</span>
                                        )}
                                    </div>
                                    <input
                                        id="stall-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleStallImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <input name="stallNumber" value={formData.stall.stallNumber} onChange={(e) => handleNestedChange(e, "stall")} placeholder="Stall Number" className="px-3 py-2 border rounded justify-center" style={{ marginBottom: 15, justifySelf: 'center', display: 'flex' }} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="stallDescription" value={formData.stall.stallDescription} onChange={(e) => handleNestedChange(e, "stall")} placeholder="Description" className="px-3 py-2 border rounded" />
                                <input name="stallAddress" value={formData.stall.stallAddress} onChange={(e) => handleNestedChange(e, "stall")} placeholder="Address" className="px-3 py-2 border rounded" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '20%' }}>
                                    <label className="block text-sm font-medium mb-1">Open Hours</label>
                                    <select
                                        name="openHours"
                                        value={formData.stall.openHours}
                                        onChange={(e) => handleNestedChange(e, "stall")}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="">Open Time</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ width: '20%' }}>
                                    <label className="block text-sm font-medium mb-1">Close Hours</label>
                                    <select
                                        name="closeHours"
                                        value={formData.stall.closeHours}
                                        onChange={(e) => handleNestedChange(e, "stall")}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="">Close Time</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVendorModal;