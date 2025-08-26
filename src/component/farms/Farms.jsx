import React from 'react';
import { Link } from 'react-router-dom';

const Farms = () => {
  // Sample farm data - you can replace with real data
  const farms = [
    {
      id: 1,
      name: "Green Valley Organic Farm",
      image: "./src/assets/hero.jpg", // Using existing image as placeholder
      location: "Northern Valley, State",
      size: "150 acres",
      specialty: "Organic Vegetables & Fruits",
      description: "A family-owned organic farm that has been providing fresh, chemical-free produce for over 30 years. We specialize in seasonal vegetables, herbs, and tree fruits.",
      established: "1990",
      certifications: ["USDA Organic", "Non-GMO Verified"],
      products: ["Tomatoes", "Carrots", "Lettuce", "Apples", "Herbs"]
    },
    {
      id: 2,
      name: "Sunshine Dairy Farm",
      image: "./src/assets/veg.png", // Using existing image as placeholder
      location: "Central Plains, State",
      size: "200 acres",
      specialty: "Dairy Products & Livestock",
      description: "Our pasture-raised dairy farm produces the finest milk, cheese, and yogurt. Our cows graze freely on natural grasslands, ensuring the highest quality products.",
      established: "1985",
      certifications: ["Grass-Fed Certified", "Animal Welfare Approved"],
      products: ["Fresh Milk", "Artisan Cheese", "Greek Yogurt", "Butter", "Cream"]
    },
    {
      id: 3,
      name: "Mountain View Berry Farm",
      image: "./src/assets/hero.jpg", // Using existing image as placeholder
      location: "Highland Region, State",
      size: "75 acres",
      specialty: "Berry Cultivation",
      description: "Nestled in the mountains, our farm specializes in growing the sweetest berries. The high altitude and clean mountain air create perfect conditions for premium berry production.",
      established: "2000",
      certifications: ["Sustainable Agriculture", "Rainforest Alliance"],
      products: ["Strawberries", "Blueberries", "Raspberries", "Blackberries", "Jams"]
    },
    {
      id: 4,
      name: "Heritage Grain Farm",
      image: "./src/assets/veg.png", // Using existing image as placeholder
      location: "Eastern Plains, State",
      size: "500 acres",
      specialty: "Ancient Grains & Cereals",
      description: "We preserve agricultural heritage by growing ancient grains and heirloom varieties. Our sustainable farming practices ensure both environmental health and nutritional quality.",
      established: "1975",
      certifications: ["Organic Certified", "Heritage Seed Foundation"],
      products: ["Quinoa", "Amaranth", "Spelt", "Emmer Wheat", "Barley"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Partner Farms</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated farmers who bring you the freshest, highest-quality produce. 
            Each farm in our network is committed to sustainable practices and exceptional standards.
          </p>
        </div>

        {/* Farms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Farm Image */}
              <div className="h-64 overflow-hidden">
                <img 
                  src={farm.image} 
                  alt={farm.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Farm Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{farm.name}</h2>
                  <span className="text-sm text-[#1D7603] bg-green-100 px-2 py-1 rounded-full">
                    Est. {farm.established}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-[#1D7603]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{farm.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-[#1D7603]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{farm.size} • {farm.specialty}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {farm.description}
                </p>
                
                {/* Certifications */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Certifications:</h4>
                  <div className="flex flex-wrap gap-2">
                    {farm.certifications.map((cert, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-[#1D7603] text-white px-2 py-1 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Products */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Featured Products:</h4>
                  <div className="flex flex-wrap gap-2">
                    {farm.products.map((product, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Visit Farm Button */}
                <button className="w-full bg-[#1D7603] text-white py-2 px-4 rounded-md hover:bg-[#155502] transition duration-300 font-medium">
                  Learn More About This Farm
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to Partner With Us?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Are you a farmer committed to sustainable practices? Join our network and reach customers 
            who value fresh, locally-sourced produce.
          </p>
          <Link to="/registration">
            <button className="bg-[#1D7603] text-white py-3 px-8 rounded-md hover:bg-[#155502] transition duration-300 font-medium">
              Apply to Join Our Network
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Farms;
