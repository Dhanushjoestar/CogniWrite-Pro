// src/components/common/TabButton.jsx
import React from 'react';

const TabButton = ({ id, icon: Icon, label, active, onClick, isSidebarOpen }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200
        ${active ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'} {/* Changed text-gray-300 to text-gray-400 for darker */}
        ${isSidebarOpen ? 'justify-start' : 'justify-center'}
      `}
    >
      {/* Icon size increased to 24 */}
      <Icon size={24} className={`${isSidebarOpen ? 'mr-3' : 'mr-0'}`} />
      {isSidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );
};

export default TabButton;
