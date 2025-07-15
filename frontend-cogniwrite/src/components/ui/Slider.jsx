// src/components/ui/Slider.jsx
import React from 'react';

const Slider = ({ label, value, onChange, min, max, step, tooltip, readOnly = false, colorClass = 'bg-gray-700' }) => {
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
      <input
        type="range"
        id={label}
        value={value}
        onChange={readOnly ? null : onChange}
        min={min}
        max={max}
        step={step}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorClass} accent-indigo-500`}
        disabled={readOnly}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span className="text-white font-bold">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;
