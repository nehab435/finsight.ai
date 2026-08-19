import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings, Upload, LogOut, Bell, User, MessageSquare, Send } from 'lucide-react';
import { uploadDocument, getDocuments, sendChatMessage } from '../api/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👋 Hello! Ask me anything about your uploaded financial documents.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await uploadDocument(formData);
      await fetchDocuments(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setIsSending(true);

    try {
      const { data } = await sendChatMessage(userText);
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setIsSending(false);
    }
  };

  // Dynamically calculate total assets from analyzed documents
  const totalAssetsSum = documents
    .filter(doc => doc.status === 'Analyzed')
    .reduce((acc, doc) => acc + (doc.totalAssets || 0), 0);

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
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl font-medium border-l-4 border-finGreen">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <Wallet size={20} /> Accounts
          </a>
          <Link to="/documents" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <FileText size={20} /> Documents
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <Settings size={20} /> Settings
          </a>
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold hidden sm:block">Dashboard</h2>
          
          <div className="flex items-center gap-6 ml-auto">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
            </button>
            
            <button className="text-gray-500 hover:text-finGreen transition-colors"><Bell size={20} /></button>
            <div className="flex items-center gap-2 font-medium cursor-pointer">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><User size={20} /></div>
              <span>My Profile</span>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-1">Welcome back!</h3>
              <p className="text-gray-500 dark:text-gray-400">Here is your financial snapshot.</p>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className={`hidden sm:flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/30 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-finGreen hover:bg-green-600'}`}
            >
              <Upload size={18} /> {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-finGreen text-white rounded-2xl p-6 shadow-xl shadow-green-500/20 flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="relative z-15">
                <p className="text-green-100 font-medium mb-1">Total Assets</p>
                <h4 className="text-4xl font-bold">${totalAssetsSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="relative z-10 text-sm text-green-100">
                Calculated from analyzed documents
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/10 rounded-t-full transform translate-y-12 scale-150"></div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Documents Uploaded</p>
                  <h4 className="text-3xl font-bold">{documents.length}</h4>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl">
                  <FileText size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* AI SUMMARY CARD */}
          {documents.length > 0 && documents[0].summary && (
            <div className="bg-white dark:bg-gray-900 border border-green-500/30 rounded-2xl p-6 shadow-sm mb-8">
              <div className="flex items-center gap-2 text-finGreen font-semibold mb-2">
                <FileText size={18} />
                Latest Document AI Insights
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {documents[0].summary}
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-semibold text-lg">Recent Activity</h4>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Transaction</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No documents uploaded yet. Click "Upload Document" to get started!
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc._id}>
                      <td className="px-6 py-4">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">{doc.fileName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          doc.status === 'Analyzed' ? 'bg-green-100 text-finGreen dark:bg-green-900/30' : 
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* FLOATING CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            className="bg-finGreen text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-transform hover:scale-105 flex items-center gap-2 font-medium"
          >
            <MessageSquare size={22} /> Ask AI Assistant
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[420px] overflow-hidden">
            <div className="bg-finGreen text-white px-5 py-3 font-medium flex items-center justify-between">
              <span className="flex items-center gap-2"><MessageSquare size={18} /> FinSight AI Assistant</span>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200 font-bold text-lg">×</button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-xl ${
                    m.sender === 'user' 
                      ? 'bg-finGreen text-white rounded-br-none' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-4 py-2 rounded-xl text-xs animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 bg-gray-50 dark:bg-gray-900">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your finances..." 
                className="flex-1 border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-finGreen" 
              />
              <button type="submit" className="bg-finGreen text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}