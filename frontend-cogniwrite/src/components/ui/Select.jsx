// src/components/ui/Select.jsx
import React from 'react';

const Select = ({ label, value, onChange, options, placeholder, tooltip }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={label} className="block text-sm font-medium text-gray-300">
        {label}
        {tooltip && (
          <span className="ml-2 text-gray-500 text-xs cursor-help" title={tooltip}>
            (?)
          </span>
        )}
      </label>
      <select
        id={label}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
