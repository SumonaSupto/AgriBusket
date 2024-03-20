import React from 'react';

const Carousel = () => {
    return (
        <>
        <div className='text-center mb-10'><h1 className='text-3xl font-semibold brand-font '>Our <span className='text-emerald-400'>Service</span></h1></div>
        <div className="carousel w-full">
  <div id="item1" className="carousel-item w-full flex flex-col">
    <img src="https://img.freepik.com/free-photo/medical-banner-with-stethoscope_23-2149611199.jpg?t=st=1710916526~exp=1710920126~hmac=64fdeefef439a2cffb518ff4c5674a728304b7dd49ecde3a25e488119fc2dc63&w=740" className="rounded-full mx-auto w-80 h-80" />
    <div className='text-center mt-5'><h2 className='text-2xl font-semibold brand-font'>24/7 Live Medical<br />Service</h2></div>
  </div> 
  <div id="item2" className="carousel-item w-full flex flex-col">
    <img src="https://img.freepik.com/free-photo/medical-banner-with-doctor-wearing-equipment_23-2149611213.jpg?t=st=1710916618~exp=1710920218~hmac=b38024ace864e26a63c3ca6b4f627e38e1334274d4b672e03e231c4d89f4ab67&w=996" className="rounded-full mx-auto w-80 h-80" />
    <div className='text-center mt-5'><h2 className='text-2xl font-semibold brand-font'>Pharmacy Helpline</h2></div>
  </div> 
  <div id="item3" className="carousel-item w-full flex flex-col">
    <img src="https://img.freepik.com/free-photo/top-view-with-red-pill-multicolored-pills-macro-red-white-color_482257-31131.jpg?t=st=1710916675~exp=1710920275~hmac=b0c14160ca72a27f278680dc39ddde48241647e0284175df0c241c7a4521f328&w=996" className="rounded-full mx-auto w-80 h-80" />
    <div className='text-center mt-5'><h2 className='text-2xl font-semibold brand-font'>Authentic Medicine</h2></div>
  </div> 
  <div id="item4" className="carousel-item w-full flex flex-col">
    <img src="https://img.freepik.com/free-photo/microbiology-scientist-typing-biochemistry-discovery-experiment-computer_482257-13961.jpg?t=st=1710916729~exp=1710920329~hmac=0cd84a43d4f87e09e377735b9b04eff33c3869ab20d5a1761bc1e3fa2e658b88&w=996" className="rounded-full mx-auto w-80 h-80" />
    <div className='text-center mt-5'><h2 className='text-2xl font-semibold brand-font'>Prescribing Tools</h2></div>
  </div>
</div> 
<div className="flex justify-center w-full py-2 gap-2">
  <a href="#item1" className="btn btn-xs">1</a> 
  <a href="#item2" className="btn btn-xs">2</a> 
  <a href="#item3" className="btn btn-xs">3</a> 
  <a href="#item4" className="btn btn-xs">4</a>
</div>
        </>
    );
};

export default Carousel;