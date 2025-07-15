// src/components/common/HistoryItem.jsx
import React from 'react';
import { Trash2 } from 'lucide-react'; // Import delete icon

const HistoryItem = ({ item, onClick, onDelete }) => { // Accept onDelete prop
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return isoString;
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent the parent div's onClick from firing
    // IMPORTANT: Replace window.confirm with a custom modal in a production app
    if (window.confirm('Are you sure you want to delete this history item?')) {
      onDelete?.(item.id);
    }
  };

  return (
    <div
      className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer flex items-center justify-between"
    >
      <div onClick={() => onClick?.(item)} className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {item.prompt}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {formatDate(item.createdAt)}
        </div>
      </div>
      <button
        onClick={handleDeleteClick}
        className="ml-3 p-1 rounded-md hover:bg-red-700 text-red-300 hover:text-white transition-colors flex-shrink-0"
        title="Delete history item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default HistoryItem;
