import React from "react";
import { getUser } from "../../utils/helpers";
import Sidebar from "../Navigation/Sidebar";
import AdminDashboard from "../Admin/Screen/AdminDashboard";
import '../../index.css'
import ComposterIndex from "../Composter/ComposterIndex";
import UserIndex from "../User/UserIndex";
import Footer from "../Navigation/Footer";

const Home = () => {
  const user = getUser();

  if (!user) {
    // Show landing page for unauthenticated users
    return (
      <>
        {/* Top Green Bar */}
        <div className="bg-green-500 h-1 w-full" />

        {/* Hero Section */}
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-20">
          <div className="bg-white rounded-3xl shadow-lg p-10 max-w-4xl w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 rounded-full p-3">
                <span role="img" aria-label="leaf" className="text-white text-xl">🌱</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">NoWaste</h1>
            <p className="text-gray-600 text-lg mb-6">
              A revolutionary platform connecting food vendors with farmers and composters to reduce waste and promote sustainability.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/login"
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition"
              >
                Get Started
              </a>
              <a
                href="#how-it-works"
                className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-600 hover:text-white transition"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="bg-white py-16 px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">For Vendors</h3>
              <p className="text-gray-600">List unused and surplus food items instead of discarding them. Reduce waste and contribute to a sustainable future.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">For Farmers</h3>
              <p className="text-gray-600">Connect with vendors to collect food waste for animal feed. Free collection service that benefits both parties.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Track & Reduce</h3>
              <p className="text-gray-600">Monitor waste data, measure environmental impact, and promote sustainable practices in your community.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-green-600 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Be part of the solution to reduce food waste and create a more sustainable future. Whether you're a vendor, farmer, or composter, your contribution matters.
          </p>
          <a
            href="/register"
            className="bg-white text-green-700 px-6 py-3 rounded-full font-semibold shadow hover:bg-green-100 transition"
          >
            Sign Up for Free
          </a>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-10 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto text-sm">
            <div>
              <h4 className="font-semibold mb-2">Contact Us</h4>
              <p>Email: info@nowaste.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Location</h4>
              <p>Rizal Avenue Brgy.</p>
              <p>San Juan, 1920 Taytay</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">FAQs</h4>
              <p>How it works</p>
              <p>Terms of Service</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Social Media</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:text-green-400">🐦</a>
                <a href="#" className="hover:text-green-400">📘</a>
                <a href="#" className="hover:text-green-400">📸</a>
              </div>
            </div>
          </div>
        </footer>
      </>
    );
  }

  // Logged-in user experience
  return (
    <>
      <div className="bg-green-500 h-1 w-full">
      </div>
      <div className="flex w-full h-full fade-in">
        <div className="flex-grow p-8 bg-gradient-to-br from-green-50 to-green-100 w-full h-full">
          {/* Admin View */}
          {user.role === "admin" && (
            <>
              <AdminDashboard />
              <Footer />
            </>
          )}

          {/* Vendor View */}
          {user.role === "vendor" && (
            <>
              <Sidebar />
              <div className="min-h-screen bg-green-50 flex flex-col items-center p-6">
                {/* Header */}
                <div className="text-center mt-10">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-green-900">
                    Welcome, Vendor {user.name}
                  </h1>
                  <p className="text-lg text-gray-700 mt-3 max-w-xl mx-auto">
                    Manage your waste sacks and requests efficiently — and learn how your vegetable waste can bring new value!
                  </p>
                </div>

                {/* Image Section */}
                <div className="mt-10 w-full max-w-4xl">
                  <img
                    src="https://images.unsplash.com/photo-1590080875963-5f9d87c4e88a" // You can replace this with your own image
                    alt="Vegetable Waste Reuse"
                    className="rounded-2xl shadow-xl w-full h-auto object-cover"
                  />
                </div>

                {/* Campaign Section */}
                <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 max-w-4xl text-center">
                  <h2 className="text-2xl font-bold text-green-800 mb-4">Why Reuse Your Vegetable Waste?</h2>
                  <p className="text-gray-700 text-md">
                    Every kilo of vegetable waste you throw away can become something valuable — from livestock feed to compost and organic fertilizer.
                    Start making a difference today by offering your waste to farmers and composters who need it. Together, we can create a cleaner,
                    more sustainable marketplace.
                  </p>

                  <button className="mt-6 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full text-lg shadow-md transition">
                    Learn How to Reuse Your Waste
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Farmer View */}
          {user.role === "farmer" && (
            <>
              <UserIndex />
            </>
          )}

          {user.role === "composter" && (
            <>
              <Sidebar />
              <ComposterIndex />
              <Footer />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;