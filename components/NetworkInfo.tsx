import React from 'react';

export const NetworkInfo: React.FC = () => {
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (isLocalhost) {
    return null; // No need to show info on localhost
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2A3942]/50 border border-[#005C4B]/30 rounded-lg backdrop-blur-sm">
      <div className="w-2 h-2 bg-[#00A884] rounded-full"></div>
      <span className="text-xs text-[#8696A0] font-medium">Network Active</span>
    </div>
  );
};