
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | { value: string; label: string })[];
}

export const Select: React.FC<SelectProps> = ({ label, name, options, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="block w-full bg-slate-900/70 border border-slate-600 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
        {...props}
      >
        {options.map((option, index) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          return <option key={index} value={value}>{label}</option>;
        })}
      </select>
    </div>
  );
};
