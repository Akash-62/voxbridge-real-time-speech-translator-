/**
 * Enhanced Pronunciation Optimizer
 * Significantly improves TTS pronunciation for Indian and international languages
 * FREE solution for better speech quality
 */

// Advanced pronunciation rules for Indian languages
const PRONUNCIATION_RULES = {
  // Hindi - Devanagari script optimizations
  'hi': {
    patterns: [
      // Natural pauses for better flow
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
      // Common Hindi words that need spacing
      { from: /([क-ह])\s+([क-ह])/g, to: '$1, $2' }, // Add slight pause between words
    ],
    phonetic: {
      // Common mispronunciations
      'नमस्ते': 'namaste',
      'धन्यवाद': 'dhanyavaad',
    }
  },

  // Kannada - Enhanced for better pronunciation
  'kn': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
      // Add pauses between Kannada words for clarity
      { from: /([ಅ-ಹ])\s+([ಅ-ಹ])/g, to: '$1, $2' },
    ],
    phonetic: {
      'ನಮಸ್ಕಾರ': 'namaskara',
      'ಧನ್ಯವಾದ': 'dhanyavaada',
    }
  },

  // Tamil - Script-specific optimizations
  'ta': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
      { from: /([அ-ஹ])\s+([அ-ஹ])/g, to: '$1, $2' },
    ],
    phonetic: {
      'வணக்கம்': 'vanakkam',
      'நன்றி': 'nandri',
    }
  },

  // Telugu - Enhanced pronunciation
  'te': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
      { from: /([అ-హ])\s+([అ-హ])/g, to: '$1, $2' },
    ],
    phonetic: {
      'నమస్కారం': 'namaskaram',
      'ధన్యవాదాలు': 'dhanyavadalu',
    }
  },

  // Malayalam - Script optimizations
  'ml': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
      { from: /([അ-ഹ])\s+([അ-ഹ])/g, to: '$1, $2' },
    ],
    phonetic: {
      'നമസ്കാരം': 'namaskaram',
      'നന്ദി': 'nandi',
    }
  },

  // Bengali
  'bn': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
    ],
    phonetic: {
      'নমস্কার': 'nomoshkar',
      'ধন্যবাদ': 'dhonnobad',
    }
  },

  // Gujarati
  'gu': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
    ],
  },

  // Marathi
  'mr': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
    ],
  },

  // Punjabi
  'pa': {
    patterns: [
      { from: /\s+([।|॥])/g, to: '. $1' },
      { from: /([।॥])\s*/g, to: '$1 ' },
    ],
  },

  // English - Expanded abbreviations and Indian context
  'en': {
    patterns: [
      // Titles
      { from: /\bDr\.\s+/gi, to: 'Doctor ' },
      { from: /\bMr\.\s+/gi, to: 'Mister ' },
      { from: /\bMrs\.\s+/gi, to: 'Misses ' },
      { from: /\bMs\.\s+/gi, to: 'Miss ' },
      { from: /\bProf\.\s+/gi, to: 'Professor ' },

      // Common abbreviations
      { from: /\betc\./gi, to: 'etcetera' },
      { from: /\bi\.e\./gi, to: 'that is' },
      { from: /\be\.g\./gi, to: 'for example' },
      { from: /\bvs\./gi, to: 'versus' },
      { from: /\bapprox\./gi, to: 'approximately' },

      // Time
      { from: /\bam\b/gi, to: 'A M' },
      { from: /\bpm\b/gi, to: 'P M' },

      // Units
      { from: /\bkm\b/gi, to: 'kilometers' },
      { from: /\bkg\b/gi, to: 'kilograms' },
      { from: /\bmg\b/gi, to: 'milligrams' },
      { from: /\bml\b/gi, to: 'milliliters' },
    ],
  },
};

// Indian English and currency fixes
const INDIAN_CONTEXT_FIXES = {
  // Currency
  'Rs': 'Rupees',
  'Rs.': 'Rupees',
  '₹': 'Rupees',
  'INR': 'Indian Rupees',

  // Large numbers (Indian numbering system)
  'Cr': 'Crore',
  'Cr.': 'Crore',
  'Crores': 'Crores',
  'L': 'Lakh',
  'Lakh': 'Lakh',
  'Lakhs': 'Lakhs',
  'K': 'Thousand',

  // Common Indian English
  'govt': 'government',
  'Govt': 'Government',
  'pvt': 'private',
  'Pvt': 'Private',
  'ltd': 'limited',
  'Ltd': 'Limited',
};

/**
 * Enhanced text optimization for better TTS pronunciation
 */
export function optimizeForTTS(text: string, language: string): string {
  if (!text || !text.trim()) return text;

  let optimized = text;

  // Extract base language code (hi from hi-IN)
  const langCode = language.split('-')[0];
  const rules = PRONUNCIATION_RULES[langCode];

  // Apply language-specific pattern rules
  if (rules?.patterns) {
    rules.patterns.forEach(rule => {
      optimized = optimized.replace(rule.from, rule.to);
    });
  }

  // Apply phonetic replacements for Indian languages
  if (rules?.phonetic) {
    Object.entries(rules.phonetic).forEach(([key, value]) => {
      const regex = new RegExp(key, 'g');
      optimized = optimized.replace(regex, String(value));
    });
  }

  // Apply Indian context fixes for English
  if (langCode === 'en') {
    Object.entries(INDIAN_CONTEXT_FIXES).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, 'g');
      optimized = optimized.replace(regex, value);
    });
  }

  // Apply general optimizations for all languages
  optimized = applyGeneralOptimizations(optimized, langCode);

  return optimized;
}

/**
 * Apply general pronunciation optimizations
 */
function applyGeneralOptimizations(text: string, langCode: string): string {
  let result = text;

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ').trim();

  // Add natural pauses for better flow
  result = result.replace(/([.!?])\s*/g, '$1 '); // Space after sentence endings
  result = result.replace(/([,;:])\s*/g, '$1 '); // Space after separators

  // Handle numbers for better pronunciation
  result = handleNumbers(result, langCode);

  // Remove excessive punctuation
  result = result.replace(/\.{2,}/g, '. ');
  result = result.replace(/!{2,}/g, '! ');
  result = result.replace(/\?{2,}/g, '? ');

  // Add slight pauses between long words for clarity
  if (containsIndianScript(result)) {
    // For Indian scripts, add micro-pauses for better pronunciation
    result = result.replace(/([^\s]{15,})/g, '$1, ');
  }

  return result;
}

/**
 * Enhanced number handling with Indian numbering system support
 */
function handleNumbers(text: string, langCode: string): string {
  let result = text;

  // Indian numbering system (Lakh, Crore)
  if (langCode === 'en' || langCode === 'hi') {
    // Convert large numbers to Indian format
    result = result.replace(/\b(\d{1,2}),(\d{2}),(\d{3})\b/g, '$1 lakh $2 thousand $3');
    result = result.replace(/\b(\d{1,2}),(\d{2}),(\d{2}),(\d{3})\b/g, '$1 crore $2 lakh');
  }

  // Add commas to numbers for natural pauses
  result = result.replace(/\b(\d{1,3})(\d{3})\b/g, '$1,$2');

  // Spell out small numbers for clarity
  const numberWords = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '10': 'ten'
  };

  // Replace single digit numbers in certain contexts
  result = result.replace(/\b([0-9])\s+(am|pm|AM|PM)\b/g, (match, num, ampm) => {
    return `${numberWords[num] || num} ${ampm}`;
  });

  return result;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get optimal language code for TTS
 */
export function getOptimalLanguageCode(languageCode: string): string {
  const mapping: Record<string, string> = {
    // Indian Languages - use full locale for better quality
    'hi': 'hi-IN', 'hi-IN': 'hi-IN',
    'kn': 'kn-IN', 'kn-IN': 'kn-IN',
    'ta': 'ta-IN', 'ta-IN': 'ta-IN',
    'te': 'te-IN', 'te-IN': 'te-IN',
    'ml': 'ml-IN', 'ml-IN': 'ml-IN',
    'bn': 'bn-IN', 'bn-IN': 'bn-IN',
    'gu': 'gu-IN', 'gu-IN': 'gu-IN',
    'mr': 'mr-IN', 'mr-IN': 'mr-IN',
    'pa': 'pa-IN', 'pa-IN': 'pa-IN',

    // English - prefer US for clearer pronunciation
    'en': 'en-US', 'en-US': 'en-US',
    'en-GB': 'en-GB', 'en-IN': 'en-IN',

    // European
    'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
    'pt': 'pt-PT', 'ru': 'ru-RU',

    // Asian
    'zh': 'zh-CN', 'ja': 'ja-JP', 'ko': 'ko-KR',
    'th': 'th-TH', 'vi': 'vi-VN', 'id': 'id-ID',
  };

  return mapping[languageCode] || languageCode;
}

/**
 * Enhanced text splitting with sentence awareness
 */
export function splitTextForTTS(text: string, maxLength: number = 200): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];

  // Split by sentences first (multiple punctuation marks)
  const sentences = text.match(/[^.!?।॥]+[.!?।॥]+/g) || [text];

  let currentChunk = '';

  sentences.forEach(sentence => {
    const trimmed = sentence.trim();

    if ((currentChunk + ' ' + trimmed).length > maxLength) {
      // Current chunk is full, save it
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // If single sentence is too long, split by comma or space
      if (trimmed.length > maxLength) {
        const parts = trimmed.split(/[,;]/g);
        parts.forEach((part, idx) => {
          const withPunctuation = idx < parts.length - 1 ? part + ',' : part;

          if ((currentChunk + ' ' + withPunctuation).length > maxLength) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = withPunctuation;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + withPunctuation;
          }
        });
      } else {
        currentChunk = trimmed;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmed;
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Detect if text contains Indian script
 */
export function containsIndianScript(text: string): boolean {
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
