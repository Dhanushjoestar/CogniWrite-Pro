// src/App.jsx
import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import GenerateContent from './components/tabs/GenerateContent';
import ABTest from './components/tabs/ABTest';
import ContentReview from './components/tabs/ContentReview';
import useLocalStorage from './hooks/useLocalStorage';
import { getFullContentRequestDetails, deleteContent } from './services/contentService';
import { AuthProvider } from './context/AuthContext'; // NEW: Import AuthProvider

const App = () => {
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'generate');
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const [chatKey, setChatKey] = useState(0);
  const [prefilledContentData, setPrefilledContentData] = useState(null);
  const [prefilledABTestContentData, setPrefilledABTestContentData] = useState(null);


  const handleNewChat = () => {
    console.log('Creating new chat / Resetting current tab...');
    setChatKey(prevKey => prevKey + 1);
    setPrefilledContentData(null);
    setPrefilledABTestContentData(null);
    setActiveTab('generate');
  };

  const handleHistoryItemClick = async (item) => {
    console.log('History item clicked:', item);
    try {
      const fullDetails = await getFullContentRequestDetails(item.id);
      console.log('Fetched full content details:', fullDetails);

      setPrefilledContentData(null);
      setPrefilledABTestContentData(null);

      if (item.type === 'ab-test') {
        setPrefilledABTestContentData({
          prompt: fullDetails.prompt,
          platform: fullDetails.targetPlatform,
          audienceProfileId: String(fullDetails.audienceProfileId),
          model: fullDetails.model,
          temperature: fullDetails.temperature,
          generatedContents: fullDetails.generatedContents || [],
          id: fullDetails.id
        });
        setActiveTab('ab-test');
      } else {
        setPrefilledContentData({
          prompt: fullDetails.prompt,
          platform: fullDetails.targetPlatform,
          audienceProfileId: String(fullDetails.audienceProfileId),
          model: fullDetails.model,
          temperature: fullDetails.temperature,
          generatedContent: fullDetails.generatedContents && fullDetails.generatedContents.length > 0
            ? fullDetails.generatedContents[0].content
            : '',
          generatedMetrics: fullDetails.generatedContents && fullDetails.generatedContents.length > 0 && fullDetails.generatedContents[0].metrics
            ? fullDetails.generatedContents[0].metrics
            : null,
          id: fullDetails.id
        });
        setActiveTab('generate');
      }

      setChatKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error('Error fetching history item details:', error);
    }
  };

  const handleDeleteHistoryItem = async (itemId) => {
    console.log('Attempting to delete history item:', itemId);
    try {
      await deleteContent(itemId);
      console.log('History item deleted successfully:', itemId);
      setChatKey(prevKey => prevKey + 1);
      if (activeTab === 'generate' && prefilledContentData?.id === itemId) {
        setPrefilledContentData(null);
      } else if (activeTab === 'ab-test' && prefilledABTestContentData?.id === itemId) {
        setPrefilledABTestContentData(null);
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
      alert(`Failed to delete history item: ${error.message || 'An unknown error occurred.'}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return <GenerateContent key={`generate-${chatKey}`} prefilledData={prefilledContentData} />;
      case 'ab-test':
        return <ABTest key={`ab-test-${chatKey}`} prefilledData={prefilledABTestContentData} />;
      case 'review':
        return <ContentReview key={`review-${chatKey}`} />;
      default:
        return <GenerateContent key={`generate-${chatKey}`} prefilledData={prefilledContentData} />;
    }
  };

  return (
    // NEW: Wrap the entire application with AuthProvider
    <AuthProvider>
      <MainLayout
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChat={handleNewChat}
        onHistoryItemClick={handleHistoryItemClick}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      >
        {renderTabContent()}
      </MainLayout>
    </AuthProvider>
  );
};

export default App;
