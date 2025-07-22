// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  TestTube, 
  FileCheck, 
  History, 
  Menu, 
  X,
  Sparkles,
  Activity,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  Zap
} from 'lucide-react';
import TabButton from '../common/TabButton';
import HistoryItem from '../common/HistoryItem';
import UserProfile from '../common/UserProfile';
import { getHistoryItems } from '../../services/contentService';

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  onHistoryItemClick,
  onDeleteHistoryItem
}) => {
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // Fetch history items on component mount or when onDeleteHistoryItem might trigger a refresh
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const userId = 1; // Placeholder user ID
        const items = await getHistoryItems(userId);
        setHistoryList(items);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setHistoryError('Failed to load history.');
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [onDeleteHistoryItem]);

  const navigationItems = [
    { 
      id: 'generate', 
      icon: MessageSquare, 
      label: 'Generate Content',
      gradient: 'from-blue-500 to-purple-600',
      description: 'AI-powered content creation'
    },
    { 
      id: 'ab-test', 
      icon: TestTube, 
      label: 'A/B Test',
      gradient: 'from-violet-500 to-purple-600',
      description: 'Compare content variants'
    },
    { 
      id: 'review', 
      icon: FileCheck, 
      label: 'Content Review',
      gradient: 'from-indigo-500 to-blue-600',
      description: 'Analyze content performance'
    }
  ];

  const getItemCount = (tabId) => {
    return historyList.filter(item => {
      if (tabId === 'generate') return item.type === 'generate' || !item.type;
      if (tabId === 'ab-test') return item.type === 'ab-test';
      if (tabId === 'review') return item.type === 'review';
      return false;
    }).length;
  };

  const getRecentActivity = () => {
    return historyList.slice(0, 3);
  };

  return (
    <div className={`${isSidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 flex flex-col h-screen shadow-xl`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">CogniWrite Pro</h1>
              <p className="text-xs text-gray-400">AI Content Suite</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors duration-200 text-gray-400 hover:text-white"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Quick Stats - Only when expanded */}
      {isSidebarOpen && (
        <div className="p-4 border-b border-slate-700/50">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-600/30">
              <div className="text-lg font-bold text-blue-400">{getItemCount('generate')}</div>
              <div className="text-xs text-gray-400">Generated</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-600/30">
              <div className="text-lg font-bold text-purple-400">{getItemCount('ab-test')}</div>
              <div className="text-xs text-gray-400">A/B Tests</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-600/30">
              <div className="text-lg font-bold text-indigo-400">{getItemCount('review')}</div>
              <div className="text-xs text-gray-400">Reviews</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="p-4 space-y-3 flex-shrink-0">
        {isSidebarOpen && (
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Tools</span>
          </div>
        )}
        
        {navigationItems.map((item) => (
          <div key={item.id} className="relative group">
            <TabButton
              id={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={setActiveTab}
              isSidebarOpen={isSidebarOpen}
              className={`relative overflow-hidden ${
                activeTab === item.id 
                  ? `bg-gradient-to-r ${item.gradient} shadow-lg transform scale-[1.02]` 
                  : 'bg-slate-800/30 hover:bg-slate-700/50 border border-slate-600/30'
              } transition-all duration-200 rounded-xl p-3`}
            />
            
            {/* Enhanced tooltip for collapsed state */}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap border border-slate-600">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-slate-900 border-l border-b border-slate-600 transform rotate-45"></div>
                </div>
              </div>
            )}

            {/* Activity indicator */}
            {isSidebarOpen && getItemCount(item.id) > 0 && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                {getItemCount(item.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* History Section */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="p-4 border-b border-slate-700/30">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className={`flex items-center gap-2 w-full text-left hover:bg-slate-700/30 p-2 rounded-lg transition-colors duration-200 ${
              isSidebarOpen ? '' : 'justify-center'
            }`}
          >
            {historyExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
            <History size={16} className="text-gray-400" />
            {isSidebarOpen && (
              <>
                <span className="text-sm font-medium text-gray-400 flex-1">Recent History</span>
                {historyList.length > 0 && (
                  <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded-full">
                    {historyList.length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* History Content */}
        {historyExpanded && (
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            {isSidebarOpen ? (
              <div className="space-y-2">
                {historyLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-slate-700/30 h-12 rounded-lg"></div>
                    ))}
                  </div>
                ) : historyError ? (
                  <div className="bg-red-900/20 border border-red-700/50 text-red-300 p-3 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>{historyError}</span>
                    </div>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 bg-slate-700/30 rounded-full w-fit mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">No history yet</p>
                    <p className="text-gray-500 text-xs mt-1">Your recent work will appear here</p>
                  </div>
                ) : (
                  <>
                    {/* Recent Activity Section */}
                    {getRecentActivity().length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-400">Recent Activity</span>
                        </div>
                        <div className="space-y-1">
                          {getRecentActivity().map((item) => (
                            <HistoryItem
                              key={`recent-${item.id}`}
                              item={item}
                              onClick={onHistoryItemClick}
                              onDelete={onDeleteHistoryItem}
                              compact={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All History */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <History className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-400">All History</span>
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {historyList.map((item) => (
                          <HistoryItem
                            key={item.id}
                            item={item}
                            onClick={onHistoryItemClick}
                            onDelete={onDeleteHistoryItem}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Collapsed state - show dots for recent items
              <div className="space-y-2">
                {getRecentActivity().slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="w-2 h-2 bg-blue-400 rounded-full mx-auto opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => onHistoryItemClick(item)}
                    title={item.prompt?.substring(0, 50) + '...' || 'History item'}
                  ></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile - Fixed at the bottom */}
      <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
        <UserProfile isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Sidebar;
