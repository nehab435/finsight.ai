import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, FileText, Wallet, ShieldCheck, Sun, Moon, TrendingUp } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || true; // Default to dark if not set
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col justify-between selection:bg-finGreen selection:text-white transition-colors duration-300">
      
      {/* NAVBAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-finGreen flex items-center justify-center text-white shadow-lg shadow-green-500/30 font-bold">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">FinSight <span className="text-finGreen">AI</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-700" />}
          </button>
          <Link to="/login" className="text-sm font-medium px-4 py-2 hover:text-finGreen transition-colors">Sign In</Link>
          <Link to="/register" className="bg-finGreen text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">Register</Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-finGreen border border-green-500/20 text-xs font-semibold mb-6">
          <Sparkles size={14} /> Next-Gen AI Financial Intelligence & Wealth Tracking
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl">
          Your Complete Financial World, <span className="text-transparent bg-clip-text bg-gradient-to-r from-finGreen to-emerald-400">Powered by AI.</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Upload bank statements, track multi-account portfolios, evaluate home loans and liabilities, and let our intelligent AI deliver actionable wealth insights instantly.
        </p>

        {/* CTA BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-finGreen text-white px-8 py-4 rounded-full font-bold text-base hover:bg-green-600 transition-all shadow-xl shadow-green-500/25 flex items-center justify-center gap-3">
            Get Started Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-full font-bold text-base hover:bg-gray-200 dark:hover:bg-gray-800 transition-all">
            Sign In to Account
          </button>
        </div>

        {/* FEATURE CARDS */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:border-finGreen/50 transition-colors">
            <div className="p-3 bg-green-50 dark:bg-green-500/10 text-finGreen rounded-2xl w-fit mb-4">
              <Wallet size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Account & Asset Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Consolidate savings, checking, investment, and loan accounts in one secure dashboard with real-time balance aggregation.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:border-finGreen/50 transition-colors">
            <div className="p-3 bg-green-50 dark:bg-green-500/10 text-finGreen rounded-2xl w-fit mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Document Parsing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Upload statements, financial reports, and loan agreements. Our AI extracts key assets, liabilities, and spending metrics automatically.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:border-finGreen/50 transition-colors">
            <div className="p-3 bg-green-50 dark:bg-green-500/10 text-finGreen rounded-2xl w-fit mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">AI Financial Health Scoring</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Evaluate your overall financial standing with automated health scores, liability metrics, and personalized wealth advice.
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-gray-100 dark:border-gray-900 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} FinSight AI. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/login" className="hover:text-finGreen transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-finGreen transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
}