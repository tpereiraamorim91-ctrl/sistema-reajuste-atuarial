
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, name, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="block w-full bg-slate-900/70 border border-slate-600 rounded-lg shadow-sm py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
        {...props}
      />
    </div>
  );
};
