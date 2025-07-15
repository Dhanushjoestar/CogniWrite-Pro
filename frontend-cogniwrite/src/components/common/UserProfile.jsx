import React from 'react';
import { User, Settings } from 'lucide-react';

const UserProfile = ({ isSidebarOpen = true, user = { name: 'John Doe', email: 'john@example.com' } }) => (
  <div className={`flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer ${isSidebarOpen ? '' : 'justify-center'}`}>
    <User size={20} className="text-gray-300" />
    {isSidebarOpen && (
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{user.name}</div>
        <div className="text-xs text-gray-400">{user.email}</div>
      </div>
    )}
    {isSidebarOpen && <Settings size={16} className="text-gray-400" />}
  </div>
);

export default UserProfile;