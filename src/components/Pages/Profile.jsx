import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUser } from '../../utils/helpers';

const Profile = () => {
    const [user, setUser] = useState({ name: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/get-user/${getUser()._id}`);
                console.log('User data:', response.data);
                setUser(response.data.user);
            } catch (error) {
                setError('Failed to fetch user data');
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen">{error}</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#1F7D53] via-[#3A7D44] to-[#4CAF50]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-700">Name:</h3>
                        <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-700">Address:</h3>
                        <p className="text-gray-900">Lot {user.address?.lotNum}, St {user.address?.street}, Brgy {user.address?.baranggay}, {user.address?.city} City</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
