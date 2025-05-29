import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../index.css'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [role, setRole] = useState("farmer");
  const [preview, setPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent form from refreshing the page

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
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

      console.log(formData, 'formData')

      const response = await axios.post(
        `${import.meta.env.VITE_API}/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        toast.success("Registration successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error creating user", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <ToastContainer autoClose={3000} hideProgressBar />
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-[#4CAF50] text-white px-10 relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-4xl font-bold mb-4">Join <span className="text-white">NoWaste</span> Community</h1>
          <p className="text-md max-w-md">
            Connect with local partners, reduce food waste, and make a positive
            impact on our environment. Start your journey towards sustainable
            waste management today.
          </p>
        </div>
        <div className="absolute rounded-full bg-[#3A7D44] w-[300px] h-[300px] top-[-80px] left-[-80px]"></div>
        <div className="absolute rounded-full bg-[#1F7D53] w-[200px] h-[200px] bottom-[-80px] left-[-80px]"></div>
      </div>

      {/* Right panel (form) */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-10 bg-white">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Create an Account
          </h2>

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

          {/* Form Fields */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Choose your role</option>
              <option value="farmer">Farmer</option>
              <option value="composter">Composter</option>
              <option value="vendor">Vendor</option>
            </select>
            <div className="flex gap-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#4CAF50] text-white font-semibold rounded-md hover:bg-[#3A7D44]"
            >
              Create Account
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;