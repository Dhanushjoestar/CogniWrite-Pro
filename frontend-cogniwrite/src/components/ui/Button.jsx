import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon: Icon,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white'
  };
  
  const sizes = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4',
    lg: 'py-4 px-6 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default Button;