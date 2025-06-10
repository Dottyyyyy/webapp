import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateVendor = ({ onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [role] = useState("vendor");

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
            if (avatar) formData.append("avatar", avatar);

            const response = await axios.post(
                `${import.meta.env.VITE_API}/register`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
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
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <ToastContainer />
            <div className=" w-full max-w-lg rounded-2xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh] bg-[#4eff56]">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Create Vendor
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center space-y-2">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar Preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                No Image
                            </div>
                        )}
                        <label className="cursor-pointer text-indigo-600 hover:underline text-sm">
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                        Create Vendor
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateVendor;