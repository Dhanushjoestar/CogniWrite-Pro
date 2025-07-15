// src/App.jsx
import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import GenerateContent from './components/tabs/GenerateContent';
import ABTest from './components/tabs/ABTest'; // Ensure ABTest is imported
import ContentReview from './components/tabs/ContentReview';
import useLocalStorage from './hooks/useLocalStorage';
import { getFullContentRequestDetails, deleteContent } from './services/contentService'; // Import deleteContent

const App = () => {
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'generate');
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const [chatKey, setChatKey] = useState(0);
  // New state to hold pre-filled data for either GenerateContent or ABTest
  const [prefilledContentData, setPrefilledContentData] = useState(null);
  const [prefilledABTestContentData, setPrefilledABTestContentData] = useState(null);


  const handleNewChat = () => {
    console.log('Creating new chat / Resetting current tab...');
    setChatKey(prevKey => prevKey + 1); // Forces remount of current tab
    setPrefilledContentData(null); // Clear pre-filled data for GenerateContent
    setPrefilledABTestContentData(null); // Clear pre-filled data for ABTest
    setActiveTab('generate'); // Default to Generate Content tab for new chat
  };

  const handleHistoryItemClick = async (item) => {
    console.log('History item clicked:', item);
    try {
      const fullDetails = await getFullContentRequestDetails(item.id);
      console.log('Fetched full content details:', fullDetails);

      // Clear any existing pre-filled data
      setPrefilledContentData(null);
      setPrefilledABTestContentData(null);

      // Determine which tab to activate and which data to pre-fill
      // Assuming 'type' field exists in ContentHistoryItemDTO (e.g., "generate", "ab-test")
      if (item.type === 'ab-test') {
        setPrefilledABTestContentData({
          prompt: fullDetails.prompt,
          platform: fullDetails.targetPlatform,
          audienceProfileId: String(fullDetails.audienceProfileId),
          model: fullDetails.model,
          temperature: fullDetails.temperature,
          // Pass the entire array of generatedContents for A/B test
          generatedContents: fullDetails.generatedContents || [],
          id: fullDetails.id // Pass the ID for potential use in ABTest component
        });
        setActiveTab('ab-test');
      } else { // Default to 'generate' type if no type or 'generate'
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
          id: fullDetails.id // Pass the ID for potential use in GenerateContent component
        });
        setActiveTab('generate');
      }

      // Force re-mount of the target tab to ensure it picks up new props
      setChatKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error('Error fetching history item details:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleDeleteHistoryItem = async (itemId) => {
    console.log('Attempting to delete history item:', itemId);
    try {
      await deleteContent(itemId); // Call the delete service
      console.log('History item deleted successfully:', itemId);
      // After deletion, force a refresh of the sidebar history list
      setChatKey(prevKey => prevKey + 1); // This will remount Sidebar and refetch history
      // Optionally, if the deleted item was currently displayed, clear the content
      if (activeTab === 'generate' && prefilledContentData?.id === itemId) {
        setPrefilledContentData(null);
      } else if (activeTab === 'ab-test' && prefilledABTestContentData?.id === itemId) {
        setPrefilledABTestContentData(null);
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
      // Show error to user (replace with a custom modal in production)
      alert(`Failed to delete history item: ${error.message || 'An unknown error occurred.'}`);
    }
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        // Pass prefilledContentData to GenerateContent
        return <GenerateContent key={`generate-${chatKey}`} prefilledData={prefilledContentData} />;
      case 'ab-test':
        // Pass prefilledABTestContentData to ABTest
        return <ABTest key={`ab-test-${chatKey}`} prefilledData={prefilledABTestContentData} />;
      case 'review':
        return <ContentReview key={`review-${chatKey}`} />;
      default:
        return <GenerateContent key={`generate-${chatKey}`} prefilledData={prefilledContentData} />;
    }
  };

  return (
    <MainLayout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onNewChat={handleNewChat}
      onHistoryItemClick={handleHistoryItemClick}
      onDeleteHistoryItem={handleDeleteHistoryItem} // Pass delete handler
    >
      {renderTabContent()}
    </MainLayout>
  );
};

export default App;
