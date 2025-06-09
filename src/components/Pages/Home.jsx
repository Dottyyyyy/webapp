import React from "react";
import { getUser } from "../../utils/helpers";
import Sidebar from "../Navigation/Sidebar";
import AdminDashboard from "../Admin/Screen/AdminDashboard";
import '../../index.css';
import ComposterIndex from "../Composter/ComposterIndex";
import UserIndex from "../User/UserIndex";
import Footer from "../Navigation/Footer";
import VendorIndex from "../Vendor/VendorIndex";
import Dashboard from "./Dashboard";
import Header from "../Navigation/Header";

const Home = () => {
  const user = getUser();

  if (!user) {
    // Show landing page for unauthenticated users
    return (
      <>
        {/* Top Green Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          background: 'linear-gradient(to bottom right, #d1fad1, #c1f7c1)',

        }}
        >
          {/* Image Section */}
          <div style={{
            flex: '1 1 45%',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src="/images/taytay-market.jpg"
              alt="Food waste management"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Hero Section */}
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 16px',
            flex: '1 1 45%',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '40px',
              maxWidth: '750px',
              width: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <img
                  src="/images/nw-preview.png"
                  alt="Food waste management"
                  style={{
                    width: '40%',
                    height: '30%',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a4a4a', marginBottom: '16px' }}>NoWaste</h1>
              <p style={{ color: '#4a4a4a', fontSize: '1.125rem', marginBottom: '24px' }}>
                A revolutionary platform connecting food vendors with farmers and composters to reduce waste and promote sustainability.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <a
                  href="/login"
                  style={{
                    backgroundColor: '#2f855a',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2c7a34'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2f855a'}
                >
                  Get Started
                </a>
                <a
                  href="#how-it-works"
                  style={{
                    border: '2px solid #2f855a',
                    color: '#2f855a',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    fontWeight: '600',
                    transition: 'background-color 0.3s, color 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#2f855a';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#2f855a';
                  }}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>



        {/* How It Works */}
        <section id="how-it-works" className="bg-white py-16 px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join Our Mission</h2>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto text-sm">
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
      <div className="bg-green-500 h-1 w-full"></div>
      {user.role === "admin" && (
        <>
          <Sidebar />
          <Dashboard />
        </>
      )}
      <div sty className="flex w-full h-full fade-in">
        <div className="flex-grow p-8 bg-gradient-to-br from-green-50 to-green-100 w-full h-full">
          {/* Admin View */}

          {/* Vendor View */}
          {user.role === "vendor" && (
            <>
              <VendorIndex />
              <Footer />
            </>
          )}

          {/* Farmer View */}
          {user.role === "farmer" && (
            <>
              <UserIndex />
              <Footer />
            </>
          )}

          {user.role === "composter" && (
            <>
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