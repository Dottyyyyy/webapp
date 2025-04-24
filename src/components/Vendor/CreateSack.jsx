import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUser } from "../../utils/helpers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateSack = () => {
    const [description, setDescription] = useState("");
    const navigate = useNavigate();
    const user = getUser();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [kilo, setKilo] = useState(0);
    const [dbSpoil, setDbSpoil] = useState('');
    const [error, setError] = useState('');

    // console.log(user.stall.stallNumber, 'User')

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setImage(file);
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

            if (response.data.success) {
                toast.success("Registration successful!");
                navigate(-1);
            } else {
                alert(response.data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Error creating user", error);
            alert("An error occurred during registration.");
        }
    };

    const increment = () => {
        if (kilo < 99999) setKilo((prev) => prev + 1);
    };

    const decrement = () => {
        if (kilo > 0) setKilo((prev) => prev - 1);
    };

    const handleChangeText = (e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setKilo(value > 99999 ? 99999 : value);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#1F7D53] via-[#3A7D44] to-[#4CAF50]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Create Sack
                </h2>
                <ToastContainer />
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full mb-3"
                    />

                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Image Preview"
                            className="w-24 h-24 object-cover rounded-full mb-4"
                        />)}

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
                        placeholder="How Many Days before spoiling?"
                        value={dbSpoil}
                        onChange={(e) => setDbSpoil(e.target.value)}
                        style={{
                            height: '50px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '0 16px',
                            marginBottom: '8px',
                            backgroundColor: '#fff',
                            width: '63%',
                        }}
                    />

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Sack
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateSack;