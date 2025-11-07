import React, { useState, useEffect } from 'react';
import { useVoxBridgeTranslate } from './hooks/useVoxBridgeTranslate';
import type { Language } from './types';
import { SessionStatus } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { StatusIndicator } from './components/StatusIndicator';
import { ErrorModal } from './components/ErrorModal';
import { MicrophoneVisualizer } from './components/MicrophoneVisualizer';
import { ClearButton } from './components/ClearButton';
import { NetworkInfo } from './components/NetworkInfo';
import { KannadaVoiceSelector } from './components/KannadaVoiceSelector';


const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language | null>(() => {
    // 1. Try loading from localStorage first
    try {
      const saved = localStorage.getItem('translator_sourceLang');
      if (saved) {
        const foundLang = SUPPORTED_LANGUAGES.find(l => l.code === saved);
        if (foundLang) return foundLang;
      }
    } catch (error) {
      console.error("Failed to read source language from localStorage", error);
    }

    // 2. If not in localStorage, try auto-detecting from browser settings
    try {
      const userLangCode = navigator.language; // e.g., "en-US"
      if (userLangCode) {
        // Try for an exact match first (e.g., 'en-US' -> 'en-US')
        const exactMatch = SUPPORTED_LANGUAGES.find(l => l.code === userLangCode);
        if (exactMatch) return exactMatch;

        // If no exact match, try matching the primary language (e.g., 'en' from 'en-US')
        const primaryLang = userLangCode.split('-')[0];
        const primaryMatch = SUPPORTED_LANGUAGES.find(l => l.code.split('-')[0] === primaryLang);
        if (primaryMatch) return primaryMatch;
      }
    } catch (error) {
      console.error("Failed to auto-detect language from browser settings", error);
    }

    // 3. Fallback to null
    return null;
  });
  
  const [targetLang, setTargetLang] = useState<Language | null>(() => {
    try {
      const saved = localStorage.getItem('translator_targetLang');
      if (saved) {
        return SUPPORTED_LANGUAGES.find(l => l.code === saved) || null;
      }
    } catch (error) {
      console.error("Failed to read target language from localStorage", error);
    }
    return null;
  });

  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const {
    status,
    error,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    clearError,
    clearHistory,
    transcriptionHistory,
    currentInputTranscription,
    currentOutputTranscription,
    analyserNode,
    getIndianAIStats,
  } = useVoxBridgeTranslate();

  // Show voice selector for Kannada language
  useEffect(() => {
    const shouldShowVoiceSelector = 
      (sourceLang?.code === 'kn' || targetLang?.code === 'kn') && 
      status === SessionStatus.CONNECTED;
    setShowVoiceSelector(shouldShowVoiceSelector);
  }, [sourceLang, targetLang, status]);

  useEffect(() => {
    try {
      if (sourceLang) {
        localStorage.setItem('translator_sourceLang', sourceLang.code);
      }
      if (targetLang) {
        localStorage.setItem('translator_targetLang', targetLang.code);
      }
    } catch (error) {
      console.error("Failed to save languages to localStorage", error);
    }
  }, [sourceLang, targetLang]);

  const handleStart = () => {
    if (sourceLang && targetLang) {
      if(error) clearError();
      startSession(sourceLang, targetLang);
    }
  };

  const handleStop = () => {
    endSession();
  };
  



  return (
    <div className="flex flex-col h-screen bg-[#0B141A] overflow-hidden font-sans" aria-live="polite">
      {/* Enhanced WhatsApp-style Header with Glassmorphism */}
      <div className="flex-shrink-0">
        <Header status={status} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full h-full relative">
          
          {/* Top Bar - WhatsApp-style with glassmorphism */}
          <div className="bg-[#202C33]/80 backdrop-blur-md border-b border-white/10 px-3 py-2.5 flex items-center justify-between flex-shrink-0 shadow-lg z-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <ClearButton 
                onClick={clearHistory}
                disabled={status === SessionStatus.CONNECTING}
                hasContent={transcriptionHistory.length > 0 || currentInputTranscription !== '' || currentOutputTranscription !== ''}
              />
              <div className="hidden sm:block">
                <NetworkInfo />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <MicrophoneVisualizer analyserNode={analyserNode} />
              <StatusIndicator status={status} />
            </div>
          </div>
          
          {/* Voice Selector for Kannada */}
          {showVoiceSelector && (
            <div className="bg-[#202C33] border-b border-[#2A3942]/60 px-3 py-2 backdrop-blur-md z-20">
              <KannadaVoiceSelector
                onVoiceSelect={setSelectedVoice}
                currentVoice={selectedVoice}
              />
            </div>
          )}
          
          {/* Chat Area with WhatsApp background pattern */}
          <div 
            className="flex-1 overflow-hidden relative"
            style={{
              background: '#0B141A',
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23005C4B' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
              backgroundSize: '60px 60px',
            }}
          >
            <TranscriptionDisplay
              history={transcriptionHistory}
              currentInput={currentInputTranscription}
              currentOutput={currentOutputTranscription}
              sourceLang={sourceLang}
              targetLang={targetLang}
            />
          </div>
          
          {/* Control Panel - Enhanced WhatsApp-style bottom bar */}
          <div className="bg-gradient-to-t from-[#202C33] via-[#202C33] to-[#202C33]/95 border-t border-[#2A3942] shadow-2xl flex-shrink-0 backdrop-blur-lg">
            <ControlPanel
              status={status}
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceLangChange={setSourceLang}
              onTargetLangChange={setTargetLang}
              onStart={handleStart}
              onStop={handleStop}
              onPause={pauseSession}
              onResume={resumeSession}
              supportedLanguages={SUPPORTED_LANGUAGES}
            />
          </div>
        </div>
      </main>

      {/* Error Modal with enhanced styling */}
      {error && <ErrorModal message={error} onClose={clearError} />}
    </div>
  );
};

export default App;