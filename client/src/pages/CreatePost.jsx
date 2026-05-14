// frontend/src/pages/CreatePost.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/posts', { title, author, content });
      navigate('/'); // Redirect to home page after publishing
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' };

  return (
    <div>
      <h1>Create a New Post</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input 
          type="text" 
          placeholder="Post Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" 
          placeholder="Author Name" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <textarea 
          placeholder="Write your content here..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          rows="6"
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Publish Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;