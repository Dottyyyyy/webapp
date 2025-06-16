import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticate } from "../../utils/helpers";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../index.css'

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

      if (response.data.user?.isDeleted) {
        toast.error('Account has been deleted.');
        toast.error('"Contact Support: #09755663543, Lira Baltazar"');
        return;
      }

      // Successful login
      console.log("Login successful:", response.data);
      authenticate(response.data, () => {
        toast.success('Login Successfully.');
        navigate("/");
        window.location.reload();
      });

    } catch (error) {
      // Try to get error message from response
      const errMsg = error.response?.data?.message || "Login Failed. Try Again";

      if (errMsg === "Account has been deleted") {
        toast.error('Account has been deleted. Contact support.');
        toast.error('"Contact Support: #09755663543, Lira Baltazar"');
      } else {
        toast.error(errMsg);
      }

      // Optionally log for debugging
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-b from-green-800 to-green-500 text-white px-12">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Reducing Waste, <br /> Creating Impact
          </h2>
          <p className="text-sm text-gray-600">
            Join our mission to transform food waste into sustainable opportunities. Together, we can make a difference for our planet.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-center text-gray-600">
            Enter your credentials to continue your journey
          </p>
          <ToastContainer />
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 text-gray-900">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgotpassword"
                className="text-green-600 hover:text-green-500"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign In
            </button>
          </form>
          <div className="text-sm text-center">
            <span>
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Create Account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
