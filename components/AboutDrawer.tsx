import React, { useState, useEffect } from 'react';

interface AboutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDrawer: React.FC<AboutDrawerProps> = ({ isOpen, onClose }) => {
  const titles = ['AI Engineer', 'Software Developer'];
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-gradient-to-b from-[#202C33] to-[#111B21] shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/10 bg-[#005C4B]/20 backdrop-blur-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#005C4B]/30 via-transparent to-[#00A884]/30 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h2 className="text-[#E9EDEF] font-bold text-xl">About</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              aria-label="Close drawer"
            >
              <svg
                className="w-6 h-6 text-[#8696A0] hover:text-[#E9EDEF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] px-6 py-6 space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-white/10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00A884] to-[#005C4B] rounded-full blur-xl opacity-50"></div>
              {/* Profile Photo */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-[#202C33] bg-gradient-to-br from-[#00A884] to-[#005C4B] flex items-center justify-center">
                <img 
                  src="/profile.jpg?v=1" 
                  alt="Akash S"
                  className="w-full h-full object-cover absolute inset-0 z-10"
                  onError={(e) => {
                    console.error('Profile image failed to load from /profile.jpg');
                    // Try alternative path
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src.includes('profile.jpg')) {
                      img.src = './public/profile.jpg';
                    } else {
                      // Hide image on final failure
                      img.style.display = 'none';
                    }
                  }}
                  onLoad={() => console.log('Profile image loaded successfully')}
                />
                {/* Fallback initials - always visible as background */}
                <span className="text-4xl font-bold text-white">AS</span>
              </div>
            </div>
            <div>
              <h3 className="text-[#E9EDEF] font-bold text-2xl mb-2">Akash S</h3>
              
              {/* Animated Title with gradient and effects */}
              <div className="relative h-8 overflow-hidden">
                <p 
                  className={`text-sm font-semibold bg-gradient-to-r from-[#00A884] via-[#00D9A5] to-[#00A884] bg-clip-text text-transparent transition-all duration-500 ${
                    isAnimating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
                  }`}
                  style={{
                    backgroundSize: '200% auto',
                    animation: 'gradient-shift 3s ease infinite',
                  }}
                >
                  {titles[currentTitleIndex]}
                </p>
                
                {/* Animated underline */}
                <div 
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#00A884] to-transparent transition-all duration-500 ${
                    isAnimating ? 'w-0 opacity-0' : 'w-3/4 opacity-100'
                  }`}
                />
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className={`absolute top-0 left-1/4 w-1 h-1 bg-[#00A884] rounded-full transition-opacity duration-300 ${
                      isAnimating ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{ animation: 'sparkle 2s ease-in-out infinite' }}
                  />
                  <div 
                    className={`absolute top-0 right-1/4 w-1 h-1 bg-[#00D9A5] rounded-full transition-opacity duration-300 ${
                      isAnimating ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{ animation: 'sparkle 2s ease-in-out infinite 0.5s' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes gradient-shift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            
            @keyframes sparkle {
              0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
              50% { transform: scale(1) rotate(180deg); opacity: 1; }
            }
          `}</style>

          {/* About Project */}
          <div className="space-y-3">
            <h4 className="text-[#00A884] font-semibold text-sm uppercase tracking-wider">
              About VoxBridge
            </h4>
            <p className="text-[#E9EDEF] text-sm leading-relaxed">
              A real-time speech translation application supporting 60+ languages worldwide. 
              Powered by advanced AI for accurate translations and natural text-to-speech.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-[#00A884] font-semibold text-sm uppercase tracking-wider">
              Features
            </h4>
            <ul className="space-y-2">
              {[
                '🌍 60+ International Languages',
                '🎤 Real-time Speech Recognition',
                '🗣️ Natural Text-to-Speech',
                '💬 WhatsApp-style Interface',
                '📱 Mobile Responsive Design',
                '🔄 Instant Translation',
              ].map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[#E9EDEF] text-sm"
                >
                  <span className="flex-shrink-0">{feature.split(' ')[0]}</span>
                  <span className="text-[#8696A0]">{feature.substring(3)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div className="space-y-3">
            <h4 className="text-[#00A884] font-semibold text-sm uppercase tracking-wider">
              Built With
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                'React',
                'TypeScript',
                'Tailwind CSS',
                'Web Speech API',
                'Google TTS',
                'Flask',
                'Python',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-[#005C4B]/30 text-[#00A884] rounded-full text-xs font-medium border border-[#00A884]/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-[#00A884] font-semibold text-sm uppercase tracking-wider">
              Connect
            </h4>
            <div className="space-y-2">
              {/* Email - Update href with your email */}
              <a
                href="mailto:akashsofficial62@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#2A3942] hover:bg-[#374151] transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-[#00A884] group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[#E9EDEF] text-sm">Email</span>
              </a>
              
              {/* GitHub - Update href with your GitHub profile */}
              <a
                href="https://github.com/Akash-62"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#2A3942] hover:bg-[#374151] transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-[#00A884] group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-[#E9EDEF] text-sm">GitHub</span>
              </a>
              
              {/* LinkedIn - Update href with your LinkedIn profile */}
              <a
                href="https://www.linkedin.com/in/akash-s62/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#2A3942] hover:bg-[#374151] transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-[#00A884] group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-[#E9EDEF] text-sm">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Version */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-[#8696A0] text-xs">
              Version 1.0.0 • Built with ❤️ by Akash S
            </p>
            <p className="text-[#667781] text-xs mt-1">
              © 2025 VoxBridge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
