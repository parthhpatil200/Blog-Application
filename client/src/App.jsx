import { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure you have a .env file in your frontend folder with: VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://13.127.213.37:5000/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  
  // Modal state: null | 'login' | 'register'
  const [authModal, setAuthModal] = useState(null); 
  const [editingPostId, setEditingPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) setUser(JSON.parse(savedUser));
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authModal === 'login' ? '/login' : '/register';
    try {
      const res = await axios.post(`${API_URL}/auth${endpoint}`, authForm);
      if (authModal === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify({ username: res.data.username, id: res.data.userId }));
        setUser({ username: res.data.username, id: res.data.userId });
        setAuthModal(null); // Close modal on success
      } else {
        alert("Registered successfully! Please log in.");
        setAuthModal('login'); // Switch to login box
      }
      setAuthForm({ username: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const handlePostChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPostId) {
        await axios.put(`${API_URL}/posts/${editingPostId}`, formData, getAuthHeaders());
        setEditingPostId(null);
      } else {
        await axios.post(`${API_URL}/posts`, formData, getAuthHeaders());
      }
      setFormData({ title: '', content: '' });
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving post');
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setFormData({ title: post.title, content: post.content });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/posts/${id}`, getAuthHeaders());
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting post');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-16 relative">
      
      {/* --- AUTHENTICATION MODAL --- */}
      {authModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative">
            
            <button 
              onClick={() => { setAuthModal(null); setAuthForm({ username: '', password: '' }); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              {authModal === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input type="text" name="username" value={authForm.username} onChange={handleAuthChange} required 
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-2.5 text-sm transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} required 
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-2.5 text-sm transition-all outline-none" />
              </div>
              
              <button type="submit" className="w-full mt-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all">
                {authModal === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {authModal === 'login' ? (
                <p>Don't have an account? <button onClick={() => setAuthModal('register')} className="text-indigo-600 font-bold hover:underline">Sign up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setAuthModal('login')} className="text-indigo-600 font-bold hover:underline">Log in</button></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN UI --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Minimal<span className="text-indigo-600">Blog.</span>
        </h1>
        
        {user ? (
          <div className="flex items-center gap-5">
            <span className="text-slate-600 font-medium">Hello, <span className="text-indigo-600 font-bold">{user.username}</span></span>
            <button onClick={logout} className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors">
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => setAuthModal('login')} className="px-5 py-2 text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">
              Log in
            </button>
            <button onClick={() => setAuthModal('register')} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all">
              Sign up
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        {/* Editor Section */}
        {user && (
          <div className="mb-16 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
            <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100">
              <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                {editingPostId ? '✏️ Edit Draft' : '✍️ Write a new story'}
              </h2>
            </div>
            <div className="p-8">
              <form onSubmit={handlePostSubmit} className="flex flex-col gap-6">
                <input type="text" name="title" placeholder="Give it a brilliant title..." value={formData.title} onChange={handlePostChange} required 
                  className="w-full text-3xl font-black text-slate-900 placeholder-slate-300 border-none focus:ring-0 px-0 py-2 outline-none" />
                <div className="h-[1px] w-full bg-slate-100"></div>
                <textarea name="content" placeholder="Tell your story..." value={formData.content} onChange={handlePostChange} required rows="5" 
                  className="w-full text-lg text-slate-700 placeholder-slate-400 border-none focus:ring-0 px-0 py-2 outline-none resize-none" />
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5">
                    {editingPostId ? 'Save Changes' : 'Publish Story'}
                  </button>
                  {editingPostId && (
                    <button type="button" onClick={() => { setEditingPostId(null); setFormData({ title: '', content: '' }); }} 
                      className="px-8 py-3 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Feed Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recent Stories</h2>
        </div>

        {posts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-lg text-slate-500 font-medium">It's quiet here. Start writing.</p>
          </div>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div key={post._id} className="group bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap line-clamp-4">{post.content}</p>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                      {post.author.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-700">{post.author}</span>
                  </div>
                  <span className="text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {user && user.id === post.userId && (
                  <div className="flex gap-3 w-full mt-2">
                    <button onClick={() => handleEdit(post)} className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-semibold text-sm transition-colors border border-slate-200 hover:border-indigo-200">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(post._id)} className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors border border-slate-200 hover:border-red-200">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;