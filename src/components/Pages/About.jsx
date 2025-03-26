const About = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#1F7D53] via-[#3A7D44] to-[#4CAF50]">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          About Us
        </h2>
        <p className="text-lg text-gray-700">
          Welcome to our application! We are dedicated to providing the best
          service possible. Our team is committed to ensuring that you have a
          seamless and enjoyable experience.
        </p>
        <p className="text-lg text-gray-700">
          Our mission is to deliver high-quality solutions that meet your needs.
          We believe in innovation, integrity, and customer satisfaction. Thank
          you for choosing us!
        </p>
        <p className="text-lg text-gray-700">
          If you have any questions or feedback, please feel free to reach out
          to us. We are here to help and support you in any way we can.
        </p>
      </div>
    </div>
  );
};

export default About;
