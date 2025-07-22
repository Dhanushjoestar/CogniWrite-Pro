// src/components/tabs/ContentReview.jsx
import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Copy, 
  Download, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Activity,
  Sparkles,
  Clock,
  Award,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Slider from '../ui/Slider';
import { platforms } from '../../constants/data';
import { generateMetrics } from '../../services/contentService';

const ContentReview = () => {
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!content.trim() || !selectedPlatform) {
      setError('Please provide content to review and select a platform.');
      return;
    }

    setIsReviewing(true);
    setError(null);
    setReviewResults(null);

    try {
      const payload = {
        reviewContent: content,
        reviewPlatform: selectedPlatform,
      };

      console.log('Sending review payload:', payload);
      const response = await generateMetrics(payload);
      console.log('Received review response:', response);

      if (response) {
        setReviewResults(response);
      } else {
        setError('Content review completed, but response format was unexpected. Check console for details.');
        console.warn('Unexpected review response format:', response);
      }
    } catch (err) {
      console.error('Failed to perform content review:', err);
      setError(`Failed to perform content review: ${err.message || 'An unknown error occurred.'}`);
      setReviewResults(null);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
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

  const getOverallScore = () => {
    if (!reviewResults) return 0;
    return Math.round((reviewResults.readabilityScore + reviewResults.clarityScore + (reviewResults.platformOptimization / 10)) / 3 * 10) / 10;
  };

  const getScoreGrade = (score) => {
    if (score >= 8) return { grade: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (score >= 7) return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (score >= 6) return { grade: 'B+', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 5) return { grade: 'B', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 4) return { grade: 'C', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { grade: 'D', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const handleContentChange = (e) => setContent(e.target.value);
  const handlePlatformChange = (e) => setSelectedPlatform(e.target.value);

  const platformOptions = platforms.map(p => ({ value: p.value, label: p.label }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Content Review
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Analyze your content with AI-powered insights. Get detailed performance metrics, optimization tips, and actionable recommendations.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Search className="w-6 h-6 text-indigo-400" />
              <h3 className="text-2xl font-bold text-white">Content Analysis</h3>
            </div>

            <div className="space-y-6">
              {/* Enhanced Content Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Content to Review</span>
                </label>
                <div className="relative">
                  <Textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Paste your content here for comprehensive analysis and optimization suggestions..."
                    rows={8}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl p-4 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-4">
                    <span className="text-xs text-gray-400">
                      {content.length} characters | {content.split(' ').filter(word => word.length > 0).length} words
                    </span>
                    {content && (
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        icon={copied ? CheckCircle2 : Copy}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Platform Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Target Platform</span>
                  </label>
                  <Select
                    value={selectedPlatform}
                    onChange={handlePlatformChange}
                    options={platformOptions}
                    placeholder="Select platform for optimization"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg"
                  />
                </div>

                {/* Content Insights */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Quick Insights</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reading Time</span>
                      <span className="text-white">{Math.ceil(content.split(' ').length / 200)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sentences</span>
                      <span className="text-white">{content.split(/[.!?]+/).filter(s => s.trim().length > 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg. Word Length</span>
                      <span className="text-white">
                        {content.length > 0 ? Math.round(content.split(' ').reduce((acc, word) => acc + word.length, 0) / content.split(' ').length * 10) / 10 : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">Review Error</div>
                    <div className="text-sm opacity-90">{error}</div>
                  </div>
                </div>
              )}

              {/* Enhanced Review Button */}
              <Button
                onClick={handleReview}
                variant="primary"
                icon={isReviewing ? Activity : FileCheck}
                disabled={!content.trim() || !selectedPlatform || isReviewing}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transform transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                {isReviewing ? (
                  <span className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span>Analyzing Content...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <FileCheck className="w-5 h-5" />
                    <span>Review Content</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Overall Score Card */}
          {reviewResults && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>Overall Score</span>
              </h4>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(getOverallScore() / 10) * 251.2} 251.2`}
                      className={getScoreColor(getOverallScore()).replace('text-', 'text-')}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(getOverallScore())}`}>
                      {getOverallScore()}
                    </span>
                  </div>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreGrade(getOverallScore()).bg} ${getScoreGrade(getOverallScore()).color}`}>
                  Grade: {getScoreGrade(getOverallScore()).grade}
                </div>
              </div>
            </div>
          )}

          {/* Platform Info */}
          {selectedPlatform && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h4 className="text-lg font-semibold text-white mb-4">Platform: {selectedPlatform}</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Platform-specific analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Optimization recommendations</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Engagement predictions</span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tips */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span>Tips for Better Analysis</span>
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Include complete sentences for accurate readability scoring</span>
              </div>
              <div className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Select the correct platform for targeted optimization</span>
              </div>
              <div className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Review longer content for more comprehensive insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <h4 className="text-2xl font-bold text-white">Analysis Results</h4>
            </div>
            
            {reviewResults && !isReviewing && (
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  icon={Share2}
                  className="flex items-center space-x-2"
                >
                  Share Results
                </Button>
                <Button
                  variant="secondary"
                  icon={Download}
                  className="flex items-center space-x-2"
                >
                  Export Report
                </Button>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 backdrop-blur-sm overflow-hidden">
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin animation-delay-75"></div>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-medium mb-2">Analyzing Content</p>
                  <p className="text-gray-400">This may take a few moments...</p>
                </div>
              </div>
            ) : reviewResults ? (
              <div className="p-8 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800/70 rounded-xl p-6 border border-slate-600/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                      </div>
                      <h5 className="text-lg font-semibold text-white">Readability</h5>
                    </div>
                    <div className="flex items-end justify-between mb-3">
                      <span className={`text-3xl font-bold ${getScoreColor(reviewResults.readabilityScore)}`}>
                        {reviewResults.readabilityScore}
                      </span>
                      <span className="text-gray-400 text-sm">/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(reviewResults.readabilityScore)}`}
                        style={{ width: `${(reviewResults.readabilityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-800/70 rounded-xl p-6 border border-slate-600/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Target className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h5 className="text-lg font-semibold text-white">Clarity</h5>
                    </div>
                    <div className="flex items-end justify-between mb-3">
                      <span className={`text-3xl font-bold ${getScoreColor(reviewResults.clarityScore)}`}>
                        {reviewResults.clarityScore}
                      </span>
                      <span className="text-gray-400 text-sm">/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(reviewResults.clarityScore)}`}
                        style={{ width: `${(reviewResults.clarityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-800/70 rounded-xl p-6 border border-slate-600/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                      </div>
                      <h5 className="text-lg font-semibold text-white">Platform Optimization</h5>
                    </div>
                    <div className="flex items-end justify-between mb-3">
                      <span className={`text-3xl font-bold ${getScoreColor(reviewResults.platformOptimization, 100)}`}>
                        {reviewResults.platformOptimization}
                      </span>
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(reviewResults.platformOptimization, 100)}`}
                        style={{ width: `${reviewResults.platformOptimization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Engagement Prediction */}
                <div className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 rounded-xl p-6 border border-indigo-500/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    <h5 className="text-xl font-semibold text-white">Engagement Prediction</h5>
                  </div>
                  <p className="text-2xl font-bold text-indigo-300">
                    {reviewResults.engagementPrediction}
                  </p>
                </div>

                {/* Optimization Tips */}
                <div className="bg-emerald-900/30 rounded-xl p-6 border border-emerald-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-emerald-400" />
                    <h5 className="text-xl font-semibold text-emerald-300">Optimization Recommendations</h5>
                  </div>
                  <div className="text-emerald-200 leading-relaxed whitespace-pre-wrap">
                    {reviewResults.optimizationTips}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                <div className="p-4 bg-slate-700/50 rounded-full">
                  <FileCheck className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-lg mb-2">Ready to analyze your content</p>
                  <p className="text-gray-500 text-sm max-w-md">
                    Paste your content above and select a platform to get detailed performance insights and optimization recommendations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentReview;
