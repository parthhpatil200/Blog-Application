// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`);
      setPosts(posts.filter(post => post._id !== id)); // Remove from UI
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div>
      <h1>Latest Posts</h1>
      {posts.length === 0 ? <p>No posts yet.</p> : null}
      
      {posts.map((post) => (
        <div key={post._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
          <h2 style={{ marginTop: 0 }}>{post.title}</h2>
          <p style={{ color: '#555' }}>By: {post.author} | {new Date(post.createdAt).toLocaleDateString()}</p>
          <p>{post.content}</p>
          <button 
            onClick={() => handleDelete(post._id)}
            style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
          >
            Delete Post
          </button>
        </div>
      ))}
    </div>
  );
};

export default Home;