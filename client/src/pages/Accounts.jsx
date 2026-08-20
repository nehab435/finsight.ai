import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, FileText, Settings, LogOut, Sun, Moon, Plus, Trash2, Building2, Bell, Mail, ShieldCheck, User, Calculator } from 'lucide-react';
import { getAccounts, addAccount, deleteAccount, getUserProfile, getDocuments } from '../api/api';

export default function AccountsPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [accounts, setAccounts] = useState([]);
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [balance, setBalance] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Real User & Notification States
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchAccounts();
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

  const fetchAccounts = async () => {
    try {
      const { data } = await getAccounts();
      setAccounts(data || []);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
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

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!bankName || !balance) return;

    try {
      await addAccount({
        bankName,
        accountType,
        accountNumberMasked: accountNumberMasked || '•••• ' + Math.floor(1000 + Math.random() * 9000),
        balance: parseFloat(balance)
      });
      setBankName('');
      setAccountNumberMasked('');
      setBalance('');
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      alert("Failed to add account");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this account?")) return;
    try {
      await deleteAccount(id);
      setAccounts(accounts.filter(acc => acc._id !== id));
    } catch (err) {
      alert("Failed to remove account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const totalAccountBalance = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

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
          <Link to="/accounts" className="flex items-center gap-3 px-4 py-3 bg-[#00DF81]/10 text-[#00DF81] rounded-xl font-medium border-l-4 border-[#00DF81]">
            <Wallet size={20} /> Accounts
          </Link>
          <Link to="/documents" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <FileText size={20} /> Documents
          </Link>
          <Link to="/savings-advisor" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Calculator size={20} /> Savings Advisor
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className={`h-20 border-b flex items-center justify-between px-8 relative z-30 transition-colors duration-300 ${isDarkMode ? 'bg-[#060E1D]/50 backdrop-blur-md border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className="text-xl font-semibold hidden sm:block">Bank Accounts & Portfolios</h2>
          
          <div className="flex items-center gap-6 ml-auto relative">
            <button onClick={toggleTheme} className={`p-2.5 border rounded-full transition-all shadow-sm ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className={`transition-colors relative p-2.5 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
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
                      <Settings size={16} className="text-gray-400" /> Account Settings
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

        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-1">Your Accounts</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Track your bank accounts and manual balances.</p>
            </div>
            
            <button 
              onClick={() => setShowModal(true)}
              className="bg-[#00DF81] hover:bg-[#00B86B] text-black px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-[#00DF81]/20 flex items-center gap-2 cursor-pointer text-sm"
            >
              <Plus size={18} /> Add Account
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#00DF81] to-emerald-600 text-black rounded-3xl p-6 shadow-xl mb-8 flex justify-between items-center">
            <div>
              <p className="text-black/70 font-semibold text-sm mb-1">Total Account Balance</p>
              <h4 className="text-4xl font-extrabold">${totalAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
            </div>
            <Building2 size={48} className="text-black/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.length === 0 ? (
              <p className="text-gray-400 col-span-3 text-center py-12">No accounts added yet. Click "Add Account" to get started!</p>
            ) : (
              accounts.map((acc) => (
                <div key={acc._id} className={`border p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#00DF81]/10 text-[#00DF81]' : 'bg-green-50 text-[#00B86B]'}`}>
                        <Wallet size={24} />
                      </span>
                      <span className="px-3 py-1 text-xs font-medium bg-[#00DF81]/10 text-[#00DF81] rounded-full">
                        {acc.accountType}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{acc.bankName}</h4>
                    <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Account: {acc.accountNumberMasked}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-500/10">
                    <span className="text-xl font-extrabold text-[#00DF81]">
                      ${Number(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <button 
                      onClick={() => handleDelete(acc._id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MANUAL ADD ACCOUNT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-3xl p-6 w-full max-w-md shadow-2xl border ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <h3 className="text-xl font-bold mb-4">Add Bank Account</h3>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Bank / Institution Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chase, HDFC, Zerodha" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Account Type</label>
                  <select 
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-[#060E1D] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Investment">Investment</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Account Number (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. •••• 4092" 
                    value={accountNumberMasked}
                    onChange={(e) => setAccountNumberMasked(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Current Balance ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 5400.00" 
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#00DF81]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00B86B]'}`}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm cursor-pointer ${isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#00DF81] text-black px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#00B86B] transition-colors cursor-pointer"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}