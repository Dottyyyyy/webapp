import React from 'react';

const GoogleMapService = () => {
    const googleMapsEmbedUrl =
        "https://www.google.com/maps/embed/v1/place?q=H45P%2BH2H%2C%20Rizal%20Ave%2C%20Taytay%2C%201920%20Metro%20Manila%20(New%20Taytay%20Public%20Market)&key=AIzaSyBFw0Qbyq9zTFTd - tUY6dZWTgaQzuU17R8";

    return (
        < section style={{ height: '300px', width: '850px' }
        }>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: '1 1' }}>
                        <div style={{
                            borderRadius: '1rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <iframe
                                src={googleMapsEmbedUrl}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Google Map - New Taytay Public Market"
                            ></iframe>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem', color: '#FF6B6B' }}>📍</span>
                            <strong style={{ color: 'white' }}>New Taytay Public Market, Taytay, Rizal</strong>
                        </div>
                        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', color: '#FFD700' }}>⏰</span>
                            <strong style={{ color: 'white' }}>Open: 5AM - 11PM (DAILY)</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default GoogleMapService;