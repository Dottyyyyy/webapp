import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import { getUser } from "../../utils/helpers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import '../../index.css';
import Footer from "../Navigation/Footer";

const Mysack = () => {
  const user = getUser();
  const userId = user._id;
  const navigate = useNavigate();
  const [mySack, setMySacks] = useState([]);
  const addToSackId = mySack.length > 0 ? mySack[0]._id : undefined;

  const fetchMySacks = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/sack/get-my-sacks/${userId}`);
      const pendingSacks = data.mySack.filter(sack => sack.status === "pending");
      setMySacks(pendingSacks);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchMySacks();
  }, [userId]);

  const totalKilos = mySack.reduce((sum, item) => {
    return sum + item.sacks.reduce((sackSum, sack) => sackSum + Number(sack.kilo || 0), 0);
  }, 0);

  const handlePickUpSacks = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}/sack/pick-up-sacks/${addToSackId}`, { mySack, totalKilos });
      toast.success("Pick up sack Successfully.");
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const deleteMySackItem = async (addToSackId, sackId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}/sack/delete-sack/${addToSackId}/${sackId}`);
      toast.success("Sack deleted successfully");
      fetchMySacks();
    } catch (error) {
      console.error("Error deleting sack:", error);
      toast.error("Error deleting sack");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 text-white px-4 py-8">
      <ToastContainer />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Sack</h1>
          {user && (user.role === "farmer" || user.role === "composter" || mySack.length === 0) && (
            <button
              onClick={handlePickUpSacks}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white shadow"
            >
              {user.role === "farmer" ? "Demand Sacks" : "Demand Spoiled Sacks"}
            </button>
          )}
        </div>

        <div className="text-lg font-semibold mb-6">Total weight of sacks: {totalKilos} kg</div>

        {mySack.length === 0 ? (
          <div className="text-white text-center py-12 bg-green-800 rounded-xl">No pending sacks found.</div>
        ) : (
          <div className="grid gap-6">
            {mySack.map((entry, index) => (
              <div key={entry._id} className="bg-white rounded-xl p-6 shadow text-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Sack Entry #{index + 1}</h2>
                  <span className="text-xs font-semibold bg-yellow-400 text-white px-3 py-1 rounded-full">Pending</span>
                </div>
                <div className="text-sm text-gray-500 mb-4">Created at: {new Date(entry.createdAt).toLocaleString()}</div>

                <div className="grid md:grid-cols-2 gap-6">
                  {entry.sacks.map((sack, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 flex flex-col md:flex-row items-start gap-4 shadow-sm">
                      <img
                        src={sack.images[0]?.url || 'https://via.placeholder.com/150'}
                        alt="Sack"
                        className="w-full md:w-48 h-32 object-cover rounded"
                      />
                      <div className="flex-1 space-y-1 text-sm">
                        <p><strong>Stall #:</strong> {sack.stallNumber || "N/A"}</p>
                        <p><strong>Weight:</strong> {sack.kilo || 0} kg</p>
                        <p><strong>Description:</strong> {sack.description || "N/A"}</p>
                        <p><strong>Location:</strong> {sack.location || "N/A"}</p>
                        <p><strong>Spoilage Date:</strong> {new Date(new Date(sack.dbSpoil).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric"
                        })}</p>
                      </div>
                      <button
                        onClick={() => deleteMySackItem(entry._id, sack.sackId)}
                        className="ml-auto bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mysack;