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
    const [status, setStatus] = useState('');
    const [preview, setPreview] = useState(null);
    const [showNote, setShowNote] = useState(false);

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
            formData.append("sackStatus", status);
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
                    window.location.reload();
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
                <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-black">✕</button>
                <h2 className="text-2xl font-bold text-center text-gray-900">Distribute Your Sack</h2>

                <div>
                    {/* <h2 className="text-white text-sm mb-2">E.g mixed vegetables.,carrot peels.cabbage peels, etc</h2> */}
                    <button
                        type="button"
                        onClick={() => setShowNote(!showNote)}
                        className="text-white underline text-sm mb-2 hover:text-black transition"
                    >
                        📌 Note for Vendors
                    </button>
                </div>
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
                            className="block text-sm font-medium text-black"
                        >
                            Description:
                        </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black italic text-xs"
                            value={description}
                            placeholder="Ex: mixed vegetables.,carrot peels.cabbage peels, etc"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-black">
                            How many kilo/s do you have?
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={decrement}
                                className="px-3 py-2 bg-black rounded hover:bg-gray-300"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={kilo}
                                onChange={handleChangeText}
                                min={5}
                                max={99999}
                                className="w-20 text-center px-2 py-2 border border-gray-300 rounded text-black"
                            />
                            <button
                                type="button"
                                onClick={increment}
                                className="px-3 py-2 bg-black rounded hover:bg-gray-300"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-black">Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                const value = e.target.value;
                                setStatus(value);
                                if (value === 'spoiled') {
                                    setDbSpoil(1);
                                } else {
                                    setDbSpoil('');
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-black"
                            required
                        >
                            <option value="" disabled>Select status</option>
                            <option value="posted">Good Alternative</option>
                            <option value="spoiled">Spoiled Alternative</option>
                        </select>
                    </div>
                    {status === 'posted' && (
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
                                color: 'black',
                            }}
                        />
                    )}

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                        Create Sack
                    </button>
                </form>

                {showNote && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
                        <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
                            <button
                                onClick={() => setShowNote(false)}
                                className="absolute top-2 right-2 text-black hover:text-black"
                            >
                                ✕
                            </button>
                            <h3 className="font-bold text-green-700 mb-2 text-lg">🧪 Summary:</h3>
                            <table className="w-full text-sm table-auto border border-gray-300">
                                <thead>
                                    <tr className="bg-green-100">
                                        <th className="border px-2 py-1 text-left text-black">Material</th>
                                        <th className="border px-2 py-1 text-center text-black">Safe for Pigs</th>
                                        <th className="border px-2 py-1 text-center text-black">Safe for Composting</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border px-2 py-1 text-black">Raw Vegetables</td>
                                        <td className="border px-2 py-1 text-center">✅</td>
                                        <td className="border px-2 py-1 text-center">✅</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-2 py-1 text-black">Fruit Scraps (no mold)</td>
                                        <td className="border px-2 py-1 text-center">✅ (limit)</td>
                                        <td className="border px-2 py-1 text-center">✅</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-2 py-1 text-black">Moldy Food</td>
                                        <td className="border px-2 py-1 text-center">❌</td>
                                        <td className="border px-2 py-1 text-center">❌</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-2 py-1 text-black">Citrus/Onions/Garlic</td>
                                        <td className="border px-2 py-1 text-center">❌</td>
                                        <td className="border px-2 py-1 text-center">⚠️ (in moderation)</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="mt-2 text-xs text-gray-600">
                                Use this guide to ensure your waste is safe for pigs and/or helpful for composters.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CreateSack;