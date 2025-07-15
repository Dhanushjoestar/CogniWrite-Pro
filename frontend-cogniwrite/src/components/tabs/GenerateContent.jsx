// src/components/tabs/GenerateContent.jsx
import React, { useState, useEffect } from 'react'; // Corrected import statement
import { Zap } from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Slider from '../ui/Slider';
import { platforms, models } from '../../constants/data';
import { generateContent, generateMetrics } from '../../services/contentService';
import { getAllAudienceProfiles } from '../../services/audienceService';

// Accept prefilledData prop
const GenerateContent = ({ prefilledData }) => {
  const [prompt, setPrompt] = useState(prefilledData?.prompt || '');
  const [selectedPlatform, setSelectedPlatform] = useState(prefilledData?.platform || '');
  const [selectedAudienceProfileId, setSelectedAudienceProfileId] = useState(prefilledData?.audienceProfileId || '');
  const [audienceProfiles, setAudienceProfiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState(prefilledData?.model || '');
  const [selectedTemperature, setSelectedTemperature] = useState(prefilledData?.temperature || 0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(prefilledData?.generatedContent || '');
  const [generatedMetrics, setGeneratedMetrics] = useState(prefilledData?.generatedMetrics || null);
  const [error, setError] = useState(null);

  // Log current state on every render (for debugging)
  useEffect(() => {
    console.log("GenerateContent State Update:", {
      prompt,
      selectedPlatform,
      selectedAudienceProfileId,
      selectedModel,
      selectedTemperature,
      isGenerating,
      error,
      generatedContent: generatedContent ? generatedContent.substring(0, Math.min(generatedContent.length, 50)) + "..." : "N/A", // Truncate for log
      generatedMetrics
    });
  });

  // Fetch audience profiles when the component mounts
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profiles = await getAllAudienceProfiles();
        setAudienceProfiles(profiles);
        if (profiles.length > 0) {
          // If no prefilled audience, set the first profile's ID as default
          if (!prefilledData?.audienceProfileId) {
            setSelectedAudienceProfileId(String(profiles[0].id));
            console.log("Default Audience Profile ID set:", String(profiles[0].id));
          }
        } else {
          setSelectedAudienceProfileId('');
          console.log("No Audience Profiles found, setting ID to empty string.");
        }
      } catch (err) {
        console.error('Failed to fetch audience profiles:', err);
        setError('Failed to load audience profiles. Please try again.');
        setSelectedAudienceProfileId('');
        console.log("Error fetching Audience Profiles, setting ID to empty string.");
      }
    };
    fetchProfiles();
  }, [prefilledData]); // Re-run if prefilledData changes (e.g., history item click)

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel) {
      setError('Please fill in all required fields: Prompt, Platform, Audience, and AI Model.');
      console.log("Validation failed. Current values:", { prompt, selectedPlatform, selectedAudienceProfileId, selectedModel });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');
    setGeneratedMetrics(null);

    let contentToAnalyze = '';

    try {
      const payload = {
        prompt,
        targetPlatform: selectedPlatform,
        audienceProfileId: parseInt(selectedAudienceProfileId),
        model: selectedModel,
        temperature: parseFloat(selectedTemperature),
        userId: 1,
      };

      console.log('Sending content generation payload:', payload);
      const generationResponse = await generateContent(payload);
      console.log('Received generation response:', generationResponse);

      if (generationResponse && generationResponse.generatedContents && generationResponse.generatedContents.length > 0 && generationResponse.generatedContents[0].content) {
        contentToAnalyze = generationResponse.generatedContents[0].content;
        setGeneratedContent(contentToAnalyze);
      } else {
        setError('Content generated, but response format was unexpected. Check console for details.');
        console.warn('Unexpected LLM response format:', generationResponse);
        setIsGenerating(false);
        return;
      }

      console.log('Sending metrics generation payload...');
      const metricsPayload = {
        reviewContent: contentToAnalyze,
        reviewPlatform: selectedPlatform,
      };
      const metricsResponse = await generateMetrics(metricsPayload);
      console.log('Received metrics response:', metricsResponse);

      if (metricsResponse) {
        setGeneratedMetrics(metricsResponse);
      } else {
        setError('Metrics generation completed, but response format was unexpected. Check console for details.');
        console.warn('Unexpected metrics response format:', metricsResponse);
      }

    } catch (err) {
      console.error('Failed to generate content or metrics:', err);
      setError(`Failed to generate content or metrics: ${err.message || 'An unknown error occurred.'}`);
      setGeneratedContent('');
      setGeneratedMetrics(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptChange = (e) => setPrompt(e.target.value);
  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
    console.log("Platform changed to:", e.target.value);
  };
  const handleAudienceChange = (e) => {
    setSelectedAudienceProfileId(e.target.value);
    console.log("Audience changed to:", e.target.value);
  };
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    console.log("Model changed to:", e.target.value);
  };
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
        <h3 className="text-xl font-semibold text-white mb-4">Generate Content</h3>

        <div className="space-y-4">
          <Textarea
            label="Content Prompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe what content you want to generate..."
            rows={5}
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
            onClick={handleGenerate}
            variant="primary"
            icon={Zap}
            disabled={isGenerating || !prompt.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Generated Content</h4>
        <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] border border-gray-700">
          {isGenerating ? (
            <p className="text-gray-400 text-center py-8">Generating content and metrics...</p>
          ) : generatedContent ? (
            <div className="space-y-4">
              <p className="text-white whitespace-pre-wrap">{generatedContent}</p>
              {generatedMetrics && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <h5 className="text-lg font-semibold text-white mb-3">Content Metrics</h5>
                  <Slider
                    label={`Readability Score: ${generatedMetrics.readabilityScore}`}
                    value={generatedMetrics.readabilityScore}
                    min={0}
                    max={10}
                    step={0.1}
                    readOnly={true}
                    colorClass="bg-blue-600"
                  />
                  <Slider
                    label={`Clarity Score: ${generatedMetrics.clarityScore}`}
                    value={generatedMetrics.clarityScore}
                    min={0}
                    max={10}
                    step={0.1}
                    readOnly={true}
                    colorClass="bg-blue-600"
                  />
                  <Slider
                    label={`Platform Optimization: ${generatedMetrics.platformOptimization}%`}
                    value={generatedMetrics.platformOptimization}
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
                      {generatedMetrics.engagementPrediction}
                    </p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Optimization Tips:
                    </label>
                    <p className="text-green-400 whitespace-pre-wrap">
                      {generatedMetrics.optimizationTips}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Generated content will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateContent;
