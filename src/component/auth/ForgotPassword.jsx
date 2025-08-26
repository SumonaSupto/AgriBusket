import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  // If we have a token in the URL, show reset form
  React.useEffect(() => {
    if (resetToken) {
      setStep('reset');
    }
  }, [resetToken]);

  const onSubmitEmail = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:18562/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password reset email sent! Please check your email.");
        // Optionally redirect to login or show success message
      } else {
        toast.error(result.message || "Failed to send reset email");
      }
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReset = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:18562/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: data.newPassword
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password reset successful! You can now login with your new password.");
        navigate("/login");
      } else {
        toast.error(result.message || "Password reset failed");
      }
    } catch (error) {
      toast.error("Password reset failed. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const password = watch("newPassword");

  if (step === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 flex items-center justify-center p-5">
        <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">Reset Your Password</h2>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmitReset)} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("newPassword", { 
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long"
                  }
                })}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <span className="text-red-600 text-sm">{errors.newPassword.message}</span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <span className="text-red-600 text-sm">{errors.confirmPassword.message}</span>
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
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 text-sm">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 flex items-center justify-center p-5">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-700 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">No worries! Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Please enter a valid email address"
                }
              })}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="text-red-600 text-sm">{errors.email.message}</span>
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
                Sending Reset Link...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center space-y-2">
            <Link to="/login" className="block text-emerald-600 hover:text-emerald-700 text-sm">
              ← Back to Login
            </Link>
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link to="/registration" className="text-emerald-600 hover:text-emerald-700">
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Security Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-gray-800">Security Notice</h4>
              <p className="text-sm text-gray-600 mt-1">
                Reset links are valid for 1 hour. If you don't receive an email, check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
