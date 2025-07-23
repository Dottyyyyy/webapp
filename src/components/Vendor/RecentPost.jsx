import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../../utils/helpers';

const RecentPost = () => {
    const { id } = useParams();
    const [stall, setStall] = useState(null);
    const [sacks, setStoreSacks] = useState([]);
    const user = getUser();
    const observer = useRef(null);

    const fetchStore = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/vendor/${id}`);
            setStall(data.stall);
        } catch (error) {
            console.error('Error fetching stall:', error);
        }
    };

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/sack/get-store-sacks/${user._id}`
            );
            setStoreSacks(data.sacks);
        } catch (error) {
            console.error('Error fetching sacks:', error);
        }
    };

    useEffect(() => {
        fetchStore();
        fetchStoreSacks();
    }, []);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle('fade-out', !entry.isIntersecting);
                });
            },
            { threshold: 0.2 }
        );

        const cards = document.querySelectorAll('.fade-scroll');
        cards.forEach((card) => observer.current.observe(card));

        return () => observer.current.disconnect();
    }, [sacks]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        return date.toLocaleString('en-US', options);
    };

    const goodAlternatives = sacks.filter((sack) => sack.status === 'posted');
    const spoiledSacks = sacks.filter((sack) => sack.status === 'spoiled');

    const SackCard = ({ sack }) => (
        <div className="fade-scroll bg-white rounded-xl shadow border border-gray-300 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-200 text-green-900 font-bold flex items-center justify-center text-sm">
                    <img
                        src={user?.avatar?.url}
                        alt="user"
                        className="rounded-full h-10 w-10 object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm">{user?.name}</span>
                    <span className="text-xs text-gray-500">{formatDate(sack.dbSpoil)}</span>
                </div>
            </div>

            {/* Image */}
            <div className="rounded-lg overflow-hidden">
                <img
                    src={sack?.images?.[0]?.url}
                    alt="Sack"
                    className="w-full h-60 object-cover"
                />
            </div>

            {/* Description */}
            <div className="text-sm text-gray-700">{sack.description}</div>

            {/* Metadata */}
            <div className="text-xs text-gray-500">
                <div>Kilos: {sack.kilo}</div>
                <div>Location: {sack.location}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-10 font-sans">
            <div className="text-center text-3xl font-bold text-gray-800 mb-10">
                My Post
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Good Alternatives */}
                <div className="overflow-y-auto h-[80vh] scrollbar-hide border-l border-green-300 pl-8" style={{ borderWidth: 1, padding: 10 }}>
                    <h2 className="text-green-600 font-semibold text-lg mb-4 border-b pb-2">
                        Good Alternatives
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goodAlternatives.length > 0 ? (
                            goodAlternatives.map((sack) => <SackCard key={sack._id} sack={sack} />)
                        ) : (
                            <p className="text-gray-500 italic col-span-full">No good alternative sacks available.</p>
                        )}
                    </div>
                </div>

                {/* Spoiled Sacks with divider */}
                <div className="overflow-y-auto h-[80vh] scrollbar-hide border-l border-red-300 pl-8" style={{ borderWidth: 1, padding: 10 }}>
                    <h2 className="text-red-500 font-semibold text-lg mb-4 border-b pb-2">
                        Spoiled Sacks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {spoiledSacks.length > 0 ? (
                            spoiledSacks.map((sack) => <SackCard key={sack._id} sack={sack} />)
                        ) : (
                            <p className="text-gray-500 italic col-span-full">No spoiled sacks available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>
                {`
          .fade-scroll {
            opacity: 1;
            transform: scale(1);
            transition: all 0.6s ease-in-out;
          }

          .fade-scroll.fade-out {
            opacity: 0.2;
            transform: translateY(-10px) scale(0.97);
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
            </style>
        </div>
    );
};

export default RecentPost;