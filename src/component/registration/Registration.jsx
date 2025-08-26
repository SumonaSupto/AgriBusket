import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:18562/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUserEmail(data.email);
        setVerificationStep(true);
        toast.success("Registration successful! Please check your email for verification code.");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:18562/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          verificationCode: verificationCode
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Use the login function from AuthContext
        login(result.data.user, result.data.token);
        
        toast.success("Email verified successfully! Welcome to AgriBasket!");
        navigate("/");
      } else {
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    
    try {
      const response = await fetch('http://localhost:18562/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Verification code sent! Please check your email.");
      } else {
        toast.error(result.message || "Failed to resend code");
      }
    } catch (error) {
      toast.error("Failed to resend verification code.");
      console.error("Resend error:", error);
    } finally {
      setResendLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 flex items-center justify-center p-5">
        <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 mb-4">
              We've sent a 6-digit verification code to<br />
              <span className="font-medium text-emerald-600">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Verification Code</label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your email</p>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setVerificationStep(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 flex items-center justify-center p-5">
      <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden">
        
        {/* Left Side Image */}
        <div className="md:w-1/2 hidden md:flex items-center justify-center bg-emerald-50 p-6">
          <img
            src="./src/assets/signup.png"
            alt="registration"
            className="w-80 h-auto"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">
            Create an Account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">First Name</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register("firstName", { required: "First name is required" })}
                  placeholder="Your first name"
                />
                {errors.firstName && (
                  <span className="text-red-600 text-sm">{errors.firstName.message}</span>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Last Name</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register("lastName", { required: "Last name is required" })}
                  placeholder="Your last name"
                />
                {errors.lastName && (
                  <span className="text-red-600 text-sm">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Please enter a valid email address"
                  }
                })}
                placeholder="Your email address"
              />
              {errors.email && (
                <span className="text-red-600 text-sm">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("phone", { 
                  required: "Phone number is required",
                  pattern: {
                    value: /^[+]?[1-9][\d]{0,15}$/,
                    message: "Please enter a valid phone number"
                  }
                })}
                placeholder="Your phone number"
              />
              {errors.phone && (
                <span className="text-red-600 text-sm">{errors.phone.message}</span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long"
                  }
                })}
                placeholder="Create a secure password"
              />
              {errors.password && (
                <span className="text-red-600 text-sm">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-emerald-600 hover:underline">
                Already have an account? Sign in here.
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
