// src/components/tabs/ABTest.jsx
import React, { useState, useEffect } from 'react';
import { TestTube } from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Slider from '../ui/Slider';
import { platforms, models } from '../../constants/data';
import { generateABTestContent, generateMetrics } from '../../services/contentService'; // Import generateMetrics
import { getAllAudienceProfiles } from '../../services/audienceService';

const ABTest = () => {
  const [testDescription, setTestDescription] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedAudienceProfileId, setSelectedAudienceProfileId] = useState('');
  const [audienceProfiles, setAudienceProfiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState(0.7);
  const [isCreating, setIsCreating] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [generatedMetrics, setGeneratedMetrics] = useState([]); // Changed to an array for multiple metrics
  const [error, setError] = useState(null);

  // Fetch audience profiles when the component mounts
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profiles = await getAllAudienceProfiles();
        setAudienceProfiles(profiles);
        if (profiles.length > 0) {
          setSelectedAudienceProfileId(String(profiles[0].id));
          console.log("Default Audience Profile ID set for A/B Test:", String(profiles[0].id));
        } else {
          setSelectedAudienceProfileId('');
          console.log("No Audience Profiles found for A/B Test, setting ID to empty string.");
        }
      } catch (err) {
        console.error('Failed to fetch audience profiles for A/B Test:', err);
        setError('Failed to load audience profiles for A/B Test. Please try again.');
        setSelectedAudienceProfileId('');
        console.log("Error fetching Audience Profiles for A/B Test, setting ID to empty string.");
      }
    };
    fetchProfiles();
  }, []);

  const handleCreateTest = async () => {
    if (!testDescription.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel) {
      setError('Please fill in all required fields: Test Description, Platform, Audience, and AI Model.');
      return;
    }

    setIsCreating(true);
    setError(null);
    setTestResults([]);
    setGeneratedMetrics([]); // Clear previous metrics

    try {
      const payload = {
        prompt: testDescription,
        targetPlatform: selectedPlatform,
        audienceProfileId: parseInt(selectedAudienceProfileId),
        model: selectedModel,
        temperature: parseFloat(selectedTemperature),
        userId: 1,
      };

      console.log('Sending A/B Test payload:', payload);
      const abTestResponse = await generateABTestContent(payload);
      console.log('Received A/B Test response:', abTestResponse);

      if (abTestResponse && abTestResponse.generatedContents && Array.isArray(abTestResponse.generatedContents) && abTestResponse.generatedContents.length >= 2) {
        setTestResults(abTestResponse.generatedContents);

        // --- Generate metrics for each variant ---
        const metricsPromises = abTestResponse.generatedContents.map(async (variant, index) => {
          console.log(`Sending metrics generation payload for Variant ${index + 1}...`);
          const metricsPayload = {
            reviewContent: variant.content,
            reviewPlatform: selectedPlatform,
          };
          try {
            const metricsResponse = await generateMetrics(metricsPayload);
            console.log(`Received metrics response for Variant ${index + 1}:`, metricsResponse);
            return metricsResponse;
          } catch (metricsError) {
            console.error(`Failed to generate metrics for Variant ${index + 1}:`, metricsError);
            return null; // Return null or an error object if metrics generation fails for a variant
          }
        });

        const allMetrics = await Promise.all(metricsPromises);
        setGeneratedMetrics(allMetrics.filter(m => m !== null)); // Store only successful metrics

      } else {
        setError('A/B Test content generated, but response format was unexpected or less than 2 variants. Check console for details.');
        console.warn('Unexpected A/B Test LLM response format:', abTestResponse);
        setIsCreating(false);
        return;
      }

    } catch (err) {
      console.error('Failed to create A/B Test content or metrics:', err);
      setError(`Failed to create A/B Test content or metrics: ${err.message || 'An unknown error occurred.'}`);
      setTestResults([]);
      setGeneratedMetrics([]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDescriptionChange = (e) => setTestDescription(e.target.value);
  const handlePlatformChange = (e) => setSelectedPlatform(e.target.value);
  const handleAudienceChange = (e) => setSelectedAudienceProfileId(e.target.value);
  const handleModelChange = (e) => setSelectedModel(e.target.value);
  const handleTemperatureChange = (e) => setSelectedTemperature(parseFloat(e.target.value));

  const platformOptions = platforms.map(p => ({ value: p.value, label: p.label }));
  const audienceOptions = audienceProfiles.map(profile => ({
    value: String(profile.id),
    label: profile.profileName || `${profile.ageGroup} | ${profile.personaType} | ${profile.tone}`
  }));
  const modelOptions = models.map(m => ({ value: m.value, label: m.label }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">A/B Test Setup</h3>

        <div className="space-y-4">
          <Textarea
            label="Test Description"
            value={testDescription}
            onChange={handleDescriptionChange}
            placeholder="Describe what you want to A/B test (e.g., 'Two variants of a social media ad for new product launch')..."
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Platform"
              value={selectedPlatform}
              onChange={handlePlatformChange}
              options={platformOptions}
              placeholder="Select platform"
            />

            <Select
              label="Audience Profile"
              value={selectedAudienceProfileId}
              onChange={handleAudienceChange}
              options={audienceOptions}
              placeholder={audienceProfiles.length === 0 && !error ? "Loading profiles..." : "Select audience"}
              disabled={audienceProfiles.length === 0}
            />

            <Select
              label="AI Model"
              value={selectedModel}
              onChange={handleModelChange}
              options={modelOptions}
              placeholder="Select model"
            />

            <Slider
              label="Temperature"
              value={selectedTemperature}
              onChange={handleTemperatureChange}
              min={0.0}
              max={1.5}
              step={0.1}
              tooltip="Controls the randomness of the output. Lower values mean more predictable results, higher values mean more creative results."
            />
          </div>

          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded-md text-sm">
              Error: {error}
            </div>
          )}

          <Button
            onClick={handleCreateTest}
            variant="purple"
            icon={TestTube}
            disabled={isCreating || !testDescription.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel}
            className="w-full"
          >
            {isCreating ? 'Creating Test...' : 'Create A/B Test'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Test Results</h4>
        <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] border border-gray-700">
          {isCreating ? (
            <p className="text-gray-400 text-center py-8">Creating A/B test content and analyzing metrics...</p>
          ) : testResults.length > 0 ? (
            <div className="space-y-6"> {/* Increased space between variants */}
              {testResults.map((result, index) => (
                <div key={result.id || index} className="border border-gray-700 rounded-md p-4"> {/* Increased padding */}
                  <h5 className="text-lg font-semibold text-white mb-3">Variant {index + 1}</h5> {/* Larger heading */}
                  <p className="text-white whitespace-pre-wrap mb-4">{result.content}</p> {/* Added margin-bottom */}

                  {generatedMetrics[index] && ( // Conditionally render metrics for this variant
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h6 className="text-md font-semibold text-white mb-3">Metrics for Variant {index + 1}</h6>
                      <Slider
                        label={`Readability Score: ${generatedMetrics[index].readabilityScore}`}
                        value={generatedMetrics[index].readabilityScore}
                        min={0}
                        max={10}
                        step={0.1}
                        readOnly={true}
                        colorClass="bg-blue-600"
                      />
                      <Slider
                        label={`Clarity Score: ${generatedMetrics[index].clarityScore}`}
                        value={generatedMetrics[index].clarityScore}
                        min={0}
                        max={10}
                        step={0.1}
                        readOnly={true}
                        colorClass="bg-blue-600"
                      />
                      <Slider
                        label={`Platform Optimization: ${generatedMetrics[index].platformOptimization}%`}
                        value={generatedMetrics[index].platformOptimization}
                        min={0}
                        max={100}
                        step={1}
                        readOnly={true}
                        colorClass="bg-blue-600"
                      />
                      <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-300">
                          Engagement Prediction:
                        </label>
                        <p className="text-white text-lg font-bold">
                          {generatedMetrics[index].engagementPrediction}
                        </p>
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-300">
                          Optimization Tips:
                        </label>
                        <p className="text-green-400 whitespace-pre-wrap">
                          {generatedMetrics[index].optimizationTips}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              A/B test results will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABTest;
