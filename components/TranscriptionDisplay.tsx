import React, { useRef, useEffect, useState } from 'react';
import type { TranscriptionEntry, Language } from '../types';
import { ClipboardIcon, CheckIcon } from './icons/Icons';

interface TranscriptionDisplayProps {
  history: TranscriptionEntry[];
  currentInput: string;
  currentOutput: string;
  sourceLang: Language | null;
  targetLang: Language | null;
}

// WhatsApp-style message bubble component with advanced styling
const MessageBubble: React.FC<{ 
  entry: TranscriptionEntry; 
  lang: Language | null;
  isCurrent?: boolean;
}> = ({ entry, lang, isCurrent = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = entry.speaker === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Format time (WhatsApp-style, using current time)
  const formatTime = () => {
    const date = new Date();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  };

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} mb-1 px-2 sm:px-4 group relative`}>
      <div className={`flex items-end gap-2.5 max-w-[80%] sm:max-w-[70%] ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar with better styling */}
        <div 
          className={`flex-shrink-0 w-8 h-8 rounded-full ${isUser ? 'bg-gradient-to-br from-[#667781] to-[#8696A0]' : 'bg-gradient-to-br from-[#00A884] to-[#005C4B]'} hidden sm:flex items-center justify-center shadow-xl border-2 ${isUser ? 'border-[#667781]/30' : 'border-[#00A884]/30'}`}
          style={{
            boxShadow: isUser 
              ? '0 4px 12px rgba(102, 119, 129, 0.4), 0 2px 4px rgba(102, 119, 129, 0.2)' 
              : '0 4px 12px rgba(0, 168, 132, 0.4), 0 2px 4px rgba(0, 168, 132, 0.2)',
          }}
        >
          <span className="text-xs font-bold text-white">
            {isUser ? 'U' : 'T'}
          </span>
        </div>
        
        {/* Enhanced message bubble with better shadows and styling */}
        <div 
          className={`relative ${isUser ? 'bg-[#202C33]' : 'bg-[#005C4B]'} rounded-2xl ${isUser ? 'rounded-tl-sm' : 'rounded-tr-sm'} px-4 py-2.5 pb-2 ${isCurrent ? 'opacity-95 scale-[0.98]' : ''}`}
          style={{
            boxShadow: isUser
              ? '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 2px 8px rgba(0, 92, 75, 0.3), 0 1px 3px rgba(0, 92, 75, 0.2)',
          }}
        >
          {/* Refined WhatsApp-style tail */}
          <div 
            className={`absolute ${isUser ? '-left-[7px] bottom-0' : '-right-[7px] bottom-0'} w-3 h-3 ${isUser ? 'bg-[#202C33]' : 'bg-[#005C4B]'}`}
            style={{
              clipPath: isUser 
                ? 'polygon(0 0, 0 100%, 100% 100%)' 
                : 'polygon(100% 0, 100% 100%, 0 100%)',
              filter: isUser 
                ? 'drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.1))'
                : 'drop-shadow(1px 1px 2px rgba(0, 92, 75, 0.2))',
            }}
          ></div>
          
          {/* Message content */}
          <div className="relative z-10">
            {lang && (
              <div className="text-[10px] font-medium mb-1.5 opacity-75">
                <span className={`${isUser ? 'text-[#8696A0]' : 'text-[#7FD4D0]'}`}>
                  {lang.name.split(' ')[0]}
                </span>
              </div>
            )}
            <p className={`text-[15px] leading-[1.4] break-words select-text ${isUser ? 'text-[#E9EDEF]' : 'text-white'} font-normal`}>
              {entry.text}
            </p>
            
            {/* Enhanced timestamp and status with better indicators */}
            <div className={`flex items-center justify-end gap-1.5 mt-2 ${isUser ? 'text-[#667781]' : 'text-[#6FD9D5]'}`}>
              <span className="text-[11px] leading-none font-medium">{formatTime()}</span>
              {!isUser && (
                <div className="flex items-center">
                  {/* Double blue checkmarks (message read/delivered) */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 15">
                    <path d="M15.854 1.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8.5 7.793l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    <path d="M15.854 1.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8.5 7.793l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor" opacity="1"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced copy button with better positioning */}
        <button
          onClick={handleCopy}
          className={`opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-[#2A3942]/90 flex-shrink-0 backdrop-blur-sm transition-all duration-200 ${isUser ? 'order-first -mr-1' : 'order-last -ml-1'}`}
          aria-label={isCopied ? "Copied" : "Copy text"}
        >
          {isCopied ? (
            <CheckIcon className="w-4 h-4 text-[#00A884]" />
          ) : (
            <ClipboardIcon className="w-4 h-4 text-[#8696A0] hover:text-[#E9EDEF] transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
};

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  history,
  currentInput,
  currentOutput,
  sourceLang,
  targetLang
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when new messages arrive (only if user isn't manually scrolling)
  useEffect(() => {
    if (!isUserScrolling) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, currentInput, currentOutput, isUserScrolling]);

  // Detect if user is scrolling up
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isAtBottom);
    setIsUserScrolling(!isAtBottom);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolling(false);
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-grow overflow-y-auto relative scroll-smooth"
      style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23005C4B' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundSize: '60px 60px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#374151 #1F2937',
      }}
    >
      <div className="relative z-10 px-2 sm:px-4 py-6 min-h-full">
        {/* Enhanced empty state */}
        {history.length === 0 && !currentInput && !currentOutput && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-4 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#005C4B] to-[#00A884] rounded-full blur-xl opacity-20"></div>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#202C33] via-[#2A3942] to-[#202C33] rounded-full flex items-center justify-center shadow-2xl border-2 border-[#005C4B]/30">
                <svg className="w-12 h-12 sm:w-14 sm:h-14 text-[#00A884]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-4 max-w-sm">
              <h2 className="text-[#E9EDEF] font-bold text-xl sm:text-2xl">
                Ready to Translate
              </h2>
              <p className="text-[#8696A0] text-sm sm:text-base leading-relaxed px-4">
                Select your source and target languages, then start the session to begin real-time speech translation
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-[#00A884]"></div>
                <div className="w-2 h-2 rounded-full bg-[#005C4B]"></div>
                <div className="w-2 h-2 rounded-full bg-[#8696A0]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Message history */}
        {history.length > 0 && (
          <div className="space-y-1">
            {history.map((entry, index) => (
              <MessageBubble 
                key={index} 
                entry={entry} 
                lang={entry.speaker === 'user' ? sourceLang : targetLang}
              />
            ))}
          </div>
        )}

        <div ref={endOfMessagesRef} className="h-2" />
      </div>

      {/* Floating "Scroll to Bottom" button - WhatsApp style */}
      {showScrollButton && (
        <div className="absolute bottom-6 right-6 z-20 animate-fadeIn">
          <button
            onClick={scrollToBottom}
            className="group relative flex items-center justify-center w-12 h-12 bg-[#202C33] hover:bg-[#2A3942] rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
            style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            aria-label="Scroll to bottom"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00A884]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Down arrow icon */}
            <svg 
              className="w-6 h-6 text-[#8696A0] group-hover:text-[#00A884] transition-colors duration-200 relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            
            {/* Badge for new messages count (optional - can be added later) */}
            {history.length > 5 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00A884] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-[10px] font-bold">
                  {Math.min(history.length - 5, 99)}
                </span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};