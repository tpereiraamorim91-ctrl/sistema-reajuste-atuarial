
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`flex items-center justify-center w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
