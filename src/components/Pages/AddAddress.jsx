import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { authenticate, getUser } from '../../utils/helpers';

const AddAddress = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [formValues, setFormValues] = useState({
        lotNum: '',
        street: '',
        baranggay: '',
        city: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const role = user?.role;

    // Fetch user data
    const fetchUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API}/get-user/${user?._id}`);
            setUserData(response.data.user);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        if (user._id) {
            fetchUser();
            const interval = setInterval(fetchUser, 3000);
            return () => clearInterval(interval); // Clean up the interval on component unmount
        }
    }, [user._id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formValues.lotNum) errors.lotNum = "Lot Number is required";
        if (!formValues.street) errors.street = "Street is required";
        if (!formValues.baranggay) errors.baranggay = "Baranggay is required";
        if (!formValues.city) errors.city = "City is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    console.log(user, 'User')

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form from reloading page

        if (validateForm()) {
            try {
                const response = await axios.put(`${import.meta.env.VITE_API}/add-address`, {
                    lotNum: formValues.lotNum,
                    street: formValues.street,
                    baranggay: formValues.baranggay,
                    city: formValues.city,
                    _id: user?._id
                });

                toast.success("Address updated successfully!");

                // Redirect based on role after adding address
                if (role === 'farmer') {
                    navigate('/'); // Farmer's home page
                } else if (role === 'composter') {
                    navigate('/'); // Composter home page
                } else {
                    navigate('/addStall'); // For other roles, navigate to add stall page
                }

            } catch (error) {
                console.error("Error updating address:", error.message);
                toast.error("An error occurred while updating the address.");
            }
        } else {
            toast.error("Please fill in all fields.");
        }
    };

    const address = userData?.address;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-6">Add Address</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Address Card */}
                <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
                    <h2 className="text-xl font-semibold mb-4">New Taytay Market</h2>
                    <div className="flex flex-col items-start space-y-2">
                        {/* Image of the market */}
                        <img
                            src="/images/taytay-market.jpg"
                            alt="Taytay Market"
                            className="w-full h-48 object-cover rounded-md mb-4"
                        />

                        {/* City and Market Details */}
                        <p><strong>City:</strong> Taytay, Rizal</p>
                        <p><strong>Location:</strong> Heart of Taytay, easily accessible to vendors and local consumers.</p>

                        {/* How NoWaste helps */}
                        <h3 className="text-lg font-semibold mt-4">How NoWaste Helps:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Waste Management:</strong> Converts vegetable waste into compost for local farms.</li>
                            <li><strong>Pig Feeds:</strong> Turns unsellable vegetable scraps into pig feed, reducing costs for farmers.</li>
                            <li><strong>Natural Fertilizers:</strong> Uses waste to create chemical-free fertilizers for better soil health.</li>
                        </ul>

                        <p className="mt-4">NoWaste is working with Taytay Market to ensure sustainable waste management, benefiting the environment and supporting local farmers.</p>
                    </div>
                </div>


                {/* Right Column: Add Address Form */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md col-span-1 space-y-5">
                    <div className="form-group">
                        <label className="text-lg font-medium" htmlFor="lotNum">Lot Number</label>
                        <input
                            type="text"
                            id="lotNum"
                            name="lotNum"
                            placeholder="Lot Number"
                            value={formValues.lotNum}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {formErrors.lotNum && <div className="text-red-500 text-sm mt-1">{formErrors.lotNum}</div>}
                    </div>

                    <div className="form-group">
                        <label className="text-lg font-medium" htmlFor="street">Street</label>
                        <input
                            type="text"
                            id="street"
                            name="street"
                            placeholder="Street"
                            value={formValues.street}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {formErrors.street && <div className="text-red-500 text-sm mt-1">{formErrors.street}</div>}
                    </div>

                    <div className="form-group">
                        <label className="text-lg font-medium" htmlFor="baranggay">Baranggay</label>
                        <input
                            type="text"
                            id="baranggay"
                            name="baranggay"
                            placeholder="Baranggay"
                            value={formValues.baranggay}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {formErrors.baranggay && <div className="text-red-500 text-sm mt-1">{formErrors.baranggay}</div>}
                    </div>

                    <div className="form-group">
                        <label className="text-lg font-medium" htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            placeholder="City"
                            value={formValues.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {formErrors.city && <div className="text-red-500 text-sm mt-1">{formErrors.city}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-green-600 text-white text-lg rounded-md hover:bg-green-700 focus:outline-none"
                    >
                        Save Address
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAddress;