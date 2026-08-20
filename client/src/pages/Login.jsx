import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Sun, Moon } from 'lucide-react';
import { loginUser } from '../api/api'; // Make sure loginUser is imported from your api file

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('theme');
      if (saved) setIsDarkMode(saved === 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call your actual backend API login route
      const response = await loginUser({ email, password });
      
      // Assuming your backend returns { token, user } or similar
      const token = response.data.token || response.data.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } else {
        setError('Authentication failed: No token received from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#040B16] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {isDarkMode && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#00DF81]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        </>
      )}

      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10 max-w-7xl mx-auto w-full px-6">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition">
          finsight<span className="text-[#00DF81]">.ai</span>
        </Link>
        
        <button 
          onClick={toggleTheme} 
          className={`p-2.5 border rounded-full transition-all shadow-sm ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 z-10 mt-12"
      >
        <div className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 shadow-xl'}`}>
          
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81] ring-1 ring-[#00DF81]/20' : 'bg-green-50 text-[#00B86B]'}`}>
              <Activity size={24} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Log in to manage your finances with FinSight.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-700'}`}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                required
                className={`w-full border rounded-xl px-4 py-3 outline-none transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-600 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-700'}`}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full border rounded-xl px-4 py-3 outline-none transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white placeholder-gray-600 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00DF81] to-[#00B86B] text-black font-bold text-lg py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-all mt-4 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className={`text-center text-sm mt-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00DF81] font-semibold hover:underline">
              Register
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}