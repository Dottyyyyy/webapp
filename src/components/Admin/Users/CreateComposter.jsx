import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateComposter = ({ onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [role] = useState("composter");
    const [avatarPreview, setAvatarPreview] = useState(null);

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
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("Create User Successfully.");

            if (response.data.success) {
                onClose();
            }

        } catch (error) {
            console.error("Error creating user", error);
            toast.error("Error in Creating User.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
            <ToastContainer />
            <div className="bg-[#4eff56] w-full max-w-lg p-6 rounded-lg shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                    Create Composter
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
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
                        <label className="block text-sm font-medium text-gray-700">Name:</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password:</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password:</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-blue-600 rounded hover:bg-green-700"
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateComposter;
