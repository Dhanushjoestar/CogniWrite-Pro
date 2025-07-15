// src/components/layout/Header.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import { tabConfig } from '../../constants/data';

// Changed onNewProject to onNewChat
const Header = ({ activeTab, onNewChat }) => { 
  const currentTab = tabConfig[activeTab];
  
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {currentTab?.title || 'Dashboard'}
          </h2>
          <p className="text-gray-400 mt-1">
            {currentTab?.description || 'Welcome to LLM Wrapper'}
          </p>
        </div>
        <Button
          onClick={onNewChat} // Call the new handler
          variant="primary"
          icon={Plus}
        >
          New Chat {/* Changed button text */}
        </Button>
      </div>
    </div>
  );
};

export default Header;
