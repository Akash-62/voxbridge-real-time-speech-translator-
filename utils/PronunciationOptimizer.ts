/**
 * Pronunciation Optimizer
 * Improves TTS pronunciation for Indian and international languages
 */

// Text preprocessing rules for better pronunciation
const PRONUNCIATION_RULES = {
  // Hindi/Indian English common fixes
  'hi': {
    // Add natural pauses
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' }, // Add pause before devanagari punctuation
      { from: /([।॥])\s*/g, to: '$1 ' }, // Ensure space after
    ],
  },
  'kn': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
    ],
  },
  'ta': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
    ],
  },
  'te': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
    ],
  },
  'ml': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
    ],
  },
  'en': {
    patterns: [
      // Expand common abbreviations for better pronunciation
      { from: /\bDr\.\s+/gi, to: 'Doctor ' },
      { from: /\bMr\.\s+/gi, to: 'Mister ' },
      { from: /\bMrs\.\s+/gi, to: 'Misses ' },
      { from: /\bMs\.\s+/gi, to: 'Miss ' },
      { from: /\betc\./gi, to: 'etcetera' },
      { from: /\bi\.e\./gi, to: 'that is' },
      { from: /\be\.g\./gi, to: 'for example' },
    ],
  },
};

// Common Indian English words that need special handling
const INDIAN_ENGLISH_FIXES = {
  // Common pronunciation issues
  'Rs': 'Rupees',
  'Rs.': 'Rupees',
  '₹': 'Rupees',
  'Cr': 'Crore',
  'Cr.': 'Crore',
  'L': 'Lakh',
  'K': 'Thousand',
};

/**
 * Optimize text for better TTS pronunciation
 */
export function optimizeForTTS(text: string, language: string): string {
  if (!text || !text.trim()) return text;

  let optimized = text;

  // Apply language-specific rules
  const langCode = language.split('-')[0]; // Extract base language code (hi from hi-IN)
  const rules = PRONUNCIATION_RULES[langCode];
  
  if (rules?.patterns) {
    rules.patterns.forEach(rule => {
      optimized = optimized.replace(rule.from, rule.to);
    });
  }

  // Apply Indian English fixes for English language
  if (langCode === 'en') {
    Object.entries(INDIAN_ENGLISH_FIXES).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      optimized = optimized.replace(regex, value);
    });
  }

  // General optimizations for all languages
  optimized = applyGeneralOptimizations(optimized);

  return optimized;
}

/**
 * Apply general pronunciation optimizations
 */
function applyGeneralOptimizations(text: string): string {
  let result = text;

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ').trim();

  // Add natural pauses for better flow
  result = result.replace(/([.!?])\s*/g, '$1 '); // Ensure space after punctuation
  result = result.replace(/([,;:])\s*/g, '$1 '); // Ensure space after separators

  // Handle numbers for better pronunciation
  result = handleNumbers(result);

  // Remove excessive punctuation
  result = result.replace(/\.{2,}/g, '. '); // Multiple dots to single dot
  result = result.replace(/!{2,}/g, '! '); // Multiple exclamations
  result = result.replace(/\?{2,}/g, '? '); // Multiple questions

  return result;
}

/**
 * Handle number pronunciation
 */
function handleNumbers(text: string): string {
  // Add commas to large numbers for natural pauses
  return text.replace(/\b(\d{1,3})(\d{3})\b/g, '$1,$2');
}

/**
 * Get optimal language code for TTS
 */
export function getOptimalLanguageCode(languageCode: string): string {
  // Map to best TTS language codes
  const mapping: Record<string, string> = {
    // Indian Languages - use full locale for better quality
    'hi': 'hi-IN',
    'hi-IN': 'hi-IN',
    'kn': 'kn-IN',
    'kn-IN': 'kn-IN',
    'ta': 'ta-IN',
    'ta-IN': 'ta-IN',
    'te': 'te-IN',
    'te-IN': 'te-IN',
    'ml': 'ml-IN',
    'ml-IN': 'ml-IN',
    'bn': 'bn-IN',
    'bn-IN': 'bn-IN',
    
    // English - prefer US for clearer pronunciation
    'en': 'en-US',
    'en-US': 'en-US',
    'en-GB': 'en-GB',
    'en-IN': 'en-IN',
    
    // European
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    
    // Asian
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
  };

  return mapping[languageCode] || languageCode;
}

/**
 * Split long text into optimal chunks for TTS
 * Google TTS has character limits, splitting improves quality
 */
export function splitTextForTTS(text: string, maxLength: number = 200): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';
  
  sentences.forEach(sentence => {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // If single sentence is too long, split by comma
      if (sentence.length > maxLength) {
        const parts = sentence.split(/,/g);
        parts.forEach((part, idx) => {
          const withComma = idx < parts.length - 1 ? part + ',' : part;
          if (currentChunk.length + withComma.length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = withComma;
          } else {
            currentChunk += withComma;
          }
        });
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += sentence;
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Detect if text contains Indian script
 */
export function containsIndianScript(text: string): boolean {
  // Check for common Indian language Unicode ranges
  const indianScriptRanges = [
    /[\u0900-\u097F]/, // Devanagari (Hindi, Marathi, Sanskrit)
    /[\u0980-\u09FF]/, // Bengali
    /[\u0A00-\u0A7F]/, // Gurmukhi (Punjabi)
    /[\u0A80-\u0AFF]/, // Gujarati
    /[\u0B00-\u0B7F]/, // Oriya
    /[\u0B80-\u0BFF]/, // Tamil
    /[\u0C00-\u0C7F]/, // Telugu
    /[\u0C80-\u0CFF]/, // Kannada
    /[\u0D00-\u0D7F]/, // Malayalam
  ];

  return indianScriptRanges.some(range => range.test(text));
}
