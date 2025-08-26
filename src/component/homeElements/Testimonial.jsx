import React, { useState, useEffect } from 'react';
import TestimonialForm from './TestimonialForm';

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:18562/api/testimonials?featured=true&limit=4');
        const data = await response.json();
        
        if (data.success) {
          setTestimonials(data.data.testimonials);
        } else {
          setError('Failed to load testimonials');
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 mb-10">
        <h1 className='text-3xl font-semibold brand-font'>
          Our <span className='text-[#1D7603]'>Testimonials</span>
        </h1>
        <div className="flex justify-center items-center py-20">
          <div className="loading loading-spinner loading-lg text-[#1D7603]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 mb-10">
        <h1 className='text-3xl font-semibold brand-font'>
          Our <span className='text-[#1D7603]'>Testimonials</span>
        </h1>
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='text-center mt-10 mb-10'>
        <h1 className='text-3xl font-semibold brand-font'>
          Our <span className='text-[#1D7603]'>Testimonials</span>
        </h1>
        <p className="text-gray-600 mt-2 mb-6">
          Hear what our customers have to say about their experience
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#1D7603] text-white px-6 py-2 rounded-lg hover:bg-[#155402] transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Share Your Experience
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 sm:px-4 md:px-8 justify-items-center'>
        {testimonials.map((testimonial) => (
          <div
            key={testimonial._id}
            className="card w-full max-w-xs sm:max-w-sm md:max-w-md bg-base-100 shadow-xl flex flex-col"
          >
            <figure className="w-full">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className='mx-auto w-full h-56 sm:h-64 md:h-72 object-cover rounded-t-xl'
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                }}
              />
            </figure>
            <div className="card-body flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title text-lg">{testimonial.name}</h2>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {testimonial.location && (
                <p className="text-sm text-gray-500 mb-2">
                  📍 {testimonial.location}
                </p>
              )}
              
              {testimonial.occupation && (
                <p className="text-sm text-[#1D7603] font-medium mb-3">
                  {testimonial.occupation}
                </p>
              )}
              
              <p className="text-gray-700 flex-1">{testimonial.text}</p>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Customer
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-gray-500">No testimonials available at the moment.</p>
        </div>
      )}

      {showForm && (
        <TestimonialForm
          onClose={() => setShowForm(false)}
          onSubmit={() => {
            // Refresh testimonials after submission
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default Testimonial;
