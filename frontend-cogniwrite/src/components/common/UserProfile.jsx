// src/components/common/UserProfile.jsx
import React, { useState } from 'react';
import {
  User,
  Settings,
  LogOut,
  ChevronUp,
  Crown,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  CreditCard,
  MoreHorizontal,
  LogIn, // Import LogIn icon
  UserPlus // Import UserPlus icon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // NEW: Import useAuth hook

const UserProfile = ({
  isSidebarOpen = true,
  // Remove default user prop, it will come from context
  // user = { name: 'John Doe', email: 'john@example.com', avatar: null, plan: 'Pro', status: 'online' },
  // NEW: Add isLoggedIn, onShowAuthModal, onLogout props
  isLoggedIn,
  onShowAuthModal,
  onLogout
}) => {
  const { user } = useAuth(); // NEW: Get user from AuthContext
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Default user data for display if not logged in or user object is null
  const displayUser = user || { name: 'Guest', email: 'guest@example.com', avatar: null, plan: 'Free', status: 'offline' };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500'; // Default to offline for guests
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'Pro':
        return {
          icon: Crown,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          label: 'Pro'
        };
      case 'Enterprise':
        return {
          icon: Shield,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          label: 'Enterprise'
        };
      case 'Free':
        return {
          icon: User,
          color: 'text-gray-400',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          label: 'Free'
        };
      default:
        return { // Default for guests/unknown
          icon: User,
          color: 'text-gray-400',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          label: 'Guest'
        };
    }
  };

  const planInfo = getPlanBadge(displayUser.plan);
  const PlanIcon = planInfo.icon;

  const menuItems = [
    { icon: User, label: 'Profile Settings', shortcut: '⌘,', action: () => console.log('Profile') },
    { icon: Bell, label: 'Notifications', action: () => console.log('Notifications') },
    { icon: Palette, label: 'Appearance', action: () => console.log('Appearance') },
    { icon: CreditCard, label: 'Billing', action: () => console.log('Billing') },
    { divider: true },
    { icon: HelpCircle, label: 'Help & Support', action: () => console.log('Help') },
    { icon: Settings, label: 'Settings', shortcut: '⌘S', action: () => console.log('Settings') },
    { divider: true },
    { icon: LogOut, label: 'Sign Out', variant: 'danger', action: onLogout } // Use onLogout prop
  ];

  // Render simplified view if sidebar is collapsed
  if (!isSidebarOpen) {
    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex justify-center">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer transition-all duration-200 hover:scale-105
                ${isLoggedIn ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-700 hover:bg-gray-600'}
              `}
              onClick={!isLoggedIn ? onShowAuthModal : () => setShowDropdown(!showDropdown)}
            >
              {displayUser.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                getInitials(displayUser.name)
              )}
            </div>
            {isLoggedIn && <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(displayUser.status)}`}></div>}
          </div>
        </div>

        {/* Collapsed Tooltip */}
        {isHovered && (
          <div className="absolute left-full ml-2 bottom-0 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-600 z-50 whitespace-nowrap">
            <div className="font-medium text-sm">{displayUser.name}</div>
            <div className="text-xs text-gray-400">{displayUser.email}</div>
            {isLoggedIn && (
              <div className={`inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs ${planInfo.bg} ${planInfo.color} ${planInfo.border} border`}>
                <PlanIcon className="w-3 h-3" />
                <span>{planInfo.label}</span>
              </div>
            )}
            {!isLoggedIn && (
              <button
                onClick={onShowAuthModal}
                className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors"
              >
                <LogIn size={16} /> <span>Login / Register</span>
              </button>
            )}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-slate-900 border-l border-b border-slate-600 transform rotate-45"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render expanded view
  return (
    <div className="relative">
      {!isLoggedIn ? (
        // Login/Register Button when not logged in
        <button
          onClick={onShowAuthModal}
          className="w-full flex items-center justify-center gap-3 p-4 bg-indigo-600 rounded-2xl border border-indigo-500 cursor-pointer transition-all duration-200 hover:bg-indigo-700 hover:border-indigo-600 shadow-md"
        >
          <LogIn size={24} className="flex-shrink-0" />
          <span className="font-semibold text-lg">Login / Register</span>
          <UserPlus size={24} className="flex-shrink-0" />
        </button>
      ) : (
        // User Profile when logged in
        <div
          className={`flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-600/30 cursor-pointer transition-all duration-200 ${
            showDropdown
              ? 'bg-slate-700/70 border-slate-500/50 shadow-lg'
              : 'hover:bg-slate-700/50 hover:border-slate-500/50'
          }`}
          onClick={() => setShowDropdown(!showDropdown)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {displayUser.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-lg">{getInitials(displayUser.name)}</span>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(displayUser.status)} shadow-sm`}></div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <div className="text-sm font-semibold text-white truncate">{displayUser.name}</div>
              <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${planInfo.bg} ${planInfo.color} ${planInfo.border} border`}>
                <PlanIcon className="w-3 h-3" />
                <span>{planInfo.label}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 truncate">{displayUser.email}</div>
          </div>

          {/* Dropdown Indicator */}
          <div className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}


      {/* Dropdown Menu */}
      {showDropdown && isLoggedIn && ( // Only show dropdown if logged in
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 rounded-2xl shadow-2xl border border-slate-600/50 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {displayUser.avatar ? (
                    <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    getInitials(displayUser.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{displayUser.name}</div>
                  <div className="text-xs text-gray-400 truncate">{displayUser.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return <div key={index} className="h-px bg-slate-700/50 my-2" />;
                }

                const ItemIcon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-800/50 transition-colors ${
                      item.variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <ItemIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs text-gray-500">{item.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
              <div className="text-xs text-gray-400 text-center">
                CogniWrite Pro v2.1.0
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
