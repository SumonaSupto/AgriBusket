import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="max-w-screen-xl py-20 mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-12">
        <div className="flex flex-col justify-center h-full space-y-6">
          <div className="flex flex-col space-y-2">
            <img className="w-24" src="./src/assets/veg.png" alt="banner" />
            <h1 className="poppins text-gray-700 font-semibold text-3xl lg:text-3xl leading-relaxed">
              Fresh from the Farm<br />
              <span className="text-5xl">Straight to Your Doorstep</span>
            </h1>
            <p className="text-gray-600 text-light text-sm">
              Experience the taste of nature with handpicked, locally grown produce—delivered fresh, fast, and chemical-free. Support farmers. Eat healthy. Live better.
            </p>
          </div>
          <Link to="/farms">
            <button className="btn-primary py-3 px-4 poppins w-48 mt-6 bg-[#1D7603] rounded-md text-white hover:bg-emerald-200 hover:text-black transition duration-300">
              Explore Our Farms
            </button>
          </Link>
        </div>
        <div>
          <img src="./src/assets/hero.jpg" alt="banner" className="w-full scale-100 md:scale-110 lg:scale-125 ml-0 md:ml-10" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
