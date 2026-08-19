import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Wallet, FileText, Settings, Trash2, Edit2, Bell, User, LogOut } from 'lucide-react';
import { getDocuments, deleteDocument, updateDocument } from '../api/api';

export default function Documents() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // NEW: Rename Function
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

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-finDark text-gray-900 dark:text-gray-100 transition-colors">
      
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
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <Wallet size={20} /> Accounts
          </a>
          <Link to="/documents" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-finGreen rounded-xl font-medium border-l-4 border-finGreen">
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
          <h2 className="text-xl font-semibold hidden sm:block">Document Management</h2>
          <div className="flex items-center gap-6 ml-auto">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-1">Your Files</h3>
            <p className="text-gray-500 dark:text-gray-400">View and manage your uploaded financial documents.</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Date Uploaded</th>
                  <th className="px-6 py-4 font-medium">File Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <FileText size={18} className="text-gray-400" />
                        {doc.fileName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          doc.status === 'Analyzed' ? 'bg-green-100 text-finGreen dark:bg-green-900/30' : 
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      {/* NEW: Edit and Delete buttons next to each other */}
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleRename(doc._id, doc.fileName)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Rename File"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc._id)}
                          disabled={isDeleting}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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