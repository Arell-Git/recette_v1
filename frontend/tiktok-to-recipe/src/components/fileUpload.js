import React, { useState } from 'react';
import './UrlSubmit.css'; // External CSS for styling

const UrlSubmit = () => {
  const [url, setUrl] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setRecipe('');
    if (!url.trim()) {
      setError('Please enter a valid URL!');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/process-tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tiktokUrl: url }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process the URL');
      }
  
      setRecipe(data.recipe || '');
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="url-submit-container">
      <h1 className="title">TikTok to Recipe Transformer</h1>
      <form onSubmit={handleSubmit} className="url-form">
        <input
          type="text"
          placeholder="Enter TikTok URL"
          value={url}
          onChange={handleUrlChange}
          className="url-input"
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {recipe && (
        <div className="recipe-display">
          <h2>Recipe:</h2>
          <p className="formatted-recipe">{recipe}</p>
        </div>
      )}

    </div>
  );
};

export default UrlSubmit;
