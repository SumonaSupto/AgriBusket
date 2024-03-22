import React from 'react';

const Footer = () => {
    return (
        <>
        <footer className="footer p-10 bg-emerald-100 text-base-content  mt-10">
  <aside>
    <img src="./src/assets/iconFooter.png" className='max-w-full h-52' alt="icon" />
  </aside> 
  <nav className='bg-emerald-100'>
    <h6 className="footer-title">Services</h6> 
    <a className="link link-hover">Branding</a>
    <a className="link link-hover">Design</a>
    <a className="link link-hover">Marketing</a>
    <a className="link link-hover">Advertisement</a>
  </nav> 
  <nav className='bg-emerald-100'>
    <h6 className="footer-title">Company</h6> 
    <a className="link link-hover">About us</a>
    <a className="link link-hover">Contact</a>
    <a className="link link-hover">Jobs</a>
    <a className="link link-hover">Press kit</a>
  </nav> 
  <nav className='bg-emerald-100' >
    <h6 className="footer-title">Legal</h6> 
    <a className="link link-hover">Terms of use</a>
    <a className="link link-hover">Privacy policy</a>
    <a className="link link-hover">Cookie policy</a>
  </nav>
</footer>
        </>
    );
};

export default Footer;