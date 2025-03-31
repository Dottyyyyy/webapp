import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function StallDetails() {
    const { id } = useParams(); // Get the stall ID from the route
    // console.log(id)
    const [stall, setStall] = React.useState([]);
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStallData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/vendor/${id}`
            );
            setStall(response.data.stall);
        } catch (error) {
            console.error("Error fetching stall data:", error);
        }
    }
    const fetchUserData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/get-user/${id}`
            );
            setUser(response.data.user);
        } catch (error) {
            console.log('Error', error.message);
        } finally {
            setLoading(false);
        }
    };
    console.log(user)

    useEffect(() => {
        fetchStallData();
        fetchUserData();
    }, []);

    return (
        <div className="p-5">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Stall Details</h1>
                <p className="mt-4">Stall Detail {stall.stallDescription}</p>
                <p className="mt-4">Stall stallNumber {stall.stallNumber}</p>
                <p className="mt-4">Stall stallAddress {stall.stallAddress}</p>
                {/* Add more details or fetch data for the stall here */}
            </div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Seller Details</h1>
                {user?.avatar?.url && (
                    <img
                        src={user.avatar.url}
                        alt="Stall"
                        className="w-full h-48 object-cover"
                    />
                )}

                <p className="mt-4">Vendor Name: {user.name}</p>
                <p className="mt-4">Vendor Email: {user.email}</p>
                {/* Add more details or fetch data for the stall here */}
            </div>
        </div>
    );
}

export default StallDetails;