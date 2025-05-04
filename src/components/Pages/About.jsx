import React from "react";
import Sidebar from "../Navigation/Sidebar"; // Import Sidebar component
import { getUser } from "../../utils/helpers"; // Import getUser to fetch user data
import '../../index.css'

const About = () => {
  const user = getUser(); // Fetch the user object

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="w-full md:w-1/2 md:pl-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Revolutionizing Food Waste Management
          </h1>
          <p className="text-gray-700 text-lg">
            NoWaste is a groundbreaking marketplace that connects food vendors with farmers and composters,
            creating a sustainable ecosystem for food waste management. Our platform enables efficient redistribution
            of surplus food, reducing environmental impact while creating value for all participants.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {[
              { name: "John Doe", role: "Project Lead" },
              { name: "Jane Smith", role: "UX Designer" },
              { name: "Mike Johnson", role: "Developer" },
            ].map((member, index) => (
              <div key={index}>
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-lg"></div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Our Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Vendor Integration",
                desc: "Streamlined system for vendors to list and manage surplus food inventory",
              },
              {
                title: "Farmer Network",
                desc: "Connected network of local farmers utilizing food waste for sustainable practices",
              },
              {
                title: "Impact Tracking",
                desc: "Real-time monitoring and reporting of waste reduction metrics",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg p-6 shadow-sm">
                <div className="w-full h-40 bg-gray-300 mb-4"></div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 mt-12">
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
    </div>
  );
};

export default About;