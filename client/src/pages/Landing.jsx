import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sun, Moon, Plus, Minus, ShieldCheck, BrainCircuit, Zap, BarChart3, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  // Global Theme State Synchronization
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-[#040B16] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. THE CURVED PLANET ARC HORIZON (Visible in Dark Mode) */}
      {isDarkMode && (
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[150%] max-w-[1400px] h-[550px] rounded-[50%] border-b-[2px] border-[#00DF81]/40 bg-gradient-to-b from-transparent via-[#00DF81]/10 to-[#00DF81]/25 shadow-[0_0_120px_rgba(0,223,129,0.25)] pointer-events-none"></div>
      )}

      {/* NAVBAR */}
      <header className={`relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="text-2xl font-bold tracking-tight">
          finsight<span className="text-[#00DF81]">.ai</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Search size={18} className={`cursor-pointer transition ${isDarkMode ? 'text-gray-400 hover:text-[#00DF81]' : 'text-slate-500 hover:text-[#00DF81]'}`} />
          
          <button 
            onClick={toggleTheme} 
            className={`p-2.5 border rounded-full transition-all shadow-sm ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          <Link to="/login" className={`transition ${isDarkMode ? 'text-gray-300 hover:text-[#00DF81]' : 'text-slate-600 hover:text-[#00DF81]'}`}>Sign In</Link>
          <Link to="/register" className="bg-[#00DF81] text-black px-6 py-2.5 rounded-full hover:bg-[#00B86B] font-bold transition shadow-lg">
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`text-2xl md:text-4xl font-bold tracking-wide mb-3 uppercase ${isDarkMode ? 'text-[#00DF81]' : 'text-[#00B86B]'}`}
        >
          AI-POWERED FINANCIAL INTELLIGENCE
        </motion.h2>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
        >
          for Precision and Growth
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`max-w-2xl text-lg mb-10 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}
        >
          Harness the power of sophisticated AI to analyze, aggregate, predict, and optimize your financial world. Identify trends, manage risks, and unlock hidden opportunities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00DF81] to-[#00B86B] text-black font-bold uppercase tracking-wide px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all">
            Start Your Analysis <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* CORE CAPABILITIES STRIP */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className={`mt-24 w-full border-t pt-10 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
        >
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-10">Powered by Next-Gen Technology</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className={`p-3 rounded-full mb-2 ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81]' : 'bg-slate-100 text-[#00B86B]'}`}>
                <ShieldCheck size={28} />
              </div>
              <span className="font-bold text-lg">Bank-Grade</span>
              <span className="text-sm text-slate-500">256-bit Encryption</span>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-2">
              <div className={`p-3 rounded-full mb-2 ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81]' : 'bg-slate-100 text-[#00B86B]'}`}>
                <BrainCircuit size={28} />
              </div>
              <span className="font-bold text-lg">Smart Parsing</span>
              <span className="text-sm text-slate-500">AI Document Analysis</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <div className={`p-3 rounded-full mb-2 ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81]' : 'bg-slate-100 text-[#00B86B]'}`}>
                <Zap size={28} />
              </div>
              <span className="font-bold text-lg">Real-Time</span>
              <span className="text-sm text-slate-500">Lightning Fast Sync</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <div className={`p-3 rounded-full mb-2 ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81]' : 'bg-slate-100 text-[#00B86B]'}`}>
                <BarChart3 size={28} />
              </div>
              <span className="font-bold text-lg">Unified View</span>
              <span className="text-sm text-slate-500">All Assets Tracked</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* MIDDLE SECTION (DASHBOARD SPLIT) */}
      <section className={`relative z-10 max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Seamless Financial <br/> Data Aggregation
          </h2>
          <p className={`text-lg mb-8 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Consolidate bank accounts, investment portfolios, and cash flow data with enterprise-grade security and automated intelligent reporting.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-[#00DF81] text-black font-bold px-6 py-3 rounded-full hover:bg-[#00B86B] transition shadow-md">
            SECURE MY DATA &rarr;
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200'}`}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-1">finsight<span className="text-[#00DF81]">.ai</span></h3>
            <p className="text-sm tracking-widest text-slate-500 uppercase">Unified Portfolio</p>
            <div className="mt-6 text-4xl font-bold">$125,400.00</div>
            <p className="text-xs text-slate-500 mt-1">Total Aggregated Assets</p>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'HDFC Savings', type: 'Liquid Asset' },
              { name: 'Vanguard 401(k)', type: 'Retirement' },
              { name: 'Chase Sapphire Reserve', type: 'Credit Card' },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between items-center p-4 rounded-xl border transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                <span className="font-medium">{item.name}</span>
                <span className="text-slate-500 text-sm">{item.type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 2. THE PROFESSIONAL BLOG / INSIGHTS CARDS SECTION (Stubs Removed) */}
      <section className={`relative z-10 max-w-7xl mx-auto px-6 py-20 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="text-center mb-12">
          <h3 className={`text-sm uppercase tracking-widest font-semibold mb-2 ${isDarkMode ? 'text-[#00DF81]' : 'text-[#00B86B]'}`}>Expert Knowledge</h3>
          <h2 className="text-3xl md:text-4xl font-bold">Latest Financial Intelligence Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI and the Future of Personalized Wealth Management",
              desc: "Discover how machine learning models analyze macro spending trends to protect assets.",
              tag: "AI Strategy"
            },
            {
              title: "Predicting Cash Flow with finsight.ai: A User Guide",
              desc: "Step-by-step methodology on connecting institutional accounts for precise predictive modeling.",
              tag: "Platform Guide"
            },
            {
              title: "Case Study: Optimizing Multi-Account Liquidity",
              desc: "How enterprises and high-net-worth users automate risk management across diverse portfolios.",
              tag: "Case Study"
            }
          ].map((post, i) => (
            <div key={i} className={`border rounded-2xl p-6 flex flex-col justify-between transition-all shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81]' : 'bg-green-50 text-[#00B86B]'}`}>
                  {post.tag}
                </span>
                <h4 className="text-lg font-bold mb-3">{post.title}</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{post.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE PROFESSIONAL INTERACTIVE FAQ ACCORDION */}
      <section className={`relative z-10 max-w-4xl mx-auto px-6 py-24 text-center border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-2xl md:text-3xl font-bold tracking-wide mb-2 uppercase ${isDarkMode ? 'text-[#00DF81]' : 'text-[#00B86B]'}`}
        >
          Frequently Asked Questions
        </motion.h2>
        <p className={`mb-12 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Everything you need to know about our platform security and analytics engine.</p>

        <div className="space-y-4 text-left">
          {[
            { q: "How does finsight.ai securely parse my financial documents?", a: "We utilize advanced transformer-based LLMs paired with enterprise-grade 256-bit encryption to extract data locally without exposing your personal information." },
            { q: "Is international multi-account aggregation supported?", a: "Yes, our engine integrates seamlessly with cross-border institutions across multiple global markets and currencies." },
            { q: "What type of automated wealth advice does the AI provide?", a: "The system delivers real-time portfolio balancing alerts, anomaly detection for unexpected outflows, and custom risk-scoring matrices." },
            { q: "How can finsight.ai help optimize my liability and risk management?", a: "By continuously scanning your active loans, investments, and spending patterns, the system automatically suggests adjustments to minimize debt penalties." },
            { q: "What bank-level security protocols protect my financial data?", a: "All communication is encrypted via TLS 1.3 in transit, and stored balances comply with standard institutional safety audits." }
          ].map((item, i) => (
            <div 
              key={i}
              onClick={() => toggleFaq(i)}
              className={`border rounded-xl p-5 cursor-pointer transition-colors shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.q}</span>
                <div className={`p-1 rounded-full ${isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>
                  {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                </div>
              </div>
              {openFaq === i && (
                <p className={`mt-4 text-sm leading-relaxed border-t pt-3 ${isDarkMode ? 'text-gray-400 border-white/10' : 'text-slate-600 border-slate-100'}`}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`w-full max-w-7xl mx-auto px-6 py-8 border-t text-center text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 relative ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <p>&copy; {new Date().getFullYear()} FinSight AI. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/login" className="hover:text-[#00DF81] transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-[#00DF81] transition-colors">Register</Link>
        </div>
      </footer>

    </div>
  );
}