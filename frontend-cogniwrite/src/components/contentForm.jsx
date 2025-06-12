// src/components/ContentForm.jsx
import React, { useState, useEffect } from 'react';
import { generateContent } from '../services/contentService';
import { getAllAudienceProfiles } from '../services/audienceService';

function ContentForm() {
  const [prompt, setPrompt] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('LinkedIn');
  const [selectedAudienceProfileId, setSelectedAudienceProfileId] = useState('');
  const [audienceProfiles, setAudienceProfiles] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch audience profiles when the component mounts
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profiles = await getAllAudienceProfiles();
        setAudienceProfiles(profiles);
        if (profiles.length > 0) {
          setSelectedAudienceProfileId(profiles[0].id); // Select the first profile by default
        }
      } catch (err) {
        console.error('Failed to fetch audience profiles:', err);
        setError('Failed to load audience profiles. Please try again.');
      }
    };
    fetchProfiles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setGeneratedContent('');
    setError(null);

    // Basic validation
    if (!prompt || !selectedAudienceProfileId || !targetPlatform) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        prompt,
        targetPlatform,
        audienceProfileId: selectedAudienceProfileId,
        // userId: 1, // Uncomment and replace with actual user ID if authentication is implemented
      };
      const response = await generateContent(payload);
      // The backend returns a ContentRequestDTO, which has a nested generatedContent
      if (response && response.generatedContent && response.generatedContent.content) {
        setGeneratedContent(response.generatedContent.content);
      } else {
        setError('Content generated, but response format was unexpected.');
        console.warn('Unexpected LLM response format:', response);
      }
    } catch (err) {
      setError(`Failed to generate content: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Generate Optimized Content</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="prompt" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content Idea / Prompt:</label>
          <textarea
            id="prompt"
            rows="6"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A blog post about the benefits of AI for small businesses"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="platform" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Target Platform:</label>
          <select
            id="platform"
            value={targetPlatform}
            onChange={(e) => setTargetPlatform(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          >
            <option value="LinkedIn">LinkedIn Post</option>
            <option value="Twitter">Twitter Thread</option>
            <option value="Blog Post">Blog Post</option>
            <option value="Email Marketing">Email Marketing</option>
            <option value="Facebook Ad">Facebook Ad</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="audience" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Audience Profile:</label>
          {audienceProfiles.length === 0 && !error ? (
            <p>Loading audience profiles...</p>
          ) : audienceProfiles.length === 0 && error ? (
            <p style={{ color: 'red' }}>Error loading profiles: {error}</p>
          ) : (
            <select
              id="audience"
              value={selectedAudienceProfileId}
              onChange={(e) => setSelectedAudienceProfileId(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            >
              {audienceProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.profileName || `${profile.ageGroup} | ${profile.personaType} | ${profile.tone}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || audienceProfiles.length === 0}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>Error: {error}</p>}

      {generatedContent && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <h3>Generated Content:</h3>
          <textarea
            value={generatedContent}
            readOnly
            rows="15"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
          />
        </div>
      )}
    </div>
  );
}

export default ContentForm;