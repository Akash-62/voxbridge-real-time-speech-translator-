/**
 * Enhanced Indian Language AI - Core Translation & Speech System
 * Optimized for accuracy and Google TTS integration
 */

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
   * Enhanced Google TTS using local gTTS server for native pronunciation
   */
  async speakWithIndianContext(text: string, language: string): Promise<void> {
    console.log(`🎤 Speaking: "${text}" in ${language}`);

    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      // PRODUCTION: Check if on Vercel/production
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      if (isProduction) {
        // Use Vercel serverless function in production
        console.log('🌐 Production: Using Vercel serverless TTS');
        const success = await this.speakWithVercelTTS(text, language);
        if (success) return;
        
        // Fallback to browser TTS
        console.warn('⚠️ Vercel TTS unavailable, using browser TTS');
        await this.speakWithBrowserTTS(text, language);
        return;
      }

      // Development: Try local gTTS server first (best quality)
      const success = await this.speakWithGTTSServer(text, language);
      if (success) {
        return;
      }

      // Fallback to browser TTS if server unavailable
      console.warn('⚠️ gTTS server unavailable, falling back to browser TTS');
      await this.speakWithBrowserTTS(text, language);

    } catch (error) {
      console.error('❌ Speech failed:', error);
      // Try browser TTS as last resort
      await this.speakWithBrowserTTS(text, language).catch(() => {});
    }
  }

  /**
   * Use Vercel serverless function for TTS (production)
   */
  private async speakWithVercelTTS(text: string, language: string): Promise<boolean> {
    try {
      const locale = this.getLocaleCode(language);
      console.log(`🌐 Vercel TTS request: ${locale}`);
      
      // Call Vercel serverless function
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: locale
        })
      });

      if (!response.ok) {
        console.warn(`⚠️ Vercel TTS error: ${response.status}`);
        return false;
      }

      // Get audio blob
      const audioBlob = await response.blob();
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Optimized playback rate
      audio.playbackRate = this.getSpeechRate(locale);
      
      // Play audio
      await audio.play();
      
      console.log(`⚡ Vercel TTS playing at ${audio.playbackRate}x speed`);
      
      // Clean up after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log(`✅ Vercel TTS completed`);
      };

      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
      };

      return true;

    } catch (error: any) {
      console.warn('⚠️ Vercel TTS unavailable:', error.message);
      return false;
    }
  }

  /**
   * Use local gTTS server for high-quality native pronunciation (optimized)
   */
  private async speakWithGTTSServer(text: string, language: string): Promise<boolean> {
    try {
      const locale = this.getLocaleCode(language);
      
      console.log(`🌐 Fast gTTS request: ${locale}`);
      
      // Try multiple server URLs (production Render.com, then localhost for development)
      const serverUrls = [
        // PRODUCTION: Add your Render.com URL here after deployment
        // Example: 'https://voxbridge-gtts-server.onrender.com/tts',
        import.meta.env.VITE_GTTS_SERVER_URL || 'https://voxbridge-gtts-server.onrender.com/tts', // Production
        'http://localhost:5000/tts', // Development
        'http://127.0.0.1:5000/tts', // Development alternative
      ].filter(url => url); // Remove empty URLs
      
      console.log(`🌐 Trying gTTS servers:`, serverUrls);
      
      // SPEED OPTIMIZATION: Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for production
      
      let response: Response | null = null;
      let lastError: Error | null = null;
      
      // Try each URL until one works
      for (const url of serverUrls) {
        try {
          console.log(`🔄 Attempting: ${url}`);
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: text,
              language: locale
            }),
            signal: controller.signal
          });
          
          if (response.ok) {
            clearTimeout(timeoutId);
            console.log(`✅ gTTS server connected via ${url}`);
            break; // Success!
          }
        } catch (error: any) {
          lastError = error;
          console.warn(`⚠️ Failed to connect to ${url}: ${error.message}`);
          continue; // Try next URL
        }
      }

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        console.warn(`⚠️ gTTS server error: ${response?.status || 'No response'}`);
        if (lastError) {
          console.warn(`Last error: ${lastError.message}`);
        }
        return false;
      }

      // Get audio blob
      const audioBlob = await response.blob();
      
      // Create audio element and play immediately
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // SPEED OPTIMIZATION: Set playback rate for faster speech
      audio.playbackRate = this.getSpeechRate(locale);
      
      // Play audio immediately
      await audio.play();
      
      console.log(`⚡ Fast gTTS playing for ${locale} at ${audio.playbackRate}x speed`);
      
      // Clean up after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log(`✅ gTTS completed for ${locale}`);
      };

      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
      };

      return true;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ gTTS server timeout (>3s), switching to browser TTS');
      } else {
        console.warn('⚠️ gTTS server unavailable:', error.message);
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
