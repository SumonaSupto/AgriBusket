import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Regestration = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: registration form, 2: email verification
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");

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
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmail(data.email);
        setStep(2);
        toast.success("Registration successful! Please check your email for verification code.");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async (verificationCode) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:18562/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verificationCode: verificationCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Auto-login after successful verification
        login(result.data.user, result.data.token);
        toast.success("Email verified successfully! Welcome to AgriBasket!");
        navigate("/");
      } else {
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          {step === 1 ? (
            <>
              <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">
                Create an Account
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">First Name</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      {...register("firstName", { required: true })}
                      placeholder="Your first name"
                    />
                    {errors.firstName && (
                      <span className="text-red-600 text-sm">First name is required</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Last Name</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      {...register("lastName", { required: true })}
                      placeholder="Your last name"
                    />
                    {errors.lastName && (
                      <span className="text-red-600 text-sm">Last name is required</span>
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
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="Your email address"
                  />
                  {errors.email && (
                    <span className="text-red-600 text-sm">{errors.email.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Phone</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register("phone", { required: true })}
                    placeholder="Your phone number"
                  />
                  {errors.phone && (
                    <span className="text-red-600 text-sm">Phone is required</span>
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
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <span className="text-red-600 text-sm">{errors.password.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-600 text-sm">{errors.confirmPassword.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-emerald-600 hover:underline">
                    Already have an account? Login here.
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <EmailVerificationStep 
              email={email}
              onVerify={handleEmailVerification}
              loading={loading}
              onResend={() => {
                // Handle resend verification code
                fetch('http://localhost:18562/api/auth/resend-verification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email }),
                })
                .then(res => res.json())
                .then(result => {
                  if (result.success) {
                    toast.success("Verification code sent!");
                  } else {
                    toast.error(result.message || "Failed to resend code");
                  }
                })
                .catch(() => toast.error("Network error"));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Email Verification Step Component
const EmailVerificationStep = ({ email, onVerify, loading, onResend }) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      onVerify(verificationCode);
    } else {
      toast.error("Please enter a valid 6-digit code");
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">
        Verify Your Email
      </h2>
      <div className="text-center mb-6">
        <p className="text-gray-600 mb-2">
          We've sent a verification code to:
        </p>
        <p className="font-semibold text-emerald-700">{email}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1 text-center">
            Enter 6-digit verification code
          </label>
          <input
            type="text"
            maxLength="6"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition-all"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onResend}
            className="text-emerald-600 hover:underline"
          >
            Didn't receive the code? Resend
          </button>
        </div>
      </form>
    </>
  );
};

export default Regestration;
