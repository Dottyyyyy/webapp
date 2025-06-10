import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateFarmer = ({ onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [role] = useState("farmer");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
            setAvatar(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("role", role);
            if (avatar) {
                formData.append("avatar", avatar);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API}/register`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                toast.success("Create User Successfully.");
                onClose();
            }
        } catch (error) {
            console.error("Error creating user", error);
            toast.error("Create User Error.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <ToastContainer />
            <div className="bg-[#4eff56] relative w-full max-w-md p-8 rounded-lg shadow-lg">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-700 text-2xl hover:text-red-500"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Create Farmer</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar Preview"
                                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                No Image
                            </div>
                        )}
                        <label className="cursor-pointer text-indigo-600 text-sm hover:underline">
                            Upload Avatar
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-300"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFarmer;