import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticate } from "../../utils/helpers";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API}/login`, {
        email,
        password,
      });
      // Handle successful login (e.g., save token, redirect to home page)
      console.log("Login successful:", response.data);
      authenticate(response.data, () => {
        toast.success('Login Successfully.');
        navigate("/");
        window.location.reload();
      });
      // navigate('/');
    } catch (error) {
      toast.error('Login Failed. Wrong email or Password.');
      toast.error('Try Again.');
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#1F7D53] via-[#3A7D44] to-[#4CAF50]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
        <ToastContainer />
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* <div className="flex items-center">
                        <input type="checkbox" id="rememberMe" name="rememberMe" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">Remember Me</label>
                    </div> */}
          <div className="text-sm">
            <Link
              to="/forgotpassword"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
        <div className="text-sm text-center">
          <span>
            New here?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {" "}
              Click to Register{" "}
            </Link>{" "}
            to create an account.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
