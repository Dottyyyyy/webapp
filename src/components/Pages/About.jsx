import React from "react";
import Sidebar from "../Navigation/Sidebar"; // Import Sidebar component
import { getUser } from "../../utils/helpers"; // Import getUser to fetch user data
import '../../index.css'

const About = () => {
  const user = getUser(); // Fetch the user object

  return (
    // bg-[#EBFFF3]
    <div className="min-h-screen 
     text-gray-800" style={{
        background: 'linear-gradient(to bottom right, #0A4724, #116937)',
      }}>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <img
            src="/images/taytay-market.jpg"
            alt="Food waste management"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'white' }}>
            Revolutionizing Food Waste Management
          </h1>
          <p className="text-gray-700 text-lg" style={{ color: 'white' }}>
            NoWaste is a groundbreaking marketplace that connects food vendors with farmers and composters,
            creating a sustainable ecosystem for food waste management. Our platform enables efficient redistribution
            of surplus food, reducing environmental impact while creating value for all participants.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <section className="bg-[#EBFFF3] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#0A4724' }}>Meet Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {[
              {
                name: "Ryou Kinoshita",
                role: "Project Lead/Backend Developer",
                image: "/images/kinoshita.jpg",
              },
              {
                name: "Kellyn Codon",
                role: "UX Designer/Frontend & Backend Developer",
                image: "/images/codon.jpg",
              },
              {
                name: "Christian Paningbatan",
                role: "UX Designer/Frontend Developer",
                image: "/images/paningbatan.jpg",
              },
            ].map((member, index) => (
              <div key={index}>
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold" style={{ color: '#0A4724' }}>{member.name}</p>
                <p className="text-sm text-gray-500" style={{ color: '#0A4724' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Our Work Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'white' }}>Our Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Vendor Integration",
                desc: "Streamlined system for vendors to list and manage surplus food inventory",
                image: "/images/vendor-integration.jpg",
              },
              {
                title: "Farmer & Composter Network",
                desc: "Connected network of local farmers & composters utilizing food waste for sustainable practices",
                image: "/images/composter.jpg",
              },
              {
                title: "Impact Tracking",
                desc: "Real-time monitoring and reporting of waste reduction metrics",
                image: "/images/waste.jpg",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg p-6 shadow-sm">
                <div className="w-full h-40 bg-gray-300 mb-4">
                  <img
                    src={item.image}
                    alt={`${item.title} - ${item.desc}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;