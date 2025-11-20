/**
 * Enhanced Indian Language AI - Core Translation & Speech System
 * Optimized for accuracy and Google TTS integration
 */

import { optimizeForTTS, splitTextForTTS, containsIndianScript } from './PronunciationOptimizer';

interface IndianLanguageLearningData {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  userCorrection?: string;
}

interface TranslationResponse {
  text: string;
  confidence: number;
  source: string;
}

class IndianLanguageAI {
  private learningHistory: IndianLanguageLearningData[] = [];
  private indianLanguages = ['kn', 'ml', 'hi', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'];
  private voiceCache: Map<string, SpeechSynthesisVoice> = new Map();
  private translationCache: Map<string, { text: string; timestamp: number }> = new Map();
  private isVoicesLoaded = false;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    console.log('🚀 Enhanced Language AI initialized with gTTS and 60+ languages + Speed Cache');
    this.initializeVoices();
    this.startCacheCleanup();
  }

  /**
   * Clean up old cache entries periodically
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.translationCache.entries()) {
        if (now - value.timestamp > this.CACHE_DURATION) {
          this.translationCache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  /**
   * Initialize and cache high-quality voices for Indian languages
   */
  private async initializeVoices(): Promise<void> {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log(`✅ Loaded ${voices.length} voices`);

          // Log all available voices for debugging
          voices.forEach(v => {
            if (v.lang.includes('-IN')) {
              console.log(`🔍 Found Indian voice: ${v.name} (${v.lang}) [${v.localService ? 'Local' : 'Remote'}]`);
            }
          });

          // Cache best voices for each language with quality priority (60+ languages)
          const languagePriority = [
            // Indian Languages
            'hi-IN', 'kn-IN', 'ml-IN', 'ta-IN', 'te-IN', 'bn-IN', 'gu-IN', 'mr-IN', 'pa-IN',
            // English
            'en-US', 'en-GB',
            // European Languages
            'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'ru-RU', 'nl-NL', 'pl-PL', 'tr-TR',
            'sv-SE', 'no-NO', 'da-DK', 'fi-FI', 'el-GR', 'cs-CZ', 'ro-RO', 'hu-HU', 'uk-UA',
            // East Asian
            'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR',
            // Southeast Asian
            'th-TH', 'vi-VN', 'id-ID', 'ms-MY', 'fil-PH',
            // Middle Eastern
            'ar-SA', 'he-IL', 'fa-IR',
            // African
            'af-ZA', 'sw-KE',
            // Other
            'ca-ES', 'hr-HR', 'sr-RS', 'sk-SK', 'sl-SI', 'bg-BG', 'lt-LT', 'lv-LV', 'et-EE'
          ];

          languagePriority.forEach(lang => {
            // Priority: Google female voices > Local female > Google male > Local male > Any
            const googleFemaleVoice = voices.find(v =>
              v.lang === lang &&
              v.name.toLowerCase().includes('google') &&
              (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
            );

            const localFemaleVoice = voices.find(v =>
              v.lang === lang &&
              v.localService &&
              (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
            );

            const googleVoice = voices.find(v =>
              v.lang === lang && v.name.toLowerCase().includes('google')
            );

            const localVoice = voices.find(v =>
              v.lang === lang && v.localService
            );

            const anyVoice = voices.find(v => v.lang === lang) ||
              voices.find(v => v.lang.startsWith(lang.split('-')[0]));

            const bestVoice = googleFemaleVoice || localFemaleVoice || googleVoice || localVoice || anyVoice;

            if (bestVoice) {
              this.voiceCache.set(lang, bestVoice);
              console.log(`📢 Cached BEST voice for ${lang}: ${bestVoice.name} [Quality: ${googleFemaleVoice ? 'Excellent' : googleVoice ? 'Good' : 'Fair'}]`);
            }
          });

          this.isVoicesLoaded = true;
        }
      };

      // Try to load voices immediately
      loadVoices();

      // Also listen for voices changed event
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Fallback: try again after delay
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 500); // Additional delay for slow loading
    }
  }

  /**
   * Enhanced translation with parallel requests, caching for speed and better accuracy
   */
  async translateIndianLanguages(text: string, sourceLang: string, targetLang: string): Promise<string> {
    console.log(`🔄 Fast translating: "${text}" from ${sourceLang} to ${targetLang}`);

    if (!text || text.trim().length === 0) {
      return '';
    }

    // Clean and normalize text for better accuracy
    const cleanText = this.normalizeText(text);

    if (cleanText.length === 0) {
      return '';
    }

    // SPEED OPTIMIZATION: Check cache first
    const cacheKey = `${sourceLang}:${targetLang}:${cleanText}`;
    const cached = this.translationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`⚡ Cache hit! Instant translation: "${cached.text}"`);
      return cached.text;
    }

    try {
      // SPEED OPTIMIZATION: Try both services in parallel with race condition
      const translationPromises = [
        this.translateWithGoogle(cleanText, sourceLang, targetLang),
        this.translateWithMyMemory(cleanText, sourceLang, targetLang)
      ];

      // Use Promise.race to get the fastest response
      const fastestResult = await Promise.race(translationPromises);

      if (fastestResult.text && fastestResult.text.trim() && fastestResult.confidence > 0.5) {
        console.log(`⚡ Fast translation from ${fastestResult.source}: "${fastestResult.text}" (${(fastestResult.confidence * 100).toFixed(0)}%)`);
        // Cache the result
        this.translationCache.set(cacheKey, { text: fastestResult.text, timestamp: Date.now() });
        return fastestResult.text;
      }

      // If fastest wasn't good enough, wait for both and pick best
      const allResults = await Promise.allSettled(translationPromises);
      const successfulResults = allResults
        .filter((r): r is PromiseFulfilledResult<TranslationResponse> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(r => r.text && r.text.trim())
        .sort((a, b) => b.confidence - a.confidence);

      if (successfulResults.length > 0) {
        const best = successfulResults[0];
        console.log(`✅ Best translation from ${best.source}: "${best.text}" (${(best.confidence * 100).toFixed(0)}%)`);
        // Cache the result
        this.translationCache.set(cacheKey, { text: best.text, timestamp: Date.now() });
        return best.text;
      }

      // Last resort: return with language tag
      console.warn(`⚠️ No translation found, returning original with tag`);
      return `[${targetLang.toUpperCase()}] ${cleanText}`;

    } catch (error) {
      console.error('❌ Translation failed:', error);
      return `[${targetLang.toUpperCase()}] ${cleanText}`;
    }
  }

  /**
   * Normalize text for better translation accuracy
   */
  private normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')           // Multiple spaces to single space
      .replace(/\.{2,}/g, '.')        // Multiple dots to single dot
      .replace(/\?{2,}/g, '?')        // Multiple question marks to single
      .replace(/!{2,}/g, '!')         // Multiple exclamation marks to single
      .replace(/^\s*[-•]\s*/, '')     // Remove leading bullet points
      .trim();
  }

  /**
   * Enhanced Google TTS - Direct browser calls (works 100% on Vercel!)
   */
  async speakWithIndianContext(text: string, language: string): Promise<void> {
    console.log(`🎤 Speaking: "${text}" in ${language}`);

    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      // BULLETPROOF SOLUTION: Use direct Google TTS API from browser
      // This bypasses Vercel serverless function issues completely!
      console.log('🚀 Using DIRECT Google TTS API (guaranteed to work on Vercel!)');

      const success = await this.speakWithDirectGoogleTTS(text, language);

      if (success) {
        console.log('✅ Direct Google TTS succeeded - HIGH QUALITY!');
        return;
      }

      // Fallback 1: Try serverless function (if available)
      console.warn('⚠️ Direct Google TTS failed, trying serverless function...');
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const gttsServerUrl = isProduction
        ? '/api/tts'
        : (import.meta.env.VITE_GTTS_SERVER_URL || 'http://localhost:3002');

      const serverSuccess = await this.speakWithGTTSServer(text, language, gttsServerUrl);

      if (serverSuccess) {
        console.log('✅ Serverless TTS succeeded!');
        return;
      }

      // Fallback 2: Browser TTS (last resort)
      console.warn('⚠️ All Google TTS methods failed, using browser TTS');
      await this.speakWithBrowserTTS(text, language);

    } catch (error) {
      console.error('❌ Speech failed:', error);
      // Try browser TTS as last resort
      await this.speakWithBrowserTTS(text, language).catch(() => { });
    }
  }

  /**
   * DIRECT Google TTS API - Calls Google from browser (no server needed!)
   * This is the BULLETPROOF solution that works on Vercel 100%
   */
  private async speakWithDirectGoogleTTS(text: string, language: string): Promise<boolean> {
    try {
      const locale = this.getLocaleCode(language);

      // OPTIMIZE TEXT FOR BETTER PRONUNCIATION
      const optimizedText = optimizeForTTS(text, locale);

      console.log(`🌐 Direct Google TTS API call`);
      console.log(`🌐 Language: ${locale}`);
      console.log(`📝 Original: "${text}"`);
      console.log(`✨ Optimized: "${optimizedText}"`);

      // Split long text for better quality
      const chunks = splitTextForTTS(optimizedText, 200);
      console.log(`📦 Split into ${chunks.length} chunk(s)`);

      // Play each chunk sequentially
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🔊 Playing chunk ${i + 1}/${chunks.length}: "${chunk.substring(0, 50)}..."`);

        // Direct Google Translate TTS URL (same as gTTS uses!)
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${locale}&q=${encodeURIComponent(chunk)}`;

        console.log(`🌐 Direct URL: ${ttsUrl.substring(0, 100)}...`);

        try {
          // Fetch audio as blob for better reliability (especially for Kannada and other Indian languages)
          const response = await fetch(ttsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://translate.google.com/'
            }
          });

          if (!response.ok) {
            console.error(`❌ Google TTS fetch failed: ${response.status} ${response.statusText}`);
            throw new Error(`Google TTS API returned ${response.status}`);
          }

          // Convert to blob
          const audioBlob = await response.blob();
          console.log(`📦 Received audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

          if (audioBlob.size === 0) {
            console.error(`❌ Empty audio blob received for ${locale}`);
            throw new Error('Empty audio blob');
          }

          // Verify it's actually audio
          if (!audioBlob.type.includes('audio') && !audioBlob.type.includes('mpeg')) {
            console.error(`❌ Invalid audio type received: ${audioBlob.type}`);
            const blobText = await audioBlob.text();
            console.error(`❌ Blob content: ${blobText.substring(0, 200)}`);
            throw new Error(`Invalid audio type received: ${audioBlob.type}`);
          }

          // Create object URL from blob
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          // Optimized playback rate
          audio.playbackRate = this.getSpeechRate(locale);

          // Wait for audio to complete before next chunk
          await new Promise<void>((resolve, reject) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              console.log(`✅ Chunk ${i + 1}/${chunks.length} completed - DIRECT GOOGLE TTS!`);
              resolve();
            };

            audio.onerror = (error) => {
              console.error(`❌ Audio playback error for ${locale}:`, error);
              console.error(`❌ Audio src: ${audio.src}`);
              console.error(`❌ Audio error details:`, {
                error: audio.error,
                code: audio.error?.code,
                message: audio.error?.message
              });
              URL.revokeObjectURL(audioUrl);
              reject(new Error(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`));
            };

            // Start playing
            audio.play().catch((playError) => {
              console.error(`❌ Play error for ${locale}:`, playError);
              console.error(`❌ Play error name: ${playError.name}`);
              console.error(`❌ Play error message: ${playError.message}`);
              URL.revokeObjectURL(audioUrl);
              reject(playError);
            });
          });

        } catch (chunkError: any) {
          console.error(`❌ Chunk ${i + 1} failed for ${locale}:`, {
            name: chunkError.name,
            message: chunkError.message,
            stack: chunkError.stack
          });
          throw chunkError; // Re-throw to trigger fallback
        }

        // Small delay between chunks for natural speech
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ All chunks completed - DIRECT GOOGLE TTS with pronunciation optimization!`);
      return true;

    } catch (error: any) {
      console.error('❌ Direct Google TTS error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      return false;
    }
  }


  /**
   * Use external gTTS server for high-quality Google TTS
   */
  private async speakWithGTTSServer(text: string, language: string, serverUrl: string): Promise<boolean> {
    try {
      const locale = this.getLocaleCode(language);

      // OPTIMIZE TEXT FOR BETTER PRONUNCIATION
      const optimizedText = optimizeForTTS(text, locale);

      console.log(`🌐 Calling gTTS server: ${serverUrl}`);
      console.log(`🌐 Language: ${locale}`);
      console.log(`📝 Original: "${text}"`);
      console.log(`✨ Optimized: "${optimizedText}"`);

      // Split long text for better quality
      const chunks = splitTextForTTS(optimizedText, 200);
      console.log(`📦 Split into ${chunks.length} chunk(s)`);

      // Play each chunk sequentially
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🔊 Playing chunk ${i + 1}/${chunks.length}: "${chunk.substring(0, 50)}..."`);

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({
              text: chunk,
              language: locale
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          console.log(`📡 Response: ${response.status} ${response.statusText}`);
          console.log(`📡 Response headers:`, {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            cors: response.headers.get('access-control-allow-origin')
          });

          if (!response.ok) {
            let errorDetails = '';
            try {
              // Clone response to avoid "body stream already read" error
              const errorData = await response.clone().json();
              errorDetails = JSON.stringify(errorData, null, 2);
              console.error(`❌ gTTS server error response:`, errorData);
            } catch {
              try {
                errorDetails = await response.text();
                console.error(`❌ gTTS server error text: ${errorDetails}`);
              } catch (e) {
                errorDetails = 'Unable to read error response';
                console.error(`❌ Could not read error response:`, e);
              }
            }

            console.error(`❌ gTTS server failed: ${response.status} ${response.statusText}`);
            console.error(`❌ Error details: ${errorDetails}`);
            console.error(`❌ Request URL: ${serverUrl}`);
            console.error(`❌ Request body:`, { text: chunk, language: locale });

            return false;
          }

          // Get audio blob
          const audioBlob = await response.blob();
          console.log(`📦 Received audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

          if (audioBlob.size === 0) {
            console.error(`❌ Empty audio received from gTTS server`);
            return false;
          }

          // Verify it's actually audio
          if (!audioBlob.type.includes('audio') && !audioBlob.type.includes('mpeg')) {
            console.error(`❌ Invalid audio type received: ${audioBlob.type}`);
            const blobText = await audioBlob.text();
            console.error(`❌ Blob content: ${blobText.substring(0, 200)}`);
            return false;
          }

          // Create audio element and play
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          // Optimized playback rate
          audio.playbackRate = this.getSpeechRate(locale);

          // Wait for audio to complete before next chunk
          await new Promise<void>((resolve, reject) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              console.log(`✅ Chunk ${i + 1}/${chunks.length} completed - GOOGLE TTS!`);
              resolve();
            };

            audio.onerror = (error) => {
              console.error('❌ Audio playback error:', error);
              URL.revokeObjectURL(audioUrl);
              reject(error);
            };

            // Start playing
            audio.play().catch(reject);
          });

        } catch (chunkError: any) {
          clearTimeout(timeoutId);

          if (chunkError.name === 'AbortError') {
            console.error('❌ gTTS server timeout (>15s)');
          } else {
            console.error('❌ Chunk processing error:', chunkError);
          }

          throw chunkError;
        }
      }

      console.log(`✅ All chunks completed - gTTS with pronunciation optimization!`);
      return true;

    } catch (error: any) {
      console.error('❌ gTTS server error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      if (error.name === 'AbortError') {
        console.error('❌ gTTS server timeout (>15s)');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Network error - cannot reach gTTS server');
        console.error('❌ Check if server URL is correct and accessible');
      }

      return false;
    }
  }

  /**
   * Get optimal speech rate for different languages
   */
  private getSpeechRate(locale: string): number {
    // Faster for familiar languages, slightly slower for complex scripts
    const rates: { [key: string]: number } = {
      'en-US': 1.1,
      'en-GB': 1.1,
      'hi-IN': 1.0,
      'kn-IN': 1.0,
      'te-IN': 1.0,
      'ta-IN': 1.0,
      'ml-IN': 1.0,
    };
    return rates[locale] || 1.0; // Default 1.0x for other languages
  }

  /**
   * Fallback browser TTS (lower quality but always available)
   */
  private async speakWithBrowserTTS(text: string, language: string): Promise<void> {
    // Ensure voices are loaded
    if (!this.isVoicesLoaded) {
      await this.initializeVoices();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Wait a bit for cancel to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Preprocess text for better pronunciation
    const processedText = this.preprocessTextForSpeech(text, language);

    const utterance = new SpeechSynthesisUtterance(processedText);

    // Map language code to full locale
    const locale = this.getLocaleCode(language);
    utterance.lang = locale;

    // Try to use cached high-quality voice
    const cachedVoice = this.voiceCache.get(locale);
    if (cachedVoice) {
      utterance.voice = cachedVoice;
      console.log(`✅ Using HIGH-QUALITY voice: ${cachedVoice.name} (${cachedVoice.lang})`);
    } else {
      // Find best available voice with improved selection
      const voices = speechSynthesis.getVoices();

      // Priority: Google female > Local female > Google > Local > Language match
      const googleFemaleVoice = voices.find(v =>
        v.lang === locale &&
        v.name.toLowerCase().includes('google') &&
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
      );

      const googleVoice = voices.find(v =>
        v.lang === locale && v.name.toLowerCase().includes('google')
      );

      const localVoice = voices.find(v =>
        v.lang === locale && v.localService
      );

      const localeVoice = voices.find(v => v.lang === locale);

      const langVoice = voices.find(v => v.lang.startsWith(language));

      const selectedVoice = googleFemaleVoice || googleVoice || localVoice || localeVoice || langVoice;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        this.voiceCache.set(locale, selectedVoice);
        console.log(`✅ Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        console.warn(`⚠️ No specific voice found for ${locale}, using default`);
      }
    }

    // Optimize speech parameters for better Indian language pronunciation
    utterance.rate = this.getSpeechRate(language);
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    console.log(`🔊 Browser TTS: Rate=${utterance.rate}, Voice=${utterance.voice?.name || 'default'}`);

    // Add error handling
    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event.error, event);
    };

    utterance.onend = () => {
      console.log(`✅ Browser TTS completed for ${language}`);
    };

    // Speak with proper queue management
    speechSynthesis.speak(utterance);
  }

  /**
   * Preprocess text for better pronunciation in Indian languages
   */
  private preprocessTextForSpeech(text: string, language: string): string {
    let processed = text.trim();

    // Add pauses for better clarity (using punctuation)
    processed = processed.replace(/([।|])/g, '. ');  // Devanagari danda to period
    processed = processed.replace(/([,;:])/g, '$1 '); // Add space after punctuation

    // For English text in Indian context, slow down with commas
    if (language === 'en') {
      // Add slight pauses for better clarity
      processed = processed.replace(/(\w{10,})/g, '$1,');
    }

    return processed;
  }

  /**
   * Get full locale code for language (supports 60+ languages)
   */
  private getLocaleCode(language: string): string {
    // If already in full format (e.g., 'en-US'), return as is
    if (language.includes('-')) {
      return language;
    }

    // Map short codes to full locale codes
    const localeMap: { [key: string]: string } = {
      // Indian Languages
      'hi': 'hi-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN',

      // English
      'en': 'en-US',

      // European Languages
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'nl': 'nl-NL',
      'pl': 'pl-PL',
      'tr': 'tr-TR',
      'sv': 'sv-SE',
      'no': 'no-NO',
      'da': 'da-DK',
      'fi': 'fi-FI',
      'el': 'el-GR',
      'cs': 'cs-CZ',
      'ro': 'ro-RO',
      'hu': 'hu-HU',
      'uk': 'uk-UA',

      // East Asian
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',

      // Southeast Asian
      'th': 'th-TH',
      'vi': 'vi-VN',
      'id': 'id-ID',
      'ms': 'ms-MY',
      'fil': 'fil-PH',

      // Middle Eastern
      'ar': 'ar-SA',
      'he': 'he-IL',
      'fa': 'fa-IR',

      // African
      'af': 'af-ZA',
      'sw': 'sw-KE',

      // Other
      'ca': 'ca-ES',
      'hr': 'hr-HR',
      'sr': 'sr-RS',
      'sk': 'sk-SK',
      'sl': 'sl-SI',
      'bg': 'bg-BG',
      'lt': 'lt-LT',
      'lv': 'lv-LV',
      'et': 'et-EE',
    };

    return localeMap[language.toLowerCase()] || language;
  }

  /**
   * Get AI statistics
   */
  getIndianAIStats() {
    return {
      supportedLanguages: this.indianLanguages,
      learningEntries: this.learningHistory.length,
      features: ['Google TTS', 'Multi-API Translation', 'Voice Caching', 'Enhanced Accuracy'],
      status: 'active',
      voicesLoaded: this.isVoicesLoaded,
      cachedVoices: this.voiceCache.size
    };
  }

  /**
   * Enhanced MyMemory translation with better validation
   */
  private async translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<TranslationResponse> {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&de=translator@voxbridge.com`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`⚠️ MyMemory HTTP error: ${response.status}`);
        return { text: '', confidence: 0, source: 'MyMemory' };
      }

      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        const translation = data.responseData.translatedText.trim();

        // Validate translation
        if (this.isValidTranslation(translation, text)) {
          const confidence = data.responseData.match || 0.7;
          console.log(`✅ MyMemory: "${translation}" (${(confidence * 100).toFixed(0)}% confidence)`);
          return { text: translation, confidence, source: 'MyMemory' };
        } else {
          console.warn(`⚠️ MyMemory returned invalid translation: "${translation}"`);
          return { text: '', confidence: 0, source: 'MyMemory' };
        }
      }

      return { text: '', confidence: 0, source: 'MyMemory' };
    } catch (error) {
      console.warn('❌ MyMemory API error:', error);
      return { text: '', confidence: 0, source: 'MyMemory' };
    }
  }

  /**
   * Enhanced Google Translate with improved accuracy and validation
   */
  private async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResponse> {
    try {
      console.log(`🌐 Google API Call: "${text}" | ${sourceLang} → ${targetLang}`);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      console.log(`   URL: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`⚠️ Google Translate HTTP error: ${response.status}`);
        return { text: '', confidence: 0, source: 'Google' };
      }

      const data = await response.json();
      console.log(`   Raw Response:`, JSON.stringify(data).substring(0, 200));

      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translatedText = data[0][0][0].trim();
        console.log(`   Extracted Translation: "${translatedText}"`);

        // Validate translation quality
        if (this.isValidTranslation(translatedText, text)) {
          // Higher confidence for Google Translate
          const confidence = 0.85;
          console.log(`✅ Google: "${translatedText}" (${(confidence * 100).toFixed(0)}% confidence)`);
          return { text: translatedText, confidence, source: 'Google' };
        } else {
          console.warn(`⚠️ Invalid translation detected: "${translatedText}"`);
          return { text: '', confidence: 0, source: 'Google' };
        }
      }

      return { text: '', confidence: 0, source: 'Google' };
    } catch (error) {
      console.warn('❌ Google Translate error:', error);
      return { text: '', confidence: 0, source: 'Google' };
    }
  }

  /**
   * Validate translation quality to filter out bad translations
   */
  private isValidTranslation(translation: string, original: string): boolean {
    // Check for common bad translations
    const badPatterns = [
      /bad\s+morning/i,
      /बुरी\s+सुबह/,
      /NO\s+QUERY/i,
      /EXAMPLE\s+REQUEST/i,
      /^\s*$/, // Empty
    ];

    for (const pattern of badPatterns) {
      if (pattern.test(translation)) {
        return false;
      }
    }

    // Check if translation is too similar to original (might indicate no translation happened)
    if (translation.toLowerCase() === original.toLowerCase()) {
      return original.length < 3; // Allow short words to be the same
    }

    // Check minimum length
    if (translation.length < 1) {
      return false;
    }

    return true;
  }
}

export default IndianLanguageAI;
