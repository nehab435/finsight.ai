import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings, Bell, User, LogOut, Lock, Shield, CheckCircle, Mail, ShieldCheck, Calculator } from 'lucide-react';
import { getUserProfile, getDocuments, updatePassword } from '../api/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiAnalysisAlerts, setAiAnalysisAlerts] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Real User & Notification States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchDocumentsForNotifs();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data } = await getUserProfile();
      setUserName(data.name || data.username || 'User');
      setUserEmail(data.email || '');
      if (data.profilePhoto) setProfilePhoto(data.profilePhoto);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const fetchDocumentsForNotifs = async () => {
    try {
      const { data } = await getDocuments();
      const realNotifs = data.map(doc => ({
        id: doc._id,
        title: `Document ${doc.status}`,
        desc: `${doc.fileName} uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`
      }));
      setNotifications(realNotifs);
    } catch (error) {
      console.error("Failed to fetch documents for notifications", error);
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
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
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
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl font-medium border-l-4 border-finGreen">
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
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 relative z-30">
          <h2 className="text-xl font-semibold hidden sm:block">Account Settings</h2>
          
          <div className="flex items-center gap-6 ml-auto relative">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className="text-gray-500 hover:text-finGreen transition-colors relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <span onClick={() => setNotifications([])} className="text-xs text-finGreen font-medium cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <p className="font-semibold text-finGreen mb-0.5">{n.title}</p>
                          <p className="text-gray-500 dark:text-gray-400">{n.desc}</p>
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
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="p-8 overflow-y-auto max-w-4xl">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-1">Preferences & Security</h3>
            <p className="text-gray-500 dark:text-gray-400">Manage your profile notifications, security, and application settings.</p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-100 dark:bg-green-900/30 text-finGreen px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle size={18} /> {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            
            {/* NOTIFICATION PREFERENCES */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell size={20} className="text-finGreen" /> Notification Settings
              </h4>
              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-400">Receive weekly summaries and account alerts via email.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications} 
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5 accent-finGreen cursor-pointer" 
                  />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-sm">AI Document Analysis Alerts</p>
                    <p className="text-xs text-gray-400">Get notified when document parsing and tax extraction finish.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={aiAnalysisAlerts} 
                    onChange={(e) => setAiAnalysisAlerts(e.target.checked)}
                    className="w-5 h-5 accent-finGreen cursor-pointer" 
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-finGreen text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>

            {/* SECURITY & PASSWORD CHANGE */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield size={20} className="text-finGreen" /> Security & Password
              </h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="bg-finGreen text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2">
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