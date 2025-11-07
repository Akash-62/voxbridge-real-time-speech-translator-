import React, { useState } from 'react';
import { StatusIndicator } from './StatusIndicator';
import { AboutDrawer } from './AboutDrawer';
import { SessionStatus } from '../types';

interface HeaderProps {
  status?: SessionStatus;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="relative px-5 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-[#202C33]/70 border-b border-white/10 shadow-2xl">
    {/* Glassmorphism overlay effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#005C4B]/20 via-transparent to-[#00A884]/20 pointer-events-none"></div>
    
    {/* Content */}
    <div className="relative z-10 flex items-center justify-between w-full">
      {/* Left: Avatar + Title + Status */}
      <div className="flex flex-row items-center gap-4">
        {/* Avatar ring if active with glow effect */}
        <div className={`relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full ${
          status === SessionStatus.CONNECTED 
            ? 'ring-2 ring-[#00A884] shadow-[0_0_20px_rgba(0,168,132,0.5)]' 
            : status === SessionStatus.CONNECTING 
            ? 'ring-2 ring-[#8696A0] shadow-lg' 
            : 'shadow-lg'
        } bg-gradient-to-br from-[#005C4B] to-[#00A884]`}>
          <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-[#E9EDEF] font-bold text-lg leading-snug truncate whitespace-nowrap drop-shadow-md">
            VoxBridge Translator
          </h1>
          <div className="flex items-center gap-2 text-xs">
            {/* Coloured status dot with glow */}
            <span className={`inline-block w-2 h-2 rounded-full ${
              status === SessionStatus.CONNECTED 
                ? 'bg-[#00A884] shadow-[0_0_8px_rgba(0,168,132,0.8)]' 
                : status === SessionStatus.CONNECTING 
                ? 'bg-[#8696A0]' 
                : status === SessionStatus.PAUSED
                ? 'bg-[#FFA500] shadow-[0_0_8px_rgba(255,165,0,0.8)]'
                : 'bg-[#444c53]'
            }`}></span>
            <span className="text-[#8696A0]">{
              status === SessionStatus.CONNECTED ? 'Active'
              : status === SessionStatus.CONNECTING ? 'Connecting...'
              : status === SessionStatus.PAUSED ? 'Paused'
              : 'Ready'
            }</span>
          </div>
        </div>
      </div>

      {/* Right side: status dot + menu */}
      <div className="flex items-center gap-3">
        {status && <StatusIndicator status={status} />}
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-full hover:bg-white/10 flex items-center justify-center focus:outline-none transition-all duration-200 backdrop-blur-sm"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-[#8696A0] hover:text-[#E9EDEF] transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5.5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18.5" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  </header>

      {/* About Drawer */}
      <AboutDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};