import React from "react";
import Sidebar from "../Navigation/Sidebar"; // Import Sidebar component
import { getUser } from "../../utils/helpers"; // Import getUser to fetch user data

const About = () => {
  const user = getUser(); // Fetch the user object

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      {/* <Sidebar /> */}
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-r from-[#1F7D53] via-[#3A7D44] to-[#4CAF50]">
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-900">About Us</h2>
          <p className="text-lg text-gray-700">
            Welcome to our application! We are dedicated to providing the best service possible.
          </p>
          <p className="text-lg text-gray-700">
            Our mission is to deliver high-quality solutions that meet your needs. Thank you for choosing us!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;