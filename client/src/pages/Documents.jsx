import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings, Trash2, Edit2, Bell, User, LogOut, Mail, ShieldCheck, Upload, Loader2, Calculator } from 'lucide-react';
import { getDocuments, deleteDocument, updateDocument, getUserProfile, uploadDocument } from '../api/api';

export default function Documents() {
  const navigate = useNavigate();
  
  // Global theme synchronization
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [documents, setDocuments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const { data } = await getDocuments();
      setDocuments(data || []);
      const realNotifs = (data || []).map(doc => ({
        id: doc._id,
        title: `Document ${doc.status}`,
        desc: `${doc.fileName} uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`
      }));
      setNotifications(realNotifs);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadDocument(formData);
      setFile(null);
      fetchDocuments();
      alert("Document uploaded and analyzed successfully!");
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(id);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (error) {
      alert("Error deleting document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRename = async (id, currentName) => {
    const newName = window.prompt("Enter new file name (including extension like .pdf):", currentName);
    if (!newName || newName === currentName) return; 

    try {
      const { data } = await updateDocument(id, { fileName: newName });
      setDocuments(documents.map(doc => doc._id === id ? data : doc));
    } catch (error) {
      alert("Error renaming document");
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
          <Link to="/documents" className="flex items-center gap-3 px-4 py-3 bg-[#00DF81]/10 text-[#00DF81] rounded-xl font-medium border-l-4 border-[#00DF81]">
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
      <main className="flex-1 flex flex-1 flex-col overflow-hidden relative">
        
        <header className={`h-20 border-b flex items-center justify-between px-8 relative z-30 transition-colors duration-300 ${isDarkMode ? 'bg-[#060E1D]/50 backdrop-blur-md border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className="text-xl font-semibold hidden sm:block">Document Management</h2>
          
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
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="p-8 overflow-y-auto space-y-8 flex-1">
          <div>
            <h3 className="text-2xl font-bold mb-1">Document Management</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Upload financial statements and view your stored files.</p>
          </div>

          {/* UPLOAD BOX */}
          <div className={`border rounded-3xl p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Upload size={20} className="text-[#00DF81]" /> Upload New Financial Document
            </h4>
            
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className={`w-full sm:w-auto flex-1 border rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00DF81]/10 file:text-[#00DF81] hover:file:bg-[#00DF81]/20 cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                required
              />
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full sm:w-auto bg-[#00DF81] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00B86B] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00DF81]/20 cursor-pointer"
              >
                {uploading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Upload size={18} /> Upload & Analyze</>}
              </button>
            </form>
          </div>

          {/* FILES TABLE */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <h4 className="font-bold text-lg">Your Files</h4>
            </div>
            <table className="w-full text-left">
              <thead className={`text-sm ${isDarkMode ? 'bg-white/5 text-gray-400 border-b border-white/10' : 'bg-slate-50 text-slate-500 border-b border-slate-100'}`}>
                <tr>
                  <th className="px-6 py-4 font-medium">Date Uploaded</th>
                  <th className="px-6 py-4 font-medium">File Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/10 text-gray-300' : 'divide-slate-100 text-slate-700'}`}>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No documents found. Upload your first document above.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc._id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <FileText size={18} className="text-gray-400" />
                        {doc.fileName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          doc.status === 'Analyzed' ? 'bg-[#00DF81]/10 text-[#00DF81]' : 
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleRename(doc._id, doc.fileName)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Rename File"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc._id)}
                          disabled={isDeleting}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}