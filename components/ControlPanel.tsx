import React from 'react';
import { SessionStatus, type Language } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { MicrophoneIcon, StopIcon, PauseIcon, PlayIcon } from './icons/Icons';
import { InteractiveHoverButton } from './ui/interactive-hover-button';

interface ControlPanelProps {
  status: SessionStatus;
  sourceLang: Language | null;
  targetLang: Language | null;
  onSourceLangChange: (lang: Language) => void;
  onTargetLangChange: (lang: Language) => void;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  supportedLanguages: Language[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  onStart,
  onStop,
  onPause,
  onResume,
  supportedLanguages,
}) => {
  const isSessionActive = status === SessionStatus.CONNECTING || status === SessionStatus.CONNECTED || status === SessionStatus.PAUSED;
  const areSameLanguages = sourceLang && targetLang && sourceLang.code === targetLang.code;
  const canStart = !!sourceLang && !!targetLang && !areSameLanguages;
  
  // Witty messages for same language selection
  const wittyMessages = [
    "🤔 That's just talking to yourself with extra steps!",
    "💭 Translation 101: You need two different languages, genius!",
    "🎭 Pro tip: Pick different languages for actual translation magic",
    "🙃 Same language? That's called a conversation, not translation!",
    "🤷 Translating to the same language? Bold strategy!",
    "🎪 For best results, try selecting two distinct languages",
    "🧠 Plot twist: Translation requires different languages!",
  ];
  
  const getRandomMessage = () => wittyMessages[Math.floor(Math.random() * wittyMessages.length)];

  return (
    <div className="bg-[#202C33] border-t border-[#313D45] px-4 py-3 flex-shrink-0">
      {/* Language selection */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="flex-1">
          <LanguageSelector
            id="source-lang"
            label="Speak in"
            selectedLanguage={sourceLang}
            onLanguageChange={onSourceLangChange}
            languages={supportedLanguages}
            disabled={isSessionActive}
          />
        </div>
        <div className="flex-1">
          <LanguageSelector
            id="target-lang"
            label="Translate to"
            selectedLanguage={targetLang}
            onLanguageChange={onTargetLangChange}
            languages={supportedLanguages}
            disabled={isSessionActive}
          />
        </div>
      </div>

      {/* Warning message for same language selection */}
      {areSameLanguages && !isSessionActive && (
        <div className="mb-3 animate-slideUp">
          <div className="bg-gradient-to-r from-[#DC3545]/10 to-[#E63946]/10 border border-[#DC3545]/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[#DC3545]/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-[#DC3545] text-sm">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-[#E9EDEF] text-sm font-medium mb-1">
                  {getRandomMessage()}
                </p>
                <p className="text-[#8696A0] text-xs">
                  Select two different languages to enable translation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-style input bar with centered start button */}
      <div className="flex items-center justify-center gap-2">
        {!isSessionActive ? (
          <div className="flex justify-center w-full">
            <InteractiveHoverButton
              text="Start Session"
              onClick={onStart}
              disabled={!canStart}
              className="max-w-md w-full sm:w-auto sm:min-w-[300px]"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 max-w-2xl mx-auto">
            {status === SessionStatus.CONNECTED && (
              <button 
                onClick={onPause} 
                className="flex-1 flex items-center justify-center gap-2 bg-[#2A3942] hover:bg-[#3A4A52] text-[#E9EDEF] font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PauseIcon className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            {status === SessionStatus.PAUSED && (
              <button 
                onClick={onResume} 
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#005C4B] to-[#00A884] hover:from-[#006B5A] hover:to-[#00B894] text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Resume</span>
              </button>
            )}
            <button
              onClick={onStop}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#DC3545] to-[#E63946] hover:from-[#C82333] hover:to-[#D32F2F] text-white font-semibold py-3.5 px-4 rounded-xl min-w-[120px] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <StopIcon className="w-5 h-5" />
              <span>End</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
