import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUser } from "../../utils/helpers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../index.css'

const CreateSack = ({ onClose }) => {
    const [description, setDescription] = useState("");
    const navigate = useNavigate();
    const user = getUser();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [kilo, setKilo] = useState(5);
    const [dbSpoil, setDbSpoil] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);

    // console.log(user.stall.stallNumber, 'User')

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("description", description);
            formData.append("kilo", kilo);
            formData.append("dbSpoil", dbSpoil);
            formData.append("seller", user._id);
            formData.append("stallNumber", user.stall.stallNumber);
            if (image) {
                formData.append("image", image);
            }

            // Debugging: Log individual form data
            console.log("description:", description);
            console.log("kilo:", kilo);
            console.log("dbSpoil:", dbSpoil);
            console.log("image:", image);

            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            const response = await axios.post(
                `${import.meta.env.VITE_API}/sack/create-sack`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            toast.success("Create Sack Successful!");
            setTimeout(() => {
                if (response.data.success) {
                    onClose();
                } else {
                    toast.error(response.data.message || "Failed to create sack.");
                }
            }, 1500);
        } catch (error) {
            console.error("Error creating user", error);
            alert("An error occurred during registration.");
        }
    };

    const increment = () => {
        if (kilo < 99999) setKilo((prev) => prev + 1);
    };

    const decrement = () => {
        if (kilo > 5) setKilo((prev) => prev - 1);
    };

    const handleChangeText = (e) => {
        const value = parseInt(e.target.value, 10) || 0;
        if (value < 5) {
            setKilo(5);
        } else if (value > 99999) {
            setKilo(50);
        } else {
            setKilo(value);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <ToastContainer />
            <div className="w-full max-w-md p-6 space-y-6 rounded-lg shadow-md relative" style={{
                background: 'linear-gradient(to bottom right,rgb(5, 107, 49),rgb(35, 241, 124))',
            }}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
                <h2 className="text-2xl font-bold text-center text-gray-900">Create Sack</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
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

                    <div className="space-y-1">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description:
                        </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            How many kilo/s do you have?
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={decrement}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={kilo}
                                onChange={handleChangeText}
                                min={5}
                                max={99999}
                                className="w-20 text-center px-2 py-2 border border-gray-300 rounded"
                            />
                            <button
                                type="button"
                                onClick={increment}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                +
                            </button>
                        </div>
                    </div>


                    <input
                        type="number"
                        placeholder="How Many Days before spoilage?"
                        value={dbSpoil}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (value >= 1 && value <= 4) {
                                setDbSpoil(value);
                            } else if (e.target.value === "") {
                                setDbSpoil("");
                            }
                        }}
                        min={1}
                        max={4}
                        required
                        style={{
                            height: '50px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '0 16px',
                            marginBottom: '8px',
                            backgroundColor: '#fff',
                            width: '80%',
                        }}
                    />

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                        Create Sack
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateSack;