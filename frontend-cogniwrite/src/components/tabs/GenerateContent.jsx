// src/components/tabs/GenerateContent.jsx
import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Copy, Download, Share2, BarChart3, TrendingUp, Target, Lightbulb, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Slider from '../ui/Slider';
import { platforms, models } from '../../constants/data';
import { generateContent, generateMetrics } from '../../services/contentService';
import { getAllAudienceProfiles } from '../../services/audienceService';
import { useAuth } from '../../context/AuthContext'; // NEW: Import useAuth

const GenerateContent = ({ prefilledData }) => {
  const { user, isLoggedIn } = useAuth(); // NEW: Get user and isLoggedIn from AuthContext

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
  const [copied, setCopied] = useState(false);

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
      generatedContent: generatedContent ? generatedContent.substring(0, Math.min(generatedContent.length, 50)) + "..." : "N/A",
      generatedMetrics
    });
  });

  // Fetch audience profiles when the component mounts or prefilledData changes
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profiles = await getAllAudienceProfiles();
        setAudienceProfiles(profiles);
        if (profiles.length > 0) {
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
  }, [prefilledData]); // Removed audienceProfiles from dependency array to prevent infinite loop

  // Effect to handle pre-filled data (from history)
  useEffect(() => {
    if (prefilledData) {
      setPrompt(prefilledData.prompt || '');
      setSelectedPlatform(prefilledData.platform || '');
      setSelectedAudienceProfileId(String(prefilledData.audienceProfileId) || '');
      setSelectedModel(prefilledData.model || '');
      setSelectedTemperature(prefilledData.temperature || 0.7);
      setGeneratedContent(prefilledData.generatedContent || '');
      setGeneratedMetrics(prefilledData.generatedMetrics || null);
      setError(null);
    } else {
      // Reset form if no prefilledData (e.g., new chat)
      setPrompt('');
      setSelectedPlatform('');
      // Keep first audience profile selected if available
      if (audienceProfiles.length > 0) {
        setSelectedAudienceProfileId(String(audienceProfiles[0].id));
      } else {
        setSelectedAudienceProfileId(''); // Ensure it's empty if no profiles
      }
      setSelectedModel(''); // Reset model to empty string
      setSelectedTemperature(0.7);
      setGeneratedContent('');
      setGeneratedMetrics(null);
      setError(null);
    }
  }, [prefilledData, audienceProfiles]); // Add audienceProfiles to dependency array


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
        userId: isLoggedIn ? user.id : null, // MODIFIED: Pass userId if logged in, otherwise null
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const getScoreColor = (score, max = 10) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score, max = 10) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
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
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Content Generator
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create engaging, platform-optimized content with AI assistance. Get real-time analytics and optimization tips.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Configuration</h3>
            </div>

            <div className="space-y-6">
              {/* Enhanced Textarea */}
              <div className="relative">
                <Textarea
                  label="Content Prompt"
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Describe what content you want to generate... Be specific about your goals, tone, and key messages."
                  rows={6}
                  className="resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {prompt.length} characters
                </div>
              </div>

              {/* Enhanced Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Select
                    label="Platform"
                    value={selectedPlatform}
                    onChange={handlePlatformChange}
                    options={platformOptions}
                    placeholder="Select target platform"
                  />

                  <Select
                    label="AI Model"
                    value={selectedModel}
                    onChange={handleModelChange}
                    options={modelOptions}
                    placeholder="Choose AI model"
                  />
                </div>

                <div className="space-y-4">
                  <Select
                    label="Audience Profile"
                    value={selectedAudienceProfileId}
                    onChange={handleAudienceChange}
                    options={audienceOptions}
                    placeholder={audienceProfiles.length === 0 && !error ? "Loading profiles..." : "Select target audience"}
                    disabled={audienceProfiles.length === 0}
                  />

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                    <Slider
                      label={`Creativity Level: ${selectedTemperature}`}
                      value={selectedTemperature}
                      onChange={handleTemperatureChange}
                      min={0.0}
                      max={1.5}
                      step={0.1}
                      tooltip="Controls creativity: Lower = more focused, Higher = more creative"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">Generation Error</div>
                    <div className="text-sm opacity-90">{error}</div>
                  </div>
                </div>
              )}

              {/* Enhanced Generate Button */}
              <Button
                onClick={handleGenerate}
                variant="primary"
                icon={isGenerating ? Loader2 : Zap}
                disabled={isGenerating || !prompt.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                {isGenerating ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Content...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Generate Content</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Quick Stats</span>
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Characters</span>
                <span className="text-white font-semibold">{prompt.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Platform</span>
                <span className="text-blue-400 font-medium">
                  {selectedPlatform || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Model</span>
                <span className="text-purple-400 font-medium">
                  {selectedModel || 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Temperature Visual */}
          {selectedTemperature && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h4 className="text-lg font-semibold text-white mb-4">Creativity Level</h4>
              <div className="relative">
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedTemperature / 1.5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-sm text-gray-400">
                  {selectedTemperature < 0.5 ? 'Conservative' :
                    selectedTemperature < 1.0 ? 'Balanced' : 'Creative'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white">Generated Content & Analytics</h4>
            </div>

            {generatedContent && !isGenerating && (
              <div className="flex space-x-3">
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  icon={copied ? CheckCircle2 : Copy}
                  className="flex items-center space-x-2"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="secondary"
                  icon={Share2}
                  className="flex items-center space-x-2"
                >
                  Share
                </Button>
                <Button
                  variant="secondary"
                  icon={Download}
                  className="flex items-center space-x-2"
                >
                  Export
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Display */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-xl p-6 min-h-[300px] border border-slate-600/50 backdrop-blur-sm">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin animation-delay-75"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-lg font-medium mb-2">Generating Content</p>
                      <p className="text-gray-400">This may take a few moments...</p>
                    </div>
                  </div>
                ) : generatedContent ? (
                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white leading-relaxed whitespace-pre-wrap text-base">
                        {generatedContent}
                      </div>
                    </div>

                    {/* Content Stats */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-600">
                      <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {generatedContent.split(' ').length} words
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {generatedContent.length} characters
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                    <div className="p-4 bg-slate-700/50 rounded-full">
                      <Sparkles className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-lg mb-2">Ready to generate content</p>
                      <p className="text-gray-500 text-sm max-w-md">
                        Fill in the configuration fields and click "Generate Content" to create your optimized content.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="space-y-6">
              {generatedMetrics && !isGenerating ? (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span>Performance Metrics</span>
                  </h5>

                  {/* Score Cards */}
                  <div className="space-y-4">
                    <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Readability</span>
                        <span className={`text-lg font-bold ${getScoreColor(generatedMetrics.readabilityScore)}`}>
                          {generatedMetrics.readabilityScore}/10
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(generatedMetrics.readabilityScore)}`}
                          style={{ width: `${(generatedMetrics.readabilityScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Clarity</span>
                        <span className={`text-lg font-bold ${getScoreColor(generatedMetrics.clarityScore)}`}>
                          {generatedMetrics.clarityScore}/10
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(generatedMetrics.clarityScore)}`}
                          style={{ width: `${(generatedMetrics.clarityScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Platform Optimization</span>
                        <span className={`text-lg font-bold ${getScoreColor(generatedMetrics.platformOptimization, 100)}`}>
                          {generatedMetrics.platformOptimization}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(generatedMetrics.platformOptimization, 100)}`}
                          style={{ width: `${generatedMetrics.platformOptimization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Prediction */}
                  <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Engagement Prediction</span>
                    </div>
                    <p className="text-white text-xl font-bold">
                      {generatedMetrics.engagementPrediction}
                    </p>
                  </div>

                  {/* Optimization Tips */}
                  <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700/50">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300">Optimization Tips</span>
                    </div>
                    <div className="text-emerald-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {generatedMetrics.optimizationTips}
                    </div>
                  </div>
                </div>
              ) : generatedContent && isGenerating ? (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6 mx-auto"></div>
                  </div>
                  <p className="text-gray-400 mt-4">Analyzing content...</p>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="p-3 bg-slate-700/50 rounded-full w-fit mx-auto">
                    <BarChart3 className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 mb-2">Analytics will appear here</p>
                    <p className="text-gray-500 text-sm">Generate content to see performance metrics</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateContent;
