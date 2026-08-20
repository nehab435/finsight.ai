import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings, Bell, User, LogOut, ArrowUpRight, ShieldCheck, Mail, Send, Activity, MessageSquare, Calculator } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getUserProfile, getDocuments, getFinancialHealth, sendChatMessage, getChatHistory } from '../api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
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

  const fetchDashboardData = async () => {
    try {
      const userRes = await getUserProfile();
      setUserName(userRes.data.name || 'User');
      setUserEmail(userRes.data.email || '');
      if (userRes.data.profilePhoto) setProfilePhoto(userRes.data.profilePhoto);

      const docRes = await getDocuments();
      console.log("RAW DOCUMENTS FROM API:", docRes.data);
      setDocuments(docRes.data);

      const healthRes = await getFinancialHealth();
      if (healthRes && healthRes.data) {
        setHealthData(healthRes.data);
      }

      let assetSum = 0;
      const formattedChart = docRes.data.map(doc => {
        const d = doc.extractedData || {};
        const nestedD = d.extractedData || {};
        
        // Comprehensive check across all possible nested backend object schemas
        const amount = Number(d.totalValue) || 
                       Number(nestedD.totalValue) || 
                       Number(d.grossIncome) || 
                       Number(nestedD.grossIncome) || 
                       Number(d.totalAssets) || 
                       Number(d.totalAmount) || 
                       Number(d.amount) || 
                       Number(doc.totalAssets) || 
                       Number(doc.totalAmount) || 0;

        assetSum += amount;
        return {
          name: doc.fileName && doc.fileName.length > 15 ? doc.fileName.substring(0, 15) + '...' : (doc.fileName || 'Doc'),
          amount: amount
        };
      });

      setTotalAssets(assetSum);
      setChartData(formattedChart);

      if (docRes.data.length > 0) {
        const latestDoc = docRes.data[0];
        const d = latestDoc.extractedData || {};
        const analysisText = 
          d.summary || 
          d.analysis || 
          d.text || 
          latestDoc.summary || 
          latestDoc.analysis || 
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
    <div className="flex h-screen bg-gray-50 dark:bg-finDark text-gray-900 dark:text-gray-100 transition-colors relative">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="text-finGreen">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FinSight</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl font-medium border-l-4 border-finGreen">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/accounts" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <Wallet size={20} /> Accounts
          </Link>
          <Link to="/documents" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <FileText size={20} /> Documents
          </Link>
          <Link to="/savings-advisor" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <Calculator size={20} /> Savings Advisor
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <Settings size={20} /> Settings
          </Link>
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 relative z-30">
          <h2 className="text-xl font-semibold hidden sm:block">Overview Dashboard</h2>
          
          <div className="flex items-center gap-6 ml-auto relative">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className="text-gray-500 hover:text-finGreen transition-colors relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell size={20} />
                {documents.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-sm">Notifications</h4>
                  </div>
                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    {documents.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No new notifications</p>
                    ) : (
                      documents.map(d => (
                        <div key={d._id} className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <p className="font-semibold text-finGreen mb-0.5">Document Parsed</p>
                          <p className="text-gray-500 dark:text-gray-400">{d.fileName} analyzed successfully.</p>
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
                className="flex items-center gap-2 font-medium cursor-pointer p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-finGreen" />
                ) : (
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><User size={20} /></div>
                )}
                <span className="hidden sm:inline text-sm">{userName}</span>
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-5 z-50">
                  <div className="flex flex-col items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-finGreen shadow-md mb-2" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2"><User size={32} /></div>
                    )}
                    <h4 className="font-bold text-base">{userName}</h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={12} /> {userEmail}</p>
                    <span className="mt-2 px-3 py-0.5 text-xs font-medium bg-green-100 text-finGreen dark:bg-green-900/30 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Account
                    </span>
                  </div>

                  <div className="pt-3 space-y-1 text-sm">
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Settings size={16} className="text-gray-400" /> Account Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
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
              <p className="text-gray-500 dark:text-gray-400 text-sm">Here is your financial snapshot.</p>
            </div>
            <Link to="/documents" className="bg-finGreen text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 flex items-center gap-2">
              Upload Document <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* METRICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-gradient-to-br from-finGreen to-green-600 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Assets</p>
                <h2 className="text-3xl font-extrabold mt-1">${totalAssets.toLocaleString()}</h2>
              </div>
              <p className="text-xs text-green-100 mt-6 bg-white/10 px-3 py-1.5 rounded-xl inline-block w-fit">Calculated from analyzed documents</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Documents Uploaded</p>
                <h2 className="text-3xl font-extrabold mt-1">{documents.length}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-finGreen font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl w-fit">
                <FileText size={14} /> Active Parsers Ready
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Health Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-3xl font-extrabold">{healthData.score}/100</h2>
                  <span className="text-xs font-bold text-finGreen bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">{healthData.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 truncate">{healthData.advice}</p>
            </div>

          </div>

          {/* ASSET BREAKDOWN CHART */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
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
                    <XAxis dataKey="name" fontSize={12} stroke="#888" />
                    <YAxis fontSize={12} stroke="#888" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderRadius: '12px', color: '#fff', border: 'none' }} />
                    <Bar dataKey="amount" fill="#00C853" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* LATEST DOCUMENT AI INSIGHTS CARD */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <FileText size={20} className="text-finGreen" /> Latest Document AI Insights
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {latestInsights}
            </p>
          </div>

        </div>

        {/* FLOATING AI ASSISTANT CHATBOT */}
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            className="absolute bottom-6 right-6 bg-finGreen text-white px-5 py-3 rounded-full shadow-2xl hover:bg-green-600 transition-all flex items-center gap-2 z-50 font-medium text-sm"
          >
            <MessageSquare size={18} /> FinSight AI Assistant
          </button>
        ) : (
          <div className="absolute bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden h-[450px]">
            <div className="bg-finGreen text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                <h4 className="font-bold text-sm">FinSight AI Assistant</h4>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:bg-black/10 p-1 rounded-lg transition-colors">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, index) => (
                <div key={index} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm ${
                    m.sender === 'user' 
                      ? 'bg-finGreen text-white rounded-br-none' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}>
                    <span>{m.text}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-900">
              <input 
                type="text" 
                placeholder="Ask about your finances..." 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none"
              />
              <button type="submit" disabled={isSending} className="bg-finGreen hover:bg-green-600 text-white p-2.5 rounded-xl transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}