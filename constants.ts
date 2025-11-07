import type { Language } from './types';

// 🌍 INTERNATIONAL LANGUAGES - Indian Languages First, Then Others
export const SUPPORTED_LANGUAGES: Language[] = [
  // Indian Languages (Priority Order: Kannada, Telugu, Tamil, Malayalam, Hindi, Others)
  { code: 'kn-IN', name: '🇮🇳 ಕನ್ನಡ (Kannada)' },
  { code: 'te-IN', name: '🇮🇳 తెలుగు (Telugu)' },
  { code: 'ta-IN', name: '🇮🇳 தமிழ் (Tamil)' },
  { code: 'ml-IN', name: '🇮🇳 മലയാളം (Malayalam)' },
  { code: 'hi-IN', name: '🇮🇳 हिन्दी (Hindi)' },
  { code: 'bn-IN', name: '🇮🇳 বাংলা (Bengali)' },
  { code: 'gu-IN', name: '🇮🇳 ગુજરાતી (Gujarati)' },
  { code: 'mr-IN', name: '🇮🇳 मराठी (Marathi)' },
  { code: 'pa-IN', name: '🇮🇳 ਪੰਜਾਬੀ (Punjabi)' },
  
  // English
  { code: 'en-US', name: '🇺🇸 English (US)' },
  { code: 'en-GB', name: '🇬🇧 English (UK)' },
  
  // European Languages
  { code: 'es-ES', name: '🇪🇸 Español (Spanish)' },
  { code: 'fr-FR', name: '🇫🇷 Français (French)' },
  { code: 'de-DE', name: '🇩🇪 Deutsch (German)' },
  { code: 'it-IT', name: '🇮🇹 Italiano (Italian)' },
  { code: 'pt-PT', name: '🇵🇹 Português (Portuguese)' },
  { code: 'pt-BR', name: '🇧🇷 Português (Brazilian)' },
  { code: 'ru-RU', name: '🇷🇺 Русский (Russian)' },
  { code: 'nl-NL', name: '🇳🇱 Nederlands (Dutch)' },
  { code: 'pl-PL', name: '🇵🇱 Polski (Polish)' },
  { code: 'tr-TR', name: '🇹🇷 Türkçe (Turkish)' },
  { code: 'sv-SE', name: '🇸🇪 Svenska (Swedish)' },
  { code: 'no-NO', name: '🇳🇴 Norsk (Norwegian)' },
  { code: 'da-DK', name: '🇩🇰 Dansk (Danish)' },
  { code: 'fi-FI', name: '🇫🇮 Suomi (Finnish)' },
  { code: 'el-GR', name: '🇬🇷 Ελληνικά (Greek)' },
  { code: 'cs-CZ', name: '🇨🇿 Čeština (Czech)' },
  { code: 'ro-RO', name: '🇷🇴 Română (Romanian)' },
  { code: 'hu-HU', name: '🇭🇺 Magyar (Hungarian)' },
  { code: 'uk-UA', name: '🇺🇦 Українська (Ukrainian)' },
  
  // East Asian Languages
  { code: 'zh-CN', name: '🇨🇳 中文 (Chinese Simplified)' },
  { code: 'zh-TW', name: '🇹🇼 中文 (Chinese Traditional)' },
  { code: 'ja-JP', name: '🇯🇵 日本語 (Japanese)' },
  { code: 'ko-KR', name: '🇰🇷 한국어 (Korean)' },
  
  // Southeast Asian Languages
  { code: 'th-TH', name: '🇹🇭 ไทย (Thai)' },
  { code: 'vi-VN', name: '🇻🇳 Tiếng Việt (Vietnamese)' },
  { code: 'id-ID', name: '🇮🇩 Bahasa Indonesia (Indonesian)' },
  { code: 'ms-MY', name: '🇲🇾 Bahasa Melayu (Malay)' },
  { code: 'fil-PH', name: '🇵🇭 Filipino (Tagalog)' },
  
  // Middle Eastern Languages
  { code: 'ar-SA', name: '🇸🇦 العربية (Arabic)' },
  { code: 'he-IL', name: '🇮🇱 עברית (Hebrew)' },
  { code: 'fa-IR', name: '🇮🇷 فارسی (Persian)' },
  
  // African Languages
  { code: 'af-ZA', name: '🇿🇦 Afrikaans' },
  { code: 'sw-KE', name: '🇰🇪 Kiswahili (Swahili)' },
  
  // Other European Languages
  { code: 'ca-ES', name: '🇪🇸 Català (Catalan)' },
  { code: 'hr-HR', name: '🇭🇷 Hrvatski (Croatian)' },
  { code: 'sr-RS', name: '🇷🇸 Српски (Serbian)' },
  { code: 'sk-SK', name: '🇸🇰 Slovenčina (Slovak)' },
  { code: 'sl-SI', name: '🇸🇮 Slovenščina (Slovenian)' },
  { code: 'bg-BG', name: '🇧🇬 Български (Bulgarian)' },
  { code: 'lt-LT', name: '🇱🇹 Lietuvių (Lithuanian)' },
  { code: 'lv-LV', name: '🇱🇻 Latviešu (Latvian)' },
  { code: 'et-EE', name: '🇪🇪 Eesti (Estonian)' },
]; // No sorting - maintaining priority order (Indian languages first)

export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;
export const SCRIPT_PROCESSOR_BUFFER_SIZE = 512; // Smallest possible buffer for instant response