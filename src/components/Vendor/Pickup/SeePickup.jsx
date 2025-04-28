import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { getUser } from '../../../utils/helpers';
import axios from 'axios';
import { FaCarSide } from 'react-icons/fa'; // You can import specific icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SeePickUp = () => {
    const location = useLocation();
    const { pickupData } = location.state || {};
    const pickup = pickupData;
    const user = getUser();
    const sellerId = user._id;
    const [buyer, setBuyer] = useState(null);
    const [status, setStatus] = useState("Pending");
    const navigation = useNavigation();

    // Fetch Buyer Details
    useEffect(() => {
        const fetchBuyer = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/get-user/${pickup.user}`);
                setBuyer(response.data.user);
            } catch (error) {
                console.error("Error fetching buyer details:", error.response?.data || error.message);
            }
        };
        const fetchSackStatus = async () => {
            try {
                const sackIds = mySacks.map(sack => sack.sackId);
                const response = await axios.get(`${import.meta.env.VITE_API}/sack/see-sacks`, {
                    params: { sackIds }
                });
                console.log(response, 'DATA GET')
                const allSacksClaimed = response.data.sacks.every(sack => sack.status === "claimed");
                if (allSacksClaimed) {
                    setStatus("Claimed");
                }
            } catch (error) {
                console.error("Error fetching buyer details:", error.response?.data || error.message);
            }
        };

        if (pickup._id) {
            fetchBuyer();
            fetchSackStatus();
        }
    }, [pickup._id]);

    const mySacks = pickup.sacks?.filter(sack => sack.seller === sellerId) || [];
    const totalSellerKilo = mySacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);

    const handleCompleteSackStatus = async () => {
        try {
            const sackIds = mySacks.map(sack => sack.sackId);
            const response = await axios.put(`${import.meta.env.VITE_API}/sack/update-status`, { status: 'claimed', sackIds });
            toast.success("Complete Process!! Job Well Done");
            navigation(-1)
        } catch (e) {
            console.error("Error updating sacks:", e);
        }
    };

    retun(
        <h1>HELLO</h1>
    );
};

export default SeePickUp;