import React from 'react';

interface ClearButtonProps {
  onClick: () => void;
  disabled?: boolean;
  hasContent: boolean;
}

export const ClearButton: React.FC<ClearButtonProps> = ({ onClick, disabled = false, hasContent }) => {
  if (!hasContent) return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-full hover:bg-[#2A3942] disabled:opacity-50 disabled:cursor-not-allowed group relative"
      title="Clear conversation"
    >
      <svg 
        className="w-5 h-5 text-[#8696A0] hover:text-[#E9EDEF]" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#2A3942] text-[#E9EDEF] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
        Clear conversation
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2A3942]"></div>
      </div>
    </button>
  );
};