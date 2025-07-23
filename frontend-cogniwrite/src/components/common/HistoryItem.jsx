// src/components/common/HistoryItem.jsx
import React, { useState } from 'react';
import {
  Trash2,
  MessageSquare,
  TestTube,
  FileCheck,
  Clock,
  MoreVertical,
  Copy,
  Share2,
  Eye,
  AlertTriangle // Import AlertTriangle for the confirmation modal
} from 'lucide-react';

const HistoryItem = ({ item, onClick, onDelete, compact = false }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(diffDays > 365 ? { year: 'numeric' } : {})
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return isoString;
    }
  };

  const getItemTypeInfo = () => {
    // Ensure item.type is a string and default to 'generate' if null/undefined
    const type = item.type || 'generate';
    switch (type) {
      case 'generate':
        return {
          icon: MessageSquare,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Generate'
        };
      case 'ab-test':
        return {
          icon: TestTube,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
          label: 'A/B Test'
        };
      case 'review':
        return {
          icon: FileCheck,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/10',
          borderColor: 'border-indigo-500/20',
          label: 'Review'
        };
      default:
        return {
          icon: MessageSquare,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          label: 'Content'
        };
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete?.(item.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt)
      .then(() => console.log('Prompt copied to clipboard!'))
      .catch(err => console.error('Failed to copy prompt:', err));
  };

  const typeInfo = getItemTypeInfo();
  const Icon = typeInfo.icon;

  if (compact) {
    return (
      <div
        className={`group relative p-2 rounded-lg cursor-pointer transition-all duration-200 border ${typeInfo.borderColor} ${typeInfo.bgColor} hover:bg-slate-700/50 hover:border-slate-500/50`}
        onClick={() => onClick?.(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${typeInfo.bgColor}`}>
            <Icon className={`w-3 h-3 ${typeInfo.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {item.prompt}
            </div>
            <div className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
              <Clock className="w-2 h-2" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
          {isHovered && (
            <button
              onClick={handleDeleteClick}
              className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isHovered
          ? 'bg-slate-700/50 border-slate-500/50 transform scale-[1.02]'
          : `${typeInfo.bgColor} ${typeInfo.borderColor}`
      } hover:shadow-lg`}
      onClick={() => onClick?.(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Content */}
      <div className="flex items-start space-x-3">
        {/* Type Icon */}
        <div className={`p-2 rounded-lg ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
          <Icon className={`w-4 h-4 ${typeInfo.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.color} border ${typeInfo.borderColor}`}>
              {typeInfo.label}
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>

          <div className="text-sm font-medium text-white mb-1 line-clamp-2">
            {item.prompt}
          </div>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {item.platform && (
              <span className="flex items-center space-x-1">
                <span>Platform:</span>
                <span className="text-gray-300">{item.platform}</span>
              </span>
            )}
            {item.model && (
              <span className="flex items-center space-x-1">
                <span>Model:</span>
                <span className="text-gray-300">{item.model}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center space-x-1 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-slate-600/50 text-gray-400 hover:text-white transition-colors"
            title="Copy prompt"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-slate-600/50 text-gray-400 hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex items-center justify-center z-10">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 shadow-xl max-w-xs mx-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Delete History Item?</h4>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={cancelDelete}
                className="flex-1 px-3 py-2 text-sm bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover overlay for better visual feedback */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-200 ${
        isHovered ? 'ring-2 ring-slate-400/20' : ''
      }`} />
    </div>
  );
};

export default HistoryItem;
