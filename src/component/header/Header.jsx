import React from 'react';
import "./Header.css"
import { Link } from 'react-router-dom';
import { IoMdCart } from "react-icons/io";
const Header = () => {
    return (
        <>
        <nav>
      <div class="nav__content">
        <div class="logo">
        <img className='icon' src="./src/assets/icon2.png" alt="icon"/>
        <div className='text-3xl font-semibold brand-font text-emerald-400 propoin'>Fame Pharma</div>
    </div>
        <label for="check" class="checkbox">
          <i class="ri-menu-line"></i>
        </label>
        <input type="checkbox" name="check" id="check" />
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><a href="#">Product</a></li>
          <li><a href="#">Contact</a></li>
          <li><Link to="/login"> Log In</Link></li>
          <li><Link to="/regestration"> Sign In</Link></li>
          <li><IoMdCart style={{ fontSize: '2em' }}/></li>
        </ul>
      </div>
    </nav>
    <section className="max-w-screen-xl py-20 mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 py-12">
                    <div className="order-1 lg:order-1 flex flex-col justify-center h-full space-y-6">

                        <div className="flex flex-col space-y-2">
                            <img className="w-24" src="./src/assets/medal.png" alt="banner" />
                            <h1 className="poppins text-gray-700 font-semibold text-3xl lg:text-3xl leading-relaxed">Best Quality <br /> <span className="text-5xl">Medicine in 2024</span></h1>
                            <p className="text-gray-600 text-light text-sm">Our products are world best product.We sell the real product.<br/> Welcome to our shop.</p>
                        </div>
                        <button className="btn-primary py-3 px-4 poppins w-48 mt-6 bg-emerald-400 rounded-md text-black hover:bg-emerald-200">Explore Our Shop</button>
                    </div>
                

                
                    <div className="order-1 lg:order-2">
                        <img src="https://img.freepik.com/free-vector/pharmacist-concept-illustration_114360-3107.jpg?w=740&t=st=1710926265~exp=1710926865~hmac=9a7718e3c6164ce3c6789729fd1e5f8def54394c667b3f437edb455672099b78" alt="banner" />
                    </div>
                
            </div>
        </section>
        </>
    );
};

export default Header;