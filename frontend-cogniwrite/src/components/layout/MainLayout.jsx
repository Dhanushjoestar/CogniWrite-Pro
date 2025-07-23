// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthModal from '../auth/AuthModal'; // NEW: Import AuthModal
import { useAuth } from '../../context/AuthContext'; // NEW: Import useAuth hook

const MainLayout = ({
  children,
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  onNewChat,
  onHistoryItemClick,
  onDeleteHistoryItem,
}) => {
  const { user, isLoggedIn, login, register, logout, error, isLoading } = useAuth(); // NEW: Get auth context
  const [showAuthModal, setShowAuthModal] = useState(false); // State to control modal visibility

  const handleLoginSuccess = () => {
    console.log("Login successful, closing modal.");
    setShowAuthModal(false);
    // Optionally, refresh some data that depends on user ID
  };

  const handleRegisterSuccess = () => {
    console.log("Registration successful, prompting for login.");
    // AuthModal will automatically switch to login mode and show a message
  };

  const handleLogout = () => {
    logout(); // Call logout from auth context
    // Optionally, redirect or clear more state after logout
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChat={onNewChat}
        onHistoryItemClick={onHistoryItemClick}
        onDeleteHistoryItem={onDeleteHistoryItem}
        // NEW: Pass auth state and handlers to Sidebar for UserProfile
        user={user}
        isLoggedIn={isLoggedIn}
        onShowAuthModal={() => setShowAuthModal(true)} // This function triggers the modal
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} onNewChat={onNewChat} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* NEW: AuthModal component - conditionally rendered */}
      <AuthModal
        isOpen={showAuthModal} // Modal visibility controlled by this state
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        authContext={{ login, register, isLoading, error }} // Pass auth functions and state
      />
    </div>
  );
};

export default MainLayout;
