import React from 'react';
import { SessionStatus } from '../types';

interface StatusIndicatorProps {
  status: SessionStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case SessionStatus.CONNECTED:
        return {
          text: 'Active',
          color: 'bg-[#00A884]',
          pulse: true,
          glow: true,
        };
      case SessionStatus.CONNECTING:
        return {
          text: 'Connecting...',
          color: 'bg-[#8696A0]',
          pulse: true,
          glow: false,
        };
      case SessionStatus.PAUSED:
        return {
          text: 'Paused',
          color: 'bg-[#8696A0]',
          pulse: false,
          glow: false,
        };
      case SessionStatus.ERROR:
        return {
          text: 'Error',
          color: 'bg-[#DC3545]',
          pulse: false,
          glow: false,
        };
      case SessionStatus.DISCONNECTED:
      default:
        return {
          text: 'Ready',
          color: 'bg-[#8696A0]',
          pulse: false,
          glow: false,
        };
    }
  };

  const { text, color, pulse, glow } = getStatusStyle();

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color} ${glow ? 'shadow-lg shadow-[#00A884]/50' : ''}`}></span>
      </span>
      <span className="text-xs text-[#8696A0] font-medium">{text}</span>
    </div>
  );
};