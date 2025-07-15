// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { MessageSquare, TestTube, FileCheck, History, Menu, X } from 'lucide-react';
import TabButton from '../common/TabButton';
import HistoryItem from '../common/HistoryItem';
import UserProfile from '../common/UserProfile';
import { getHistoryItems } from '../../services/contentService'; // Import the new service function

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  onHistoryItemClick,
  onDeleteHistoryItem // NEW: Accept delete handler
}) => {
  const [historyList, setHistoryList] = useState([]); // State to store fetched history items
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // Fetch history items on component mount or when onDeleteHistoryItem might trigger a refresh
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        // Assuming a static userId for now, replace with actual user ID from auth context later
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
  }, [onDeleteHistoryItem]); // Dependency on onDeleteHistoryItem to trigger re-fetch after deletion

  const navigationItems = [
    { id: 'generate', icon: MessageSquare, label: 'Generate Content' },
    { id: 'ab-test', icon: TestTube, label: 'A/B Test' },
    { id: 'review', icon: FileCheck, label: 'Content Review' }
  ];

  return (
    <div className={`${isSidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col h-screen`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className={`font-bold text-xl ${isSidebarOpen ? 'block' : 'hidden'}`}>
            LLM Wrapper
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2 flex-shrink-0">
        {navigationItems.map((item) => (
          <TabButton
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={setActiveTab}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </div>

      {/* History - This section should be scrollable */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className={`flex items-center gap-2 mb-4 ${isSidebarOpen ? '' : 'justify-center'}`}>
          <History size={20} className="text-gray-400" />
          {isSidebarOpen && <h3 className="text-sm font-medium text-gray-400">History</h3>}
        </div>

        {isSidebarOpen && (
          <div className="space-y-2">
            {historyLoading ? (
              <p className="text-gray-400 text-sm">Loading history...</p>
            ) : historyError ? (
              <p className="text-red-400 text-sm">{historyError}</p>
            ) : historyList.length === 0 ? (
              <p className="text-gray-400 text-sm">No history yet.</p>
            ) : (
              historyList.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onClick={onHistoryItemClick}
                  onDelete={onDeleteHistoryItem} // Pass delete handler to HistoryItem
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* User Profile - Fixed at the bottom */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <UserProfile isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Sidebar;
