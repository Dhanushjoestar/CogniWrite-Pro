// src/components/layout/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({
  children,
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  onNewChat,
  onHistoryItemClick
}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white"> {/* Added overflow-hidden here */}
      {/* Fixed Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onHistoryItemClick={onHistoryItemClick}
      />

      <div className="flex flex-col flex-1">
        {/* Fixed Header */}
        <Header
          activeTab={activeTab}
          onNewChat={onNewChat}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6"> {/* This will be the only scrollable area */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
