import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <footer className="footer flex flex-col md:flex-row flex-wrap items-center md:items-start justify-between gap-8 p-6 md:p-10 bg-emerald-100 text-base-content mt-10">
        
        {/* Logo and tagline */}
        <aside className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-auto">
          <img src="./src/assets/iconfooter.png" className="max-w-full h-28 md:h-40" alt="Farm to Home Logo" />
          <p className="text-center md:text-left mt-3 text-green-800 font-medium">
            Bringing Freshness <br /> From Our Farms to Your Doorstep.
          </p>
        </aside>

        {/* Explore */}
        <nav className="w-full sm:w-auto flex flex-col items-center md:items-start">
          <h6 className="footer-title text-green-900">Explore</h6>
          <Link className="link link-hover">Home</Link>
          <Link className="link link-hover">Products</Link>
          <Link className="link link-hover">Farmers</Link>
          <Link className="link link-hover">How It Works</Link>
        </nav>

        {/* Support */}
        <nav className="w-full sm:w-auto flex flex-col items-center md:items-start">
          <h6 className="footer-title text-green-900">Support</h6>
          <Link className="link link-hover">FAQs</Link>
          <Link className="link link-hover">Shipping & Delivery</Link>
          <Link className="link link-hover">Returns & Refunds</Link>
          <Link className="link link-hover">Contact Us</Link>
        </nav>

        {/* Community */}
        <nav className="w-full sm:w-auto flex flex-col items-center md:items-start">
          <h6 className="footer-title text-green-900">Community</h6>
          <Link className="link link-hover">About Us</Link>
          <Link className="link link-hover">Our Farmers</Link>
          <Link className="link link-hover">Blog</Link>
          <Link className="link link-hover">Join as Farmer</Link>
        </nav>
      </footer>

      {/* Copyright */}
      <div className="text-center bg-emerald-200 py-4 text-sm text-gray-700">
        © 2025 <span className="font-semibold text-green-800">AgriBasket</span>. All rights reserved.
      </div>
    </>
  );
};

export default Footer;
