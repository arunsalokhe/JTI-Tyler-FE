import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In your actual project, replace this with:
    login({ email, name: 'User' });
    navigate('/dashboard');
    console.log('Login submitted:', { email, rememberMe });
    //alert('Login successful! In your project, this will navigate to dashboard.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-pink-100 rounded-full opacity-40 blur-3xl"></div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <div className="bg-red-600 rounded-lg p-2 mr-3">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">EFilingHub</span>
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Country Wide Process</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to<br />EFilingHub
          </h1>

          <div className="space-y-3 text-gray-600">
            <p>
              Need help? <a href="#" className="text-gray-800 font-semibold hover:underline">Contact us</a> or check out our <a href="#" className="text-gray-800 font-semibold hover:underline">Support Center</a>.
            </p>
            <p>
              New to EFilingHub? <a href="#" className="text-gray-800 font-semibold hover:underline">Create an account</a>.
            </p>
            <p className="text-sm">
              <a href="#" className="text-gray-800 font-semibold hover:underline">Supported browsers</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-12 text-xs text-gray-500">
          <p>© Country Wide Process</p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center">
          <div className="bg-red-600 rounded-lg p-1.5 mr-2">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">EFilingHub</span>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 sm:p-10">
            <h2 className="text-2xl font-normal text-gray-600 mb-8 text-center">Log in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                  placeholder="ghorpadesumit471@gmail.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-500 active:bg-blue-600 transition duration-200 text-base"
              >
                Log in
              </button>

              {/* Remember Me */}
              <div className="flex items-center justify-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-400 mr-2 w-4 h-4 border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
              </div>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <button type="button" className="text-sm text-gray-600 hover:text-gray-800 underline">
                Forgot password?
              </button>
            </div>
          </div>

          {/* Footer Links - Mobile */}
          <div className="lg:hidden mt-8 text-center text-xs text-gray-500 space-y-1">
            <div className="flex justify-center space-x-4">
              <a href="#" className="hover:underline">Accessibility statement</a>
              <span>|</span>
              <a href="#" className="hover:underline">Privacy policy</a>
              <span>|</span>
              <a href="#" className="hover:underline">Terms of service</a>
            </div>
          </div>
        </div>

        {/* Footer Links - Desktop */}
        <div className="hidden lg:block absolute bottom-8 right-12 text-xs text-gray-500">
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Accessibility statement</a>
            <span>|</span>
            <a href="#" className="hover:underline">Privacy policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">Terms of service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;