import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.png';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Navigation from './Navigation/Navigation';
import About from './About';
import './index';

const Home = () => {
  return <div></div>;  
};

const FAQ = () => {
  return <div></div>;
};

const App = () => {
  const [message, setMessage] = useState('');
  const [completion, setCompletion] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [place, setPlace] = useState('');
  const [showMessageAlert, setShowMessageAlert] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGenerateCompletion = async () => {
    try {
      setLoading(true)
      if (!message) {
        setShowMessageAlert(true);
        setLoading(false)
        return;
      }
      const response = await fetch('http://localhost:3000/generate-loci', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, place }),
      });
  
      if (!response.ok) {
        throw new Error('Error generating completion');
      }
  
      const result = await response.json();
      setCompletion(result.completion);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); 
    }
  };

  const handleGenerateImage = async () => {
    try {
      setLoading(true);
      if (!completion) {
        console.log('No completion available to generate an image.');
        setLoading(false);
        return;
      }
      const response = await fetch('http://localhost:3000/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: completion }),
      });
  
      if (!response.ok) {
        throw new Error('Error generating image');
      }
  
      const result = await response.json();
      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      } else {
        console.log('Invalid or empty image URL in response');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGenerateCompletion();
    }
  };

  return (
    <div className={`container ${isVisible ? 'active' : ''}`}>
      <img src={logo} alt="AI Logo" className="logo" />
      <h1>AI Of Loci</h1>

      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>

      <div className='container-memorize'>
        <input required 
          type="text"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what do you want to memorize"
        />
        {showMessageAlert && (
          <div className='alert-message'>Please enter what you want to memorize!</div>
        )}
      </div>
      
      <div className='container-place'>
        <label htmlFor="place" className="place-label">
          Enter A Place: 
        </label>
        <input
          type="text"
          id="place"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="E.g. Home, Kitchen, etc."
          onKeyDown={handleKeyDown}
          className='place-input'
        />
      </div>
      
      <div className='placeWarning'>
        <p>Place will be selected randomly if you don't enter a place</p>
      </div>
      
      <div>
        <button onClick={handleGenerateCompletion}>Generate Loci</button>
      </div>
      {loading && <p>Generating...</p>}
      {completion && (
        <div className="result">
          <h2>Here you go:</h2>
          <p>{completion}</p>
          <div>
            <button onClick={handleGenerateImage}>Generate Image</button>
            {loading && <p>Generating...</p>}
            {generatedImage && (
              <div className="result">
                <h2>Generated Image:</h2>
                <img src={generatedImage} alt="Generated Image" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
