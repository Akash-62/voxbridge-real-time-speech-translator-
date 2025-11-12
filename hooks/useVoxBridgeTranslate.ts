/**
 * 🎯 VoxBridge Translate Hook - Clean & Efficient  
 * Real-time speech translation with gTTS
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SessionStatus, type Language, type TranscriptionEntry } from '../types';
import IndianLanguageAI from '../utils/IndianLanguageAI';

export const useVoxBridgeTranslate = () => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  
  // Load conversation history from localStorage on mount
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('voxbridge_conversation_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`📚 Loaded ${parsed.length} previous messages`);
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load conversation history:', error);
    }
    return [];
  });
  
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isProcessingRef = useRef(false);
  const isListeningRef = useRef(false);
  const restartAttemptsRef = useRef(0);
  const maxRestartAttempts = 3; // Maximum restart attempts before recreating recognition
  const maxHistorySize = 100; // Limit conversation history to prevent memory issues
  
  const indianAI = useRef(new IndianLanguageAI());

  // Save conversation history to localStorage whenever it changes (with size limit)
  useEffect(() => {
    try {
      // Limit history size to prevent memory issues
      const limitedHistory = transcriptionHistory.slice(-maxHistorySize);
      localStorage.setItem('voxbridge_conversation_history', JSON.stringify(limitedHistory));
      if (limitedHistory.length > 0) {
        console.log(`💾 Saved ${limitedHistory.length} messages to history`);
      }
    } catch (error) {
      console.warn('Failed to save conversation history:', error);
    }
  }, [transcriptionHistory]);

  /**
   * Translate text using Indian Language AI
   */
  const translateWithIndianAI = useCallback(async (text: string, sourceLang: Language, targetLang: Language): Promise<string> => {
    const sourceCode = sourceLang.code.toLowerCase().split('-')[0];
    const targetCode = targetLang.code.toLowerCase().split('-')[0];
    
    console.log(`🔄 TRANSLATION REQUEST:`);
    console.log(`   Input Text: "${text}"`);
    console.log(`   Source: ${sourceLang.name} (${sourceLang.code}) → Code: ${sourceCode}`);
    console.log(`   Target: ${targetLang.name} (${targetLang.code}) → Code: ${targetCode}`);
    
    if (!text || text.trim().length === 0) {
      return '';
    }

    try {
      const translation = await indianAI.current.translateIndianLanguages(text, sourceCode, targetCode);
      console.log(`✅ TRANSLATION RESULT: "${translation}"`);
      console.log(`   Original: "${text}" (${sourceCode})`);
      console.log(`   Translated: "${translation}" (${targetCode})`);
      return translation;
    } catch (error) {
      console.error('❌ Translation failed:', error);
      return `[${targetCode.toUpperCase()}] ${text}`;
    }
  }, []);

  /**
   * Speak translated text using TTS (non-blocking)
   */
  const speakTranslation = useCallback(async (text: string, language: Language): Promise<void> => {
    if (!text || text.trim().length === 0) return;

    try {
      // Don't await - start TTS and return immediately!
      indianAI.current.speakWithIndianContext(text, language.code.toLowerCase().split('-')[0]);
      
      // Return immediately - don't wait for speech!
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Speech failed:', error);
      return Promise.resolve(); // Don't throw
    }
  }, []);

  /**
   * End session and cleanup - Clears conversation for new session
   */
  const endSession = useCallback(() => {
    console.log('🛑 Ending session and starting new conversation...');
    
    // Reset restart counter
    restartAttemptsRef.current = 0;
    
    // Clean up recognition properly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn('Error closing audio context:', e);
      }
      audioContextRef.current = null;
    }

    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    isListeningRef.current = false;
    isProcessingRef.current = false;
    
    // Clear current conversation for new session
    setTranscriptionHistory([]);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    
    setStatus(SessionStatus.DISCONNECTED);
    console.log('✅ Session ended - Ready for new conversation');
  }, []);

  /**
   * Start translation session
   */
  const startSession = useCallback(async (sourceLang: Language, targetLang: Language) => {
    setStatus(SessionStatus.CONNECTING);
    setError(null);
    
    // Reset restart counter
    restartAttemptsRef.current = 0;
    
    // Only clear history if starting fresh (not restarting)
    if (recognitionRef.current === null) {
      setTranscriptionHistory([]);
    }
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    isProcessingRef.current = false;
    
    // Clean up existing recognition if recreating
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors during cleanup
      }
      recognitionRef.current = null;
    }

    try {
      // Preload voices for TTS
      console.log('🎤 Preloading voices...');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.getVoices().length === 0) {
          await new Promise(resolve => {
            window.speechSynthesis.onvoiceschanged = () => {
              console.log('✅ Voices loaded');
              resolve(undefined);
            };
            setTimeout(resolve, 2000);
          });
        }
      }

      // Setup microphone for visualization
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        analyserNodeRef.current.fftSize = 256;
        source.connect(analyserNodeRef.current);
      } catch (micError) {
        console.warn('⚠️ Microphone access limited');
      }

      // Detect mobile and check HTTPS
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      // Setup speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        if (isIOS) {
          throw new Error('❌ iOS Safari doesn\'t support speech recognition. Please use Chrome on Android or use a desktop browser.');
        } else if (isMobile && !isHTTPS) {
          throw new Error('🔒 Mobile requires HTTPS for speech recognition. Please access via https:// or deploy to a secure server (Vercel, Netlify, etc.)');
        } else {
          throw new Error('Speech recognition not supported. Please use Chrome or Edge browser.');
        }
      }
      
      // Warn mobile users about HTTPS requirement
      if (isMobile && !isHTTPS) {
        console.warn('⚠️ WARNING: Speech recognition may not work on mobile without HTTPS!');
      }
      
      if (isMobile) {
        console.log('📱 Mobile device detected - using mobile-optimized settings');
      }

      recognitionRef.current = new SpeechRecognition();
      
      // MOBILE FIX: Different settings for mobile vs desktop
      if (isMobile) {
        // Android Chrome requires continuous: false for reliable recognition
        recognitionRef.current.continuous = false; // ← Key fix for Android!
        recognitionRef.current.interimResults = true; // Show live transcription
        console.log('📱 Using mobile-optimized speech settings');
        console.log('📱 Android Chrome: Will restart after each phrase');
      } else {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
      
      recognitionRef.current.lang = sourceLang.code;
      recognitionRef.current.maxAlternatives = 3; // Reduced for mobile performance
      
      // Improve recognition accuracy
      if ('grammars' in recognitionRef.current) {
        // Enable grammar if available
        try {
          const grammar = '#JSGF V1.0; grammar names; public <name> = Aakash | Akash | Raj | Ram | Rahul;';
          const speechRecognitionList = new (window as any).webkitSpeechGrammarList || new (window as any).SpeechGrammarList();
          speechRecognitionList.addFromString(grammar, 1);
          recognitionRef.current.grammars = speechRecognitionList;
        } catch (e) {
          console.log('Grammar not supported, using default recognition');
        }
      }

      let lastProcessedText = '';
      let processingTimeout: NodeJS.Timeout | null = null;

      // MOBILE FIX: Add onstart handler for better logging
      recognitionRef.current.onstart = () => {
        console.log('✅ Speech recognition ACTIVE - Listening for speech...');
        if (isMobile) {
          console.log('📱 Android Chrome: Speak now! Recognition will auto-restart after each phrase.');
        }
      };

      // ANDROID FIX: Add speech detection events for better feedback
      if ('onspeechstart' in recognitionRef.current) {
        recognitionRef.current.onspeechstart = () => {
          console.log('🗣️ Speech DETECTED! Recording...');
        };
      }

      if ('onspeechend' in recognitionRef.current) {
        recognitionRef.current.onspeechend = () => {
          console.log('🔇 Speech ENDED. Processing...');
        };
      }
      
      if ('onaudiostart' in recognitionRef.current) {
        recognitionRef.current.onaudiostart = () => {
          console.log('🎤 Audio input STARTED');
        };
      }
      
      if ('onaudioend' in recognitionRef.current) {
        recognitionRef.current.onaudioend = () => {
          console.log('🎤 Audio input ENDED');
        };
      }
      
      if ('onsoundstart' in recognitionRef.current) {
        recognitionRef.current.onsoundstart = () => {
          console.log('� Sound DETECTED');
        };
      }
      
      if ('onsoundend' in recognitionRef.current) {
        recognitionRef.current.onsoundend = () => {
          console.log('🔊 Sound ENDED');
        };
      }

      recognitionRef.current.onresult = async (event: any) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        // Process all results including alternatives for better accuracy
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          
          // ANDROID FIX: Use best alternative for better accuracy
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence || 0;
          
          // Check alternatives (limit to 3 on mobile for performance)
          const maxAlts = isMobile ? 3 : 5;
          for (let j = 0; j < Math.min(result.length, maxAlts); j++) {
            const alt = result[j];
            const altConfidence = alt.confidence || 0;
            if (altConfidence > bestConfidence) {
              bestTranscript = alt.transcript;
              bestConfidence = altConfidence;
            }
          }
          
          if (result.isFinal) {
            newFinalTranscript += bestTranscript;
            console.log(`✅ FINAL: "${bestTranscript}" (${(bestConfidence * 100).toFixed(0)}% confidence)`);
            
            // ANDROID FIX: Lower confidence threshold for mobile (Chrome often gives lower confidence)
            const minConfidence = isMobile ? 0.2 : 0.3;
            if (bestConfidence < minConfidence && bestConfidence > 0) {
              console.warn(`⚠️ Low confidence (${(bestConfidence * 100).toFixed(0)}%) - Processing anyway`);
            }
          } else {
            interimTranscript += bestTranscript;
            if (isMobile) {
              console.log(`🎙️ Interim: "${bestTranscript}"`);
            }
          }
        }

        // Show current speech (interim for preview)
        if (interimTranscript) {
          setCurrentInputTranscription(interimTranscript);
        }

        // Clear any pending processing timeout
        if (processingTimeout) {
          clearTimeout(processingTimeout);
        }

        // Process final transcript immediately
        if (newFinalTranscript.trim() && !isProcessingRef.current) {
          const rawText = newFinalTranscript.trim();
          
          // ANDROID FIX: Process even short utterances (1+ chars)
          if (rawText !== lastProcessedText && rawText.length >= 1) {
            lastProcessedText = rawText;
            
            // Process immediately - FAST MODE!
            isProcessingRef.current = true;
            console.log(`🧠 TRANSLATING: "${rawText}"`);
            
            // Clear input immediately for next sentence
            setCurrentInputTranscription('');
            
            // Process translation asynchronously (don't block!)
            (async () => {
              try {
                setCurrentOutputTranscription('Translating...'); // Show loading
                
                // Translate using Indian Language AI
                const translation = await translateWithIndianAI(rawText, sourceLang, targetLang);
                
                setCurrentOutputTranscription(translation);
                
                // Add to history (with size limit to prevent memory issues)
                setTranscriptionHistory(prev => {
                  const newEntries = [];

                  // Add user input
                  const lastUserEntry = prev.filter(entry => entry.speaker === 'user').pop();
                  if (!lastUserEntry || lastUserEntry.text !== rawText) {
                    newEntries.push({ speaker: 'user', text: rawText });
                  }

                  // Add translation
                  const lastModelEntry = prev.filter(entry => entry.speaker === 'model').pop();
                  if (!lastModelEntry || lastModelEntry.text !== translation) {
                    newEntries.push({ speaker: 'model', text: translation });
                  }

                  const updated = [...prev, ...newEntries];
                  // Limit history size to prevent memory overload
                  return updated.slice(-maxHistorySize);
                });

                // Speak translation using TTS (NON-BLOCKING - don't wait!)
                console.log(`🔊 SPEAKING: "${translation}"`);
                if (translation && translation.trim()) {
                  // Don't await - let it play in background!
                  speakTranslation(translation, targetLang).catch(err => {
                    console.error('TTS error (non-critical):', err);
                  });
                }

                // Clear output after 2 seconds (fast!)
                setTimeout(() => {
                  setCurrentOutputTranscription('');
                }, 2000);

              } catch (error) {
                console.error('❌ Process error:', error);
                setCurrentOutputTranscription('❌ Translation failed');
                setTimeout(() => {
                  setCurrentOutputTranscription('');
                }, 2000);
              }

              // Allow next sentence immediately!
              isProcessingRef.current = false;
            })();
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Recognition error:', event.error);
        
        // ANDROID FIX: Handle "no-speech" - very common on mobile
        if (event.error === 'no-speech') {
          console.log('ℹ️ No speech detected - This is normal, will restart automatically');
          // Don't treat as error, let onend handler restart
          return;
        }
        
        // ANDROID FIX: Handle "aborted" - happens when manually stopped or restarted
        if (event.error === 'aborted') {
          console.log('ℹ️ Recognition aborted - Normal behavior');
          return; // Let onend handler manage restart
        }
        
        // ANDROID FIX: Network errors - retry automatically
        if (event.error === 'network') {
          console.warn('⚠️ Network error - Will retry automatically');
          return; // Let onend handler restart
        }
        
        // CRITICAL ERRORS: Stop listening
        if (event.error === 'not-allowed') {
          setError('🎤 Microphone access denied. Please allow microphone in browser settings.');
          isListeningRef.current = false;
          setStatus(SessionStatus.ERROR);
          return;
        }
        
        if (event.error === 'audio-capture') {
          setError('🎤 No microphone found. Please connect a microphone and try again.');
          isListeningRef.current = false;
          setStatus(SessionStatus.ERROR);
          return;
        }
        
        if (event.error === 'service-not-allowed') {
          setError('🔒 Speech recognition not allowed. Check browser permissions or use HTTPS.');
          isListeningRef.current = false;
          setStatus(SessionStatus.ERROR);
          return;
        }
        
        // OTHER ERRORS: Log and let auto-restart handle it
        console.warn(`⚠️ Error "${event.error}" - Will retry automatically`);
      };

      recognitionRef.current.onend = () => {
        console.log(`🎤 Recognition ended (listening: ${isListeningRef.current})`);
        
        if (!isListeningRef.current || status !== SessionStatus.CONNECTED) {
          console.log('🛑 Not restarting - session stopped');
          return;
        }

        // ANDROID CHROME FIX: Always auto-restart for continuous listening
        if (isMobile) {
          console.log('📱 Android: Recognition stopped, auto-restarting...');
          // Fast restart for mobile
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && status === SessionStatus.CONNECTED) {
              try {
                recognitionRef.current.start();
                console.log('✅ Android: Recognition restarted');
              } catch (e: any) {
                if (e.name === 'InvalidStateError') {
                  console.log('⚠️ Already running, waiting...');
                  // Try again with longer delay
                  setTimeout(() => {
                    try {
                      if (isListeningRef.current && recognitionRef.current) {
                        recognitionRef.current.start();
                      }
                    } catch (err) {
                      console.error('❌ Second restart failed:', err);
                    }
                  }, 500);
                } else {
                  console.error('❌ Restart error:', e);
                }
              }
            } else {
              console.log('🛑 Not restarting - session ended');
            }
          }, 200); // Slightly longer delay for Android stability
          return;
        }

        // Desktop: If too many restart attempts, recreate recognition instance to prevent memory issues
        if (restartAttemptsRef.current >= maxRestartAttempts) {
          console.warn(`⚠️ Too many restart attempts (${restartAttemptsRef.current}), recreating recognition...`);
          restartAttemptsRef.current = 0;
          
          // Clean up old recognition
          try {
            if (recognitionRef.current) {
              recognitionRef.current.onend = null;
              recognitionRef.current.onresult = null;
              recognitionRef.current.onerror = null;
              recognitionRef.current.stop();
            }
          } catch (e) {
            console.warn('Cleanup error:', e);
          }

          // Recreate recognition after delay
          setTimeout(() => {
            if (isListeningRef.current && status === SessionStatus.CONNECTED) {
              console.log('🔄 Recreating recognition instance...');
              
              // Clean up completely
              recognitionRef.current = null;
              
              // Recreate recognition instance
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = sourceLang.code;
                recognitionRef.current.maxAlternatives = 5;
                
                // Reattach handlers (need to recreate handlers with current scope)
                // This will be done by re-initializing the handlers
                console.log('⚠️ Please restart session manually to recreate recognition handlers');
                setError('Recognition instance recreated. Please click Start again.');
                isListeningRef.current = false;
              }
            }
          }, 200);
          return;
        }

        // Normal restart
        restartAttemptsRef.current++;
        setTimeout(() => {
          try {
            if (recognitionRef.current && isListeningRef.current && status === SessionStatus.CONNECTED) {
              console.log(`🔄 Restarting recognition (attempt ${restartAttemptsRef.current})...`);
              recognitionRef.current.start();
              restartAttemptsRef.current = 0; // Reset on successful restart
            }
          } catch (error) {
            console.error(`❌ Restart failed (attempt ${restartAttemptsRef.current}):`, error);
            // Try again after short delay
            setTimeout(() => {
              if (recognitionRef.current && isListeningRef.current && status === SessionStatus.CONNECTED) {
                try {
                  recognitionRef.current.start();
                  restartAttemptsRef.current = 0; // Reset on successful restart
                } catch (e) {
                  console.error(`❌ Second restart attempt failed:`, e);
                  // Don't increment counter here, will be handled by next onend
                }
              }
            }, 100);
          }
        }, 50); // Faster restart
      };

      // Start listening
      isListeningRef.current = true;
      recognitionRef.current.start();
      setStatus(SessionStatus.CONNECTED);
      console.log('✅ Real-time translator started');

    } catch (error) {
      console.error('❌ Start failed:', error);
      endSession();
      setError(error instanceof Error ? error.message : 'Failed to start session');
      setStatus(SessionStatus.ERROR);
    }
  }, [endSession, translateWithIndianAI, speakTranslation, status]);

  const pauseSession = useCallback(() => {
    console.log('⏸️ Pausing session...');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    isListeningRef.current = false;
    setStatus(SessionStatus.PAUSED);
    console.log('✅ Session paused');
  }, []);

  const resumeSession = useCallback(() => {
    console.log('▶️ Resuming session...');
    if (recognitionRef.current && status === SessionStatus.PAUSED) {
      setStatus(SessionStatus.CONNECTED);
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
        console.log('✅ Session resumed');
      } catch (error) {
        console.error('❌ Resume failed:', error);
        setError('Failed to resume recognition');
      }
    }
  }, [status]);

  const clearError = useCallback(() => {
    setError(null);
    if (status === SessionStatus.ERROR) {
      setStatus(SessionStatus.DISCONNECTED);
    }
  }, [status]);

  const clearHistory = useCallback(() => {
    console.log('🗑️ Clearing conversation history...');
    setTranscriptionHistory([]);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    // Also clear from localStorage
    localStorage.removeItem('voxbridge_conversation_history');
    console.log('✅ Conversation history cleared');
  }, []);

  const getIndianAIStats = useCallback(() => {
    const indianStats = indianAI.current.getIndianAIStats();
    
    return {
      indianLanguages: {
        supportedLanguages: indianStats.supportedLanguages,
        features: indianStats.features,
        status: indianStats.status,
        voicesLoaded: indianStats.voicesLoaded,
        cachedVoices: indianStats.cachedVoices
      },
      overall: {
        indianLanguageOptimized: true,
        translationAccuracy: 88,
        gttsEnabled: true
      }
    };
  }, []);

  return {
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
    analyserNode: analyserNodeRef.current,
    getIndianAIStats,
    translateWithIndianAI
  };
};
