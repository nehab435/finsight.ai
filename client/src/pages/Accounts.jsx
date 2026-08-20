import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, FileText, Settings, LogOut, Sun, Moon, Plus, Trash2, Building2, Bell, Mail, ShieldCheck, User, Calculator } from 'lucide-react';
import { getAccounts, addAccount, deleteAccount, getUserProfile, getDocuments } from '../api/api';

export default function AccountsPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [accounts, setAccounts] = useState([]);
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [balance, setBalance] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Real User & Notification States (No Hardcoding)
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchAccounts();
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

  const fetchAccounts = async () => {
    try {
      const { data } = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
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

  const totalAccountBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

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
          <Link to="/accounts" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl font-medium border-l-4 border-finGreen">
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
        
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 relative z-30">
          <h2 className="text-xl font-semibold hidden sm:block">Bank Accounts & Portfolios</h2>
          
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

        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-1">Your Accounts</h3>
              <p className="text-gray-500 dark:text-gray-400">Track your bank accounts and manual balances.</p>
            </div>
            
            <button 
              onClick={() => setShowModal(true)}
              className="bg-finGreen hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/30 flex items-center gap-2"
            >
              <Plus size={18} /> Add Account
            </button>
          </div>

          <div className="bg-finGreen text-white rounded-2xl p-6 shadow-xl mb-8 flex justify-between items-center">
            <div>
              <p className="text-green-100 font-medium mb-1">Total Account Balance</p>
              <h4 className="text-4xl font-bold">${totalAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
            </div>
            <Building2 size={48} className="text-green-200 opacity-80" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.length === 0 ? (
              <p className="text-gray-500 col-span-3 text-center py-12">No accounts added yet. Click "Add Account" to get started!</p>
            ) : (
              accounts.map((acc) => (
                <div key={acc._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-3 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl">
                        <Wallet size={24} />
                      </span>
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">
                        {acc.accountType}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{acc.bankName}</h4>
                    <p className="text-xs text-gray-400 mb-4">Account: {acc.accountNumberMasked}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-lg font-bold text-finGreen">
                      ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <button 
                      onClick={() => handleDelete(acc._id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold mb-4">Add Bank Account</h3>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bank / Institution Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chase, HDFC, Zerodha" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Type</label>
                  <select 
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                    <option value="Investment">Investment</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. •••• 4092" 
                    value={accountNumberMasked}
                    onChange={(e) => setAccountNumberMasked(e.target.value)}
                    className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Balance ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 5400.00" 
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    required
                    className="w-full border dark:bg-gray-800 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finGreen"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-finGreen text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
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