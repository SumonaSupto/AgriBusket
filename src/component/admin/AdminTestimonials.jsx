import React, { useState, useEffect } from 'react';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('agribasket_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:18562/api/testimonials/admin?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data.testimonials);
      } else {
        setError(data.message || 'Failed to fetch testimonials');
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('agribasket_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:18562/api/testimonials/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the list
        fetchTestimonials();
        alert('Testimonial approved successfully!');
      } else {
        alert(data.message || 'Failed to approve testimonial');
      }
    } catch (err) {
      console.error('Error approving testimonial:', err);
      alert('Failed to approve testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const token = localStorage.getItem('agribasket_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:18562/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the list
        fetchTestimonials();
        alert('Testimonial deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete testimonial');
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete testimonial');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Testimonials</h1>
        <div className="flex justify-center items-center py-20">
          <div className="loading loading-spinner loading-lg text-[#1D7603]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Testimonials</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7603]"
          >
            <option value="all">All Testimonials</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No testimonials found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className={`border rounded-lg p-6 ${
                testimonial.isApproved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        testimonial.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {testimonial.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {(testimonial.location || testimonial.occupation) && (
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      {testimonial.location && (
                        <span>📍 {testimonial.location}</span>
                      )}
                      {testimonial.occupation && (
                        <span>💼 {testimonial.occupation}</span>
                      )}
                    </div>
                  )}

                  <p className="text-gray-700 mb-4">{testimonial.text}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Submitted: {new Date(testimonial.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex gap-2">
                      {!testimonial.isApproved && (
                        <button
                          onClick={() => handleApprove(testimonial._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
