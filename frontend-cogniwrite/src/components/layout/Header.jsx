// src/components/layout/Header.jsx
import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Clock,
  MoreHorizontal,
  Bell,
  Search,
  Command
} from 'lucide-react';
import Button from '../ui/Button';
import { tabConfig } from '../../constants/data';

// Changed onNewProject to onNewChat
const Header = ({ activeTab, onNewChat }) => { 
  const currentTab = tabConfig[activeTab];
  
  const getTabIcon = () => {
    switch(activeTab) {
      case 'generate':
        return <Sparkles className="w-6 h-6 text-blue-400" />;
      case 'ab-test':
        return <Activity className="w-6 h-6 text-purple-400" />;
      case 'review':
        return <TrendingUp className="w-6 h-6 text-indigo-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTabGradient = () => {
    switch(activeTab) {
      case 'generate':
        return 'from-blue-500 to-purple-600';
      case 'ab-test':
        return 'from-violet-500 to-purple-600';
      case 'review':
        return 'from-indigo-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 shadow-lg">
      {/* Main Header Content */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Tab Info */}
          <div className="flex items-center space-x-4">
            <div className={`p-3 bg-gradient-to-br ${getTabGradient()} rounded-2xl shadow-lg`}>
              {getTabIcon()}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-bold text-white">
                  {currentTab?.title || 'Dashboard'}
                </h2>
                <div className="hidden sm:flex items-center space-x-2 bg-slate-800/50 rounded-full px-3 py-1 border border-slate-600/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400 font-medium">Active</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-300 text-lg">
                  {currentTab?.description || 'Welcome to CogniWrite Pro'}
                </p>
                <div className="hidden md:flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{getCurrentTime()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button - Desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                icon={Search}
                className="text-gray-400 hover:text-white hover:bg-slate-700/50 border border-slate-600/30"
              >
                <span className="ml-2 text-sm">Search</span>
                <div className="ml-3 flex items-center space-x-1 text-xs text-gray-500">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </Button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                icon={Bell}
                className="text-gray-400 hover:text-white hover:bg-slate-700/50 relative"
              >
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </Button>
            </div>

            {/* More Options */}
            <Button
              variant="ghost"
              icon={MoreHorizontal}
              className="text-gray-400 hover:text-white hover:bg-slate-700/50"
            />

            {/* Primary CTA */}
            <Button
              onClick={onNewChat} // Call the new handler
              variant="primary"
              icon={Plus}
              className={`bg-gradient-to-r ${getTabGradient()} hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02] shadow-md font-semibold px-6 py-3`}
            >
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Quick Stats & Context */}
      <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700/30">
        <div className="flex items-center justify-between">
          {/* Quick Context */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Ready to create</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Activity className="w-4 h-4" />
                <span>AI Models: Online</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Performance: Optimal</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500">
              <span>Tip:</span>
              <span className="text-gray-400">Use keyboard shortcuts for faster workflow</span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (if needed for loading states) */}
      <div className="h-1 bg-slate-800">
        <div className={`h-full bg-gradient-to-r ${getTabGradient()} transition-all duration-300 w-0`}></div>
      </div>
    </div>
  );
};

export default Header;
