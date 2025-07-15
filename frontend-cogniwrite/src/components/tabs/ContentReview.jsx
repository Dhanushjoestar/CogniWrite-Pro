// src/components/tabs/ContentReview.jsx
import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Slider from '../ui/Slider'; // Import Slider
import { platforms } from '../../constants/data'; // Only platforms needed
import { generateMetrics } from '../../services/contentService'; // Import the service function

const ContentReview = () => {
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  // Removed selectedAudience and selectedModel states
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState(null); // Will store the full response object
  const [error, setError] = useState(null); // State to handle API errors

  const handleReview = async () => {
    // Basic validation
    if (!content.trim() || !selectedPlatform) {
      setError('Please provide content to review and select a platform.');
      return;
    }

    setIsReviewing(true);
    setError(null); // Clear previous errors
    setReviewResults(null); // Clear previous results

    try {
      const payload = {
        reviewContent: content,
        reviewPlatform: selectedPlatform,
      };

      console.log('Sending review payload:', payload);
      const response = await generateMetrics(payload); // Call the generateMetrics service
      console.log('Received review response:', response);

      // Assuming the backend returns an object with scores and tips
      if (response) {
        setReviewResults(response);
      } else {
        setError('Content review completed, but response format was unexpected. Check console for details.');
        console.warn('Unexpected review response format:', response);
      }

    } catch (err) {
      console.error('Failed to perform content review:', err);
      setError(`Failed to perform content review: ${err.message || 'An unknown error occurred.'}`);
      setReviewResults(null); // Clear any partial content on error
    } finally {
      setIsReviewing(false);
    }
  };

  const handleContentChange = (e) => setContent(e.target.value);
  const handlePlatformChange = (e) => setSelectedPlatform(e.target.value);
  // Removed handleAudienceChange and handleModelChange

  // Prepare options for the Platform Select component
  const platformOptions = platforms.map(p => ({ value: p.value, label: p.label }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Content Review</h3>

        <div className="space-y-4">
          <Textarea
            label="Content to Review"
            value={content}
            onChange={handleContentChange}
            placeholder="Paste your content here for review..."
            rows={5}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Adjusted grid */}
            <Select
              label="Platform"
              value={selectedPlatform}
              onChange={handlePlatformChange}
              options={platformOptions}
              placeholder="Select platform"
            />
            {/* Removed Audience Profile and AI Model Select components */}
          </div>

          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded-md text-sm">
              Error: {error}
            </div>
          )}

          <Button
            onClick={handleReview}
            variant="success"
            icon={FileCheck}
            disabled={!content.trim() || !selectedPlatform || isReviewing}
            className="w-full"
          >
            {isReviewing ? 'Reviewing...' : 'Review Content'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Review Results</h4>
        <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] border border-gray-700">
          {isReviewing ? (
            <p className="text-gray-400 text-center py-8">Reviewing content...</p>
          ) : reviewResults ? (
            <div className="space-y-4">
              <Slider
                label={`Readability Score: ${reviewResults.readabilityScore}`}
                value={reviewResults.readabilityScore}
                min={0}
                max={10}
                step={0.1}
                readOnly={true}
                colorClass="bg-blue-600" // Blue color for scores
              />
              <Slider
                label={`Clarity Score: ${reviewResults.clarityScore}`}
                value={reviewResults.clarityScore}
                min={0}
                max={10}
                step={0.1}
                readOnly={true}
                colorClass="bg-blue-600" // Blue color for scores
              />
              <Slider
                label={`Platform Optimization: ${reviewResults.platformOptimization}%`}
                value={reviewResults.platformOptimization}
                min={0}
                max={100}
                step={1}
                readOnly={true}
                colorClass="bg-blue-600" // Blue color for scores
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Engagement Prediction:
                </label>
                <p className="text-white text-lg font-bold">
                  {reviewResults.engagementPrediction}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Optimization Tips:
                </label>
                <p className="text-green-400 whitespace-pre-wrap">
                  {reviewResults.optimizationTips}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Content review results will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentReview;
