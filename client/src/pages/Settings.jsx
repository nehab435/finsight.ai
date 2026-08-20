import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings as SettingsIcon, Bell, User, LogOut, Lock, Shield, CheckCircle, Mail, ShieldCheck, Calculator } from 'lucide-react';
import { getUserProfile, getDocuments, updatePassword } from '../api/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiAnalysisAlerts, setAiAnalysisAlerts] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Real User & Notification States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchDocumentsForNotifs();
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

  const fetchUserData = async () => {
    try {
      const { data } = await getUserProfile();
      const userData = data?.user || data || {};
      setUserName(userData.name || userData.username || 'User');
      setUserEmail(userData.email || '');
      if (userData.profilePhoto) setProfilePhoto(userData.profilePhoto);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const fetchDocumentsForNotifs = async () => {
    try {
      const { data } = await getDocuments();
      const realNotifs = (data || []).map(doc => ({
        id: doc._id,
        title: `Document ${doc.status}`,
        desc: `${doc.fileName} uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`
      }));
      setNotifications(realNotifs);
    } catch (error) {
      console.error("Failed to fetch documents for notifications", error);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSuccessMessage('Preferences updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    try {
      await updatePassword({ currentPassword, newPassword });
      setSuccessMessage('Password updated successfully in database!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <div className={`flex h-screen font-sans transition-colors relative ${isDarkMode ? 'bg-[#040B16] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 border-r hidden md:flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#060E1D] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="p-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            finsight<span className="text-[#00DF81]">.ai</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/accounts" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Wallet size={20} /> Accounts
          </Link>
          <Link to="/documents" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <FileText size={20} /> Documents
          </Link>
          <Link to="/savings-advisor" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Calculator size={20} /> Savings Advisor
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 bg-[#00DF81]/10 text-[#00DF81] rounded-xl font-medium border-l-4 border-[#00DF81]">
            <SettingsIcon size={20} /> Settings
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
        <header className={`h-20 border-b flex items-center justify-between px-8 relative z-30 transition-colors duration-300 ${isDarkMode ? 'bg-[#060E1D]/50 backdrop-blur-md border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className="text-xl font-semibold hidden sm:block">Account Settings</h2>
          
          <div className="flex items-center gap-6 ml-auto relative">
            <button onClick={toggleTheme} className={`p-2.5 border rounded-full transition-all shadow-sm cursor-pointer ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className={`transition-colors relative p-2.5 rounded-full cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {notificationsOpen && (
                <div className={`absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl p-4 z-50 ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-500/20">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <span onClick={() => setNotifications([])} className="text-xs text-[#00DF81] font-medium cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-[#00DF81]/10' : 'bg-green-50'}`}>
                          <p className="font-semibold text-[#00DF81] mb-0.5">{n.title}</p>
                          <p className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>{n.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <div 
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                className={`flex items-center gap-2 font-medium cursor-pointer p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-[#00DF81]" />
                ) : (
                  <div className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-[#00DF81]' : 'bg-slate-100 text-[#00B86B]'}`}><User size={18} /></div>
                )}
                <span className="hidden sm:inline text-sm">{userName}</span>
              </div>

              {profileOpen && (
                <div className={`absolute right-0 mt-3 w-72 border rounded-2xl shadow-2xl p-5 z-50 ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <div className="flex flex-col items-center pb-4 border-b border-gray-500/20">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#00DF81] shadow-md mb-2" />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isDarkMode ? 'bg-white/10 text-[#00DF81]' : 'bg-slate-100 text-[#00B86B]'}`}><User size={32} /></div>
                    )}
                    <h4 className="font-bold text-base">{userName}</h4>
                    <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}><Mail size={12} /> {userEmail}</p>
                    <span className="mt-2 px-3 py-0.5 text-xs font-medium bg-[#00DF81]/10 text-[#00DF81] rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Account
                    </span>
                  </div>

                  <div className="pt-3 space-y-1 text-sm">
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                      <SettingsIcon size={16} className="text-gray-400" /> Account Settings
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="p-8 overflow-y-auto max-w-4xl flex-1">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-1">Preferences & Security</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Manage your profile notifications, security, and application settings.</p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-[#00DF81]/10 border border-[#00DF81]/20 text-[#00DF81] px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle size={18} /> {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            
            {/* NOTIFICATION PREFERENCES */}
            <div className={`border rounded-3xl p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell size={20} className="text-[#00DF81]" /> Notification Settings
              </h4>
              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Receive weekly summaries and account alerts via email.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications} 
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5 accent-[#00DF81] cursor-pointer" 
                  />
                </div>
                <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                  <div>
                    <p className="font-medium text-sm">AI Document Analysis Alerts</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Get notified when document parsing and tax extraction finish.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={aiAnalysisAlerts} 
                    onChange={(e) => setAiAnalysisAlerts(e.target.checked)}
                    className="w-5 h-5 accent-[#00DF81] cursor-pointer" 
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-[#00DF81] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00B86B] transition-colors cursor-pointer shadow-lg shadow-[#00DF81]/20">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>

            {/* SECURITY & PASSWORD CHANGE */}
            <div className={`border rounded-3xl p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#00DF81]" /> Security & Password
              </h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="bg-[#00DF81] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00B86B] transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00DF81]/20">
                    <Lock size={16} /> Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}