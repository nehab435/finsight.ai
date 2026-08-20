import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings, Bell, User, LogOut, ArrowUpRight, ShieldCheck, Mail, Send, Activity, MessageSquare, Calculator } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getUserProfile, getDocuments, getFinancialHealth, sendChatMessage, getChatHistory } from '../api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  // Dashboard Metrics
  const [totalAssets, setTotalAssets] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [latestInsights, setLatestInsights] = useState('No AI insights available yet. Upload a document to generate analysis.');
  
  // Financial Health Score State
  const [healthData, setHealthData] = useState({ score: 0, status: 'Not Rated', advice: 'Upload documents to view your financial health score.' });

  // Dropdown States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👋 Hello! Ask me anything about your uploaded financial documents or financial health.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    fetchChatHistory();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  // Robust safe parser for numbers returned as strings or nested objects from MongoDB
  const parseAmount = (val) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned) || 0;
  };

  const extractAmountFromDoc = (doc) => {
    const d = doc.extractedData || {};
    const nestedD = d.extractedData || {};
    
    // Check all possible schema keys at root and nested levels
    const rawVal = d.totalValue || nestedD.totalValue || 
                   d.grossIncome || nestedD.grossIncome || 
                   d.totalAssets || nestedD.totalAssets || 
                   d.totalAmount || nestedD.totalAmount || 
                   d.amount || nestedD.amount ||
                   doc.totalAssets || doc.totalAmount;

    const parsed = parseAmount(rawVal);
    if (parsed > 0) return parsed;

    // Fallback: extract from summary string if keys are missing
    const summaryStr = d.summary || nestedD.summary || d.analysis || nestedD.analysis || doc.summary || '';
    const matches = summaryStr.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)/g);
    if (matches && matches.length > 0) {
      const numbers = matches.map(m => parseAmount(m)).filter(n => n > 100);
      if (numbers.length > 0) {
        return Math.max(...numbers);
      }
    }
    return 0;
  };

  const fetchDashboardData = async () => {
    try {
      const userRes = await getUserProfile();
      const userData = userRes.data?.user || userRes.data || {};
      setUserName(userData.name || userData.username || 'User');
      setUserEmail(userData.email || '');
      if (userData.profilePhoto) setProfilePhoto(userData.profilePhoto);

      const docRes = await getDocuments();
      const docsList = docRes.data || [];
      setDocuments(docsList);

      const healthRes = await getFinancialHealth();
      if (healthRes && healthRes.data) {
        setHealthData(healthRes.data);
      }

      let assetSum = 0;
      const formattedChart = docsList.map(doc => {
        const amount = extractAmountFromDoc(doc);
        assetSum += amount;
        return {
          name: doc.fileName && doc.fileName.length > 15 ? doc.fileName.substring(0, 15) + '...' : (doc.fileName || 'Doc'),
          amount: amount
        };
      });

      setTotalAssets(assetSum);
      setChartData(formattedChart);

      if (docsList.length > 0) {
        const latestDoc = docsList[0];
        const d = latestDoc.extractedData || {};
        const nestedD = d.extractedData || {};
        const analysisText = 
          d.summary || 
          nestedD.summary || 
          d.analysis || 
          nestedD.analysis ||
          d.text || 
          latestDoc.summary || 
          '';

        if (analysisText) {
          setLatestInsights(analysisText);
        } else {
          setLatestInsights(`This document (${latestDoc.fileName}) was successfully analyzed by FinSight AI.`);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const { data } = await getChatHistory();
      if (data && data.length > 0) {
        const formatted = data.map(c => [
          { sender: 'user', text: c.message },
          { sender: 'ai', text: c.reply }
        ]).flat();
        setMessages(prev => [...prev, ...formatted]);
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const { data } = await sendChatMessage(userText);
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <div className={`flex h-screen font-sans transition-colors relative ${isDarkMode ? 'bg-[#040B16] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 border-r hidden md:flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#060E1D] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="p-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            finsight<span className="text-[#00DF81]">.ai</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#00DF81]/10 text-[#00DF81] rounded-xl font-medium border-l-4 border-[#00DF81]">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/accounts" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Wallet size={20} /> Accounts
          </Link>
          <Link to="/documents" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText size={20} /> Documents
          </Link>
          <Link to="/savings-advisor" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Calculator size={20} /> Savings Advisor
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className={`h-20 border-b flex items-center justify-between px-8 relative z-30 transition-colors duration-300 ${isDarkMode ? 'bg-[#060E1D]/50 backdrop-blur-md border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <h2 className="text-xl font-semibold hidden sm:block">Overview Dashboard</h2>
          
          <div className="flex items-center gap-6 ml-auto relative">
            <button onClick={toggleTheme} className={`p-2.5 border rounded-full transition-all shadow-sm cursor-pointer ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}>
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-700" />}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className={`transition-colors relative p-2.5 rounded-full cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={18} />
                {documents.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {notificationsOpen && (
                <div className={`absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl p-4 z-50 ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-500/20">
                    <h4 className="font-bold text-sm">Notifications</h4>
                  </div>
                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    {documents.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No new notifications</p>
                    ) : (
                      documents.map(d => (
                        <div key={d._id} className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-[#00DF81]/10' : 'bg-green-50'}`}>
                          <p className="font-semibold text-[#00DF81] mb-0.5">Document Parsed</p>
                          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{d.fileName} analyzed successfully.</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative">
              <div 
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                className={`flex items-center gap-2 font-medium cursor-pointer p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-[#00DF81]" />
                ) : (
                  <div className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-[#00DF81]' : 'bg-gray-100 text-[#00B86B]'}`}><User size={18} /></div>
                )}
                <span className="hidden sm:inline text-sm">{userName}</span>
              </div>

              {profileOpen && (
                <div className={`absolute right-0 mt-3 w-72 border rounded-2xl shadow-2xl p-5 z-50 ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <div className="flex flex-col items-center pb-4 border-b border-gray-500/20">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#00DF81] shadow-md mb-2" />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isDarkMode ? 'bg-white/10 text-[#00DF81]' : 'bg-gray-100 text-[#00B86B]'}`}><User size={32} /></div>
                    )}
                    <h4 className="font-bold text-base">{userName}</h4>
                    <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><Mail size={12} /> {userEmail}</p>
                    <span className="mt-2 px-3 py-0.5 text-xs font-medium bg-[#00DF81]/10 text-[#00DF81] rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Account
                    </span>
                  </div>

                  <div className="pt-3 space-y-1 text-sm">
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                      <Settings size={16} className="text-gray-400" /> Account Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold">Welcome back, {userName}!</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Here is your financial snapshot.</p>
            </div>
            <Link to="/documents" className="bg-[#00DF81] text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00c572] transition-colors shadow-lg shadow-[#00DF81]/20 flex items-center gap-2">
              Upload Document <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* METRICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-gradient-to-br from-[#00DF81] to-emerald-600 text-slate-900 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-emerald-950 text-xs font-bold uppercase tracking-wider">Total Assets</p>
                <h2 className="text-3xl font-extrabold mt-1">${totalAssets.toLocaleString()}</h2>
              </div>
              <p className="text-xs text-emerald-950 font-medium mt-6 bg-black/10 px-3 py-1.5 rounded-xl inline-block w-fit">Calculated from analyzed documents</p>
            </div>

            <div className={`border p-6 rounded-3xl shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Documents Uploaded</p>
                <h2 className="text-3xl font-extrabold mt-1">{documents.length}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#00DF81] font-medium bg-[#00DF81]/10 px-3 py-1.5 rounded-xl w-fit">
                <FileText size={14} /> Active Parsers Ready
              </div>
            </div>

            <div className={`border p-6 rounded-3xl shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Health Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-3xl font-extrabold">{healthData.score}/100</h2>
                  <span className="text-xs font-bold text-[#00DF81] bg-[#00DF81]/10 px-2 py-0.5 rounded-md">{healthData.status}</span>
                </div>
              </div>
              <p className={`text-xs mt-4 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{healthData.advice}</p>
            </div>

          </div>

          {/* ASSET BREAKDOWN CHART */}
          <div className={`border p-6 rounded-3xl shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h4 className="font-bold text-lg mb-4">Document Asset Breakdown</h4>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No asset data available. Upload a financial document to generate insights.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
                    <YAxis fontSize={12} stroke={isDarkMode ? "#9ca3af" : "#64748b"} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#060E1D' : '#fff', borderRadius: '12px', color: isDarkMode ? '#fff' : '#0f172a', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1' }} />
                    <Bar dataKey="amount" fill="#00DF81" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* LATEST DOCUMENT AI INSIGHTS CARD */}
          <div className={`border p-6 rounded-3xl shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <FileText size={20} className="text-[#00DF81]" /> Latest Document AI Insights
            </h4>
            <p className={`text-sm leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {latestInsights}
            </p>
          </div>

        </div>

        {/* FLOATING AI ASSISTANT CHATBOT */}
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            className="absolute bottom-6 right-6 bg-[#00DF81] text-slate-900 px-5 py-3 rounded-full shadow-2xl hover:bg-[#00c572] transition-all flex items-center gap-2 z-50 font-bold text-sm cursor-pointer"
          >
            <MessageSquare size={18} /> FinSight AI Assistant
          </button>
        ) : (
          <div className={`absolute bottom-6 right-6 w-80 sm:w-96 border rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden h-[450px] ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <div className="bg-[#00DF81] text-slate-900 p-4 flex justify-between items-center font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full animate-pulse"></div>
                <h4 className="text-sm">FinSight AI Assistant</h4>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-900 hover:bg-black/10 p-1 rounded-lg transition-colors cursor-pointer">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, index) => (
                <div key={index} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm ${
                    m.sender === 'user' 
                      ? 'bg-[#00DF81] text-slate-900 font-medium rounded-br-none' 
                      : isDarkMode ? 'bg-white/10 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <span>{m.text}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={`p-3 border-t flex items-center gap-2 ${isDarkMode ? 'bg-[#060E1D] border-white/10' : 'bg-white border-gray-200'}`}>
              <input 
                type="text" 
                placeholder="Ask about your finances..." 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className={`flex-1 border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none ${isDarkMode ? 'bg-white/5 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
              />
              <button type="submit" disabled={isSending} className="bg-[#00DF81] hover:bg-[#00c572] text-slate-900 p-2.5 rounded-xl transition-colors font-bold cursor-pointer">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}