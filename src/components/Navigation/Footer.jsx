import React from 'react'

function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-10 px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto text-sm">
                <div>
                    <h4 className="font-semibold mb-2">Contact Us</h4>
                    <p>Email: info@nowaste.com</p>
                    <p>Phone: (555) 123-4567</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p>Rizal Avenue Brgy.</p>
                    <p>San Juan, 1920 Taytay</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">FAQs</h4>
                    <p>How it works</p>
                    <p>Terms of Service</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Social Media</h4>
                    <div className="flex gap-3">
                        <a href="#" className="hover:text-green-400">🐦</a>
                        <a href="#" className="hover:text-green-400">📘</a>
                        <a href="#" className="hover:text-green-400">📸</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer