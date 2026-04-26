import React from 'react';

export default function Logo({ variant = 'full', size = 'md', className = '' }) {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const iconSize = iconSizes[size];
  const textSize = textSizes[size];

  return (
    <div className={`flex items-center gap-3 transition-transform duration-300 hover:scale-105 ${className}`}>
      <svg
        className={`${iconSize} text-blue-600 dark:text-blue-400`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Abstract "E" with integrated checkmark */}
        <path d="M4 3v18" /> {/* Vertical line */}
        <path d="M4 3h10" /> {/* Top bar */}
        <path d="M4 12h8" /> {/* Middle bar */}
        <path d="M4 21l3-3 7 7" /> {/* Bottom bar as checkmark */}
        {/* Subtle AI element - small circuit node */}
        <circle cx="18" cy="6" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="21" cy="9" r="1" fill="currentColor" opacity="0.4" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col">
          <h1 className={`${textSize} font-bold text-blue-600 dark:text-blue-400 tracking-tight`}>
            Electo
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            AI Election Guide
          </p>
        </div>
      )}
    </div>
  );
}