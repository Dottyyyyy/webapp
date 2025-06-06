import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";

const CreateVendor = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(null);
    const [role, setRole] = useState("vendor");
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
        e.preventDefault(); // prevent form from refreshing the page

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("address", address);
            formData.append("role", role);
            if (avatar) {
                formData.append("avatar", avatar);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API}/register`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.data.success) {
                alert("Log in on mobile app to verify your stall.");
            } else {
                alert(response.data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Error creating user", error);
            alert("An error occurred during registration.");
        }
    };

    return (
        <>
            <div className="flex h-screen overflow-hidden fade-in">
                {/* Sidebar */}
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Content area */}
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Header */}
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    {/* Main content with footer */}

                    <main className="w-full flex flex-col items-center justify-center">
                        <div className="w-full max-w-md p-8 space-y-6 bg-[#4EFF56] rounded-2xl shadow-2xl justify-items-center">
                            <h2 className="text-3xl font-extrabold text-center text-gray-800">
                                Create Vendor
                            </h2>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="flex flex-col items-center space-y-3">
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
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 text-white text-lg font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                                >
                                    Create Vendor
                                </button>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
            <footer className="bg-gray-800 text-white py-10">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-semibold mb-3">Contact Us</h4>
                        <p className="text-sm">Email: info@nowaste.com</p>
                        <p className="text-sm">Phone: (123) 456-7890</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Location</h4>
                        <p className="text-sm">123 Green Street</p>
                        <p className="text-sm">Eco City, EC 12345</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">FAQs</h4>
                        <p className="text-sm">How it works</p>
                        <p className="text-sm">Terms of Service</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Social Media</h4>
                        <div className="flex gap-4 text-xl">
                            <i className="fab fa-facebook-f"></i>
                            <i className="fab fa-twitter"></i>
                            <i className="fab fa-instagram"></i>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default CreateVendor;