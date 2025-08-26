import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const services = [
  {
    title: 'Fresh from Local Farms',
    img: 'https://images.unsplash.com/photo-1609126986933-e3c84f19d49c?q=80&w=2069&auto=format&fit=crop',
    desc: 'Seasonal, hand-picked, and chemical-free produce straight to your door.'
  },
  {
    title: 'Doorstep Delivery',
    img: 'https://plus.unsplash.com/premium_photo-1661409100444-5ab608d6e693?q=80&w=2070&auto=format&fit=crop',
    desc: 'Fast, eco-friendly delivery to ensure freshness every time.'
  },
  {
    title: 'Support Local Farmers',
    img: 'https://plus.unsplash.com/premium_photo-1682092047778-a5ebda1804e8?q=80&w=2070&auto=format&fit=crop',
    desc: 'Every order helps support small-scale farmers and rural communities.'
  },
  {
    title: 'Eco-Friendly Packaging',
    img: 'https://plus.unsplash.com/premium_photo-1736583008967-d0e92d28ce23?q=80&w=1932&auto=format&fit=crop',
    desc: 'Sustainable packaging to reduce environmental impact.'
  }
];

const Carousel = () => {
  return (
    <div className="max-w-6xl mx-auto py-10 px-2 sm:px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight brand-font text-gray-800">
          Our <span className="text-[#1D7603]">Services</span>
        </h1>
        <p className="text-gray-500 mt-2 text-base sm:text-lg">What makes us different from others</p>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500 }}
        loop={true}
        className="pb-8 sm:pb-12"
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 24,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 32,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        }}
      >
        {services.map((service, index) => (
          <SwiperSlide key={index}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="flex flex-col items-center text-center bg-white shadow-xl rounded-2xl p-4 sm:p-8 max-w-xs sm:max-w-xl mx-auto"
            >
              <div className="relative">
                <img
                  src={service.img}
                  alt={service.title}
                  className="rounded-full w-40 h-40 sm:w-60 sm:h-60 object-cover border-4 border-[#1D7603] shadow-md hover:scale-105 transition duration-300"
                />
              </div>
              <h2 className="text-lg sm:text-2xl font-semibold mt-4 sm:mt-6 mb-2 text-[#1D7603]">
                {service.title}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-md">
                {service.desc}
              </p>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
