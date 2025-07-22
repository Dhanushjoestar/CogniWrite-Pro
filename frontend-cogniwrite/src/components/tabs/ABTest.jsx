// src/components/tabs/ABTest.jsx
import React, { useState, useEffect } from 'react';
import { 
  TestTube2, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Users, 
  Zap, 
  Copy, 
  Share2, 
  Download,
  Play,
  Pause,
  StopCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  PieChart,
  Activity,
  Lightbulb,
  FlaskConical
} from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Slider from '../ui/Slider';
import { platforms, models } from '../../constants/data';
import { generateContent, generateMetrics } from '../../services/contentService';
import { getAllAudienceProfiles } from '../../services/audienceService';

const ABTest = () => {
  // Single form state that will generate 2 variants
  const [testDescription, setTestDescription] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedAudienceProfileId, setSelectedAudienceProfileId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState(0.7);
  
  // Results state for both variants
  const [variantA, setVariantA] = useState({ content: '', metrics: null });
  const [variantB, setVariantB] = useState({ content: '', metrics: null });
  
  const [audienceProfiles, setAudienceProfiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testStatus, setTestStatus] = useState('draft'); // draft, running, paused, completed
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [winner, setWinner] = useState(null);

  // Fetch audience profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profiles = await getAllAudienceProfiles();
        setAudienceProfiles(profiles);
        if (profiles.length > 0) {
          setSelectedAudienceProfileId(String(profiles[0].id));
        }
      } catch (err) {
        console.error('Failed to fetch audience profiles:', err);
        setError('Failed to load audience profiles. Please try again.');
      }
    };
    fetchProfiles();
  }, []);

  const handleCreateABTest = async () => {
    if (!testDescription.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel) {
      setError('Please fill in all required fields to create the A/B test.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVariantA({ content: '', metrics: null });
    setVariantB({ content: '', metrics: null });

    try {
      // Generate Variant A
      const payloadA = {
        prompt: testDescription + " (Version A - more conservative approach)",
        targetPlatform: selectedPlatform,
        audienceProfileId: parseInt(selectedAudienceProfileId),
        model: selectedModel,
        temperature: Math.max(0.3, selectedTemperature - 0.2), // Slightly lower temperature for A
        userId: 1,
      };

      const generationResponseA = await generateContent(payloadA);
      let contentA = '';
      
      if (generationResponseA?.generatedContents?.[0]?.content) {
        contentA = generationResponseA.generatedContents[0].content;
        
        const metricsPayloadA = {
          reviewContent: contentA,
          reviewPlatform: selectedPlatform,
        };
        
        const metricsResponseA = await generateMetrics(metricsPayloadA);
        setVariantA({ content: contentA, metrics: metricsResponseA });
      }

      // Generate Variant B
      const payloadB = {
        prompt: testDescription + " (Version B - more creative approach)",
        targetPlatform: selectedPlatform,
        audienceProfileId: parseInt(selectedAudienceProfileId),
        model: selectedModel,
        temperature: Math.min(1.5, selectedTemperature + 0.2), // Slightly higher temperature for B
        userId: 1,
      };

      const generationResponseB = await generateContent(payloadB);
      let contentB = '';
      
      if (generationResponseB?.generatedContents?.[0]?.content) {
        contentB = generationResponseB.generatedContents[0].content;
        
        const metricsPayloadB = {
          reviewContent: contentB,
          reviewPlatform: selectedPlatform,
        };
        
        const metricsResponseB = await generateMetrics(metricsPayloadB);
        setVariantB({ content: contentB, metrics: metricsResponseB });
      }

      // Switch to results tab after generation
      setActiveTab('results');
      
    } catch (err) {
      console.error('Failed to generate A/B test variants:', err);
      setError(`Failed to generate A/B test: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startTest = () => {
    if (!variantA.content || !variantB.content) {
      setError('Please generate A/B test variants before starting the test.');
      return;
    }
    setTestStatus('running');
  };

  const pauseTest = () => setTestStatus('paused');
  
  const stopTest = () => {
    setTestStatus('completed');
    determineWinner();
  };

  const determineWinner = () => {
    if (!variantA.metrics || !variantB.metrics) return;
    
    const scoreA = (variantA.metrics.readabilityScore + variantA.metrics.clarityScore + (variantA.metrics.platformOptimization / 10)) / 3;
    const scoreB = (variantB.metrics.readabilityScore + variantB.metrics.clarityScore + (variantB.metrics.platformOptimization / 10)) / 3;
    
    setWinner(scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie');
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

  const platformOptions = platforms.map(p => ({ value: p.value, label: p.label }));
  const audienceOptions = audienceProfiles.map(profile => ({
    value: String(profile.id),
    label: profile.profileName || `${profile.ageGroup} | ${profile.personaType} | ${profile.tone}`
  }));
  const modelOptions = models.map(m => ({ value: m.value, label: m.label }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            A/B Test Setup
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          Create two content variations automatically and compare their performance to optimize your messaging strategy.
        </p>
      </div>

      {/* Test Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              testStatus === 'running' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              testStatus === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              testStatus === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                testStatus === 'running' ? 'bg-emerald-400 animate-pulse' :
                testStatus === 'paused' ? 'bg-yellow-400' :
                testStatus === 'completed' ? 'bg-blue-400' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium capitalize">{testStatus}</span>
            </div>
            
            {winner && (
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">
                  {winner === 'tie' ? 'Test resulted in a tie' : `Variant ${winner} is the winner!`}
                </span>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {testStatus === 'draft' && (variantA.content && variantB.content) && (
              <Button
                onClick={startTest}
                variant="primary"
                icon={Play}
                className="bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                Start Test
              </Button>
            )}
            {testStatus === 'running' && (
              <>
                <Button
                  onClick={pauseTest}
                  variant="secondary"
                  icon={Pause}
                >
                  Pause Test
                </Button>
                <Button
                  onClick={stopTest}
                  variant="primary"
                  icon={StopCircle}
                  className="bg-gradient-to-r from-red-600 to-red-700"
                >
                  Stop Test
                </Button>
              </>
            )}
            {testStatus === 'paused' && (
              <>
                <Button
                  onClick={() => setTestStatus('running')}
                  variant="primary"
                  icon={Play}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  Resume Test
                </Button>
                <Button
                  onClick={stopTest}
                  variant="secondary"
                  icon={StopCircle}
                >
                  Stop Test
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Setup Form */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-violet-400" />
          <h3 className="text-2xl font-bold text-white">Test Configuration</h3>
        </div>

        <div className="space-y-6">
          {/* Test Description - Large textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Description
            </label>
            <div className="relative">
              <Textarea
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Describe what you want to A/B test (e.g., 'Two variants of a social media ad for new product launch')..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-4 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <span className="text-xs text-gray-400">{testDescription.length} characters</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <Select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                options={platformOptions}
                placeholder="Select platform"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Audience Profile</label>
              <Select
                value={selectedAudienceProfileId}
                onChange={(e) => setSelectedAudienceProfileId(e.target.value)}
                options={audienceOptions}
                placeholder={audienceProfiles.length === 0 ? "Loading..." : "Select audience"}
                disabled={audienceProfiles.length === 0}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                options={modelOptions}
                placeholder="Select model"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                <span>Temperature</span>
                <div className="group relative">
                  <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-300 cursor-help">?</div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Controls creativity level for variants
                  </div>
                </div>
              </label>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                <Slider
                  value={selectedTemperature}
                  onChange={(e) => setSelectedTemperature(parseFloat(e.target.value))}
                  min={0.0}
                  max={1.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0</span>
                  <span className="font-medium text-violet-400">{selectedTemperature}</span>
                  <span>1.5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium mb-1">Generation Error</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
            </div>
          )}

          {/* Create A/B Test Button */}
          <Button
            onClick={handleCreateABTest}
            variant="primary"
            icon={isGenerating ? TestTube2 : FlaskConical}
            disabled={isGenerating || !testDescription.trim() || !selectedPlatform || !selectedAudienceProfileId || !selectedModel}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <TestTube2 className="w-5 h-5 animate-pulse" />
                <span>Creating A/B Test Variants...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5" />
                <span>Create A/B Test</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Test Results Section */}
      {(variantA.content || variantB.content || isGenerating) && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <h4 className="text-2xl font-bold text-white">Test Results</h4>
            </div>

            {isGenerating ? (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin animation-delay-75 mx-auto"></div>
                </div>
                <p className="text-white text-xl font-medium mt-6 mb-2">Generating A/B Test Variants</p>
                <p className="text-gray-400">Creating two optimized versions of your content...</p>
              </div>
            ) : (variantA.content && variantB.content) ? (
              <div className="space-y-8">
                {/* Performance Comparison */}
                {variantA.metrics && variantB.metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                      <h5 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <span>Readability</span>
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-400 font-medium">Variant A</span>
                          <span className={`text-lg font-bold ${getScoreColor(variantA.metrics.readabilityScore)}`}>
                            {variantA.metrics.readabilityScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(variantA.metrics.readabilityScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-medium">Variant B</span>
                          <span className={`text-lg font-bold ${getScoreColor(variantB.metrics.readabilityScore)}`}>
                            {variantB.metrics.readabilityScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(variantB.metrics.readabilityScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                      <h5 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <span>Clarity</span>
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-400 font-medium">Variant A</span>
                          <span className={`text-lg font-bold ${getScoreColor(variantA.metrics.clarityScore)}`}>
                            {variantA.metrics.clarityScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(variantA.metrics.clarityScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-medium">Variant B</span>
                          <span className={`text-lg font-bold ${getScoreColor(variantB.metrics.clarityScore)}`}>
                            {variantB.metrics.clarityScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(variantB.metrics.clarityScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                      <h5 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <span>Platform Optimization</span>
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-400 font-medium">Variant A</span>
                          <span className={`text-lg font-bold ${getScoreColor(variantA.metrics.platformOptimization, 100)}`}>
                            {variantA.metrics.platformOptimization}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${variantA.metrics.platformOptimization}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-medium">Variant B</span>
                          <span className={`text-lg font-bold ${getScoreColor(variantB.metrics.platformOptimization, 100)}`}>
                            {variantB.metrics.platformOptimization}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${variantB.metrics.platformOptimization}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Side by Side Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Variant A</span>
                        <span className="text-sm text-gray-400 font-normal">(Conservative)</span>
                      </h4>
                      {winner === 'A' && (
                        <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs font-medium">Winner</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600/30">
                      <p className="text-white leading-relaxed whitespace-pre-wrap text-sm">
                        {variantA.content}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Variant B</span>
                        <span className="text-sm text-gray-400 font-normal">(Creative)</span>
                      </h4>
                      {winner === 'B' && (
                        <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs font-medium">Winner</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600/30">
                      <p className="text-white leading-relaxed whitespace-pre-wrap text-sm">
                        {variantB.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">A/B test results will appear here...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTest;
