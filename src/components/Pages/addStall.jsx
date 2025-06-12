import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/helpers';

const AddStall = () => {
    const user = getUser();
    const navigate = useNavigate();
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

                const response = await axios.put(`${import.meta.env.VITE_API}/vendor/add-stall/${user?._id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                toast.success('Stall added successfully!');
                navigate('/');
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

    return (
        <div className="container" style={{ justifyItems: 'center' }}>
            <br />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ alignSelf: 'center', marginLeft: 100 }}>
                <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
                    <h2 className="text-xl font-semibold mb-4">New Taytay Market</h2>
                    <div className="flex flex-col items-start space-y-2">
                        {/* Image of the market */}
                        <img
                            src="/images/taytay-market.jpg"
                            alt="Taytay Market"
                            className="w-full h-48 object-cover rounded-md mb-4"
                        />

                        {/* City and Market Details */}
                        <p><strong>City:</strong> Taytay, Rizal</p>
                        <p><strong>Location:</strong> Heart of Taytay, easily accessible to vendors and local consumers.</p>

                        {/* How NoWaste helps */}
                        <h3 className="text-lg font-semibold mt-4">How NoWaste Helps:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Waste Management:</strong> Converts vegetable waste into compost for local farms.</li>
                            <li><strong>Pig Feeds:</strong> Turns unsellable vegetable scraps into pig feed, reducing costs for farmers.</li>
                            <li><strong>Natural Fertilizers:</strong> Uses waste to create chemical-free fertilizers for better soil health.</li>
                        </ul>

                        <p className="mt-4">NoWaste is working with Taytay Market to ensure sustainable waste management, benefiting the environment and supporting local farmers.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md col-span-1 space-y-5" style={{ padding: 40, borderWidth: 2, borderColor: 'black' }}>
                    <h1 style={{ textAlign: 'center' }}>Add Vendor Stall</h1>
                    <form onSubmit={handleSubmit}>
                        {/* Profile Upload Circle */}
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

                        <h4 style={{ textAlign: 'center' }}>Description</h4>
                        <div className="form-group">
                            <textarea
                                id="stallDescription"
                                name="stallDescription"
                                value={formValues.stallDescription}
                                onChange={handleInputChange}
                                rows="2"
                                placeholder="Stall Description"
                                style={{ width: '100%' }}
                            />
                            {formErrors.stallDescription && <div className="error">{formErrors.stallDescription}</div>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginTop: 20 }}>
                            <label htmlFor="stallAddress">Stall Address</label>
                            <label htmlFor="stallNumber" style={{ marginLeft: 120 }}>Stall Number</label>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="stallAddress"
                                    name="stallAddress"
                                    value={formValues.stallAddress}
                                    onChange={handleInputChange}
                                    placeholder="Stall Address"
                                />
                                {formErrors.stallAddress && <div className="error">{formErrors.stallAddress}</div>}
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="stallNumber"
                                    name="stallNumber"
                                    value={formValues.stallNumber}
                                    onChange={handleInputChange}
                                    placeholder="Stall Number"
                                />
                                {formErrors.stallNumber && <div className="error">{formErrors.stallNumber}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '20%' }}>
                                <label className="block text-sm font-medium mb-1">Open Hours</label>
                                <select
                                    name="openHours"
                                    value={formValues.openHours}
                                    onChange={handleInputChange}
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
                                    value={formValues.closeHours}
                                    onChange={handleInputChange}
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

                        <button type="submit" className="w-full py-3 bg-green-600 text-white mt-10 text-lg rounded-md hover:bg-green-700 focus:outline-none">
                            Add Stall
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStall;