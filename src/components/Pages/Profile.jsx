import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../../utils/helpers";
import '../../index.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API}/get-user/${getUser()._id}`
        );
        setUser(response.data.user);
      } catch (error) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="flex w-full h-full fade-in">
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-green-800 to-green-500">
        <div className="w-[360px] h-[540px] bg-white shadow-xl rounded-lg p-6 flex flex-col items-center text-gray-800 relative border-4 border-green-700">
          {/* ID Portrait Photo */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-600 mb-4">
            <img
              src={user.avatar?.url || "https://via.placeholder.com/100"}
              alt="Avatar"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Name & Role */}
          <h2 className="text-2xl font-bold mb-1 text-center">{user.name}</h2>
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-4">{user.role}</p>

          {/* Details Section */}
          <div className="w-full text-sm space-y-2">
            <div>
              <p className="font-semibold">Email:</p>
              <p className="break-words">{user.email}</p>
            </div>

            <div>
              <p className="font-semibold">Address:</p>
              <p>
                Lot {user.address?.lotNum}, St. {user.address?.street},<br />
                Brgy. {user.address?.baranggay}, {user.address?.city} City
              </p>
            </div>
          </div>

          {/* Footer bar */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-green-700 rounded-b-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;