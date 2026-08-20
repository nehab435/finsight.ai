import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-finDark">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="flex flex-col items-center mb-6">
          <div className="text-finGreen mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Log in to manage your finances with FinSight.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. neha@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-finGreen hover:bg-green-600 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20 mt-2"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-finGreen font-semibold hover:underline">Register</Link>
        </p>

      </div>
    </div>
  );
}