import React from 'react';

export const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-voxbridge-dark-alt to-voxbridge-dark text-center p-3 sm:p-4 md:p-6 border-t border-voxbridge-blue/20">
    <div className="flex flex-col items-center space-y-1 sm:space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-voxbridge-blue rounded-full animate-pulse"></div>
        <p className="text-xs sm:text-sm text-voxbridge-white font-medium">
          © 2025 VoxBridge
        </p>
        <div className="w-2 h-2 bg-voxbridge-teal rounded-full animate-pulse delay-150"></div>
      </div>
      <p className="text-xs text-voxbridge-light-gray animate-fade-in">
        Developed with ❤️ by <span className="text-voxbridge-blue font-semibold">Akash S</span>
      </p>
    </div>
  </footer>
);