import React from 'react';

const GoogleMapService = () => {
    const googleMapsEmbedUrl =
        "https://www.google.com/maps/embed/v1/directions?origin=Technological%20University%20of%20the%20Philippines%20Taguig%20City&destination=New%20Taytay%20Public%20Market%2C%20Taytay%2C%20Rizal&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

    return (
        <section style={{ height: '300px', width: '850px' }}>
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
                            <strong>New Taytay Public Market, Taytay, Rizal</strong>
                        </div>
                        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', color: '#FFD700' }}>⏰</span>
                            <strong>Open: 5AM - 11PM (DAILY)</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GoogleMapService;