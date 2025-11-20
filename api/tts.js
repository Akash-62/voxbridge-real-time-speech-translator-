// Enhanced language mapping for better pronunciation
const LANGUAGE_MAP = {
  // Indian Languages (full locale support)
  'hi-IN': 'hi', 'hi': 'hi',
  'kn-IN': 'kn', 'kn': 'kn',
  'ml-IN': 'ml', 'ml': 'ml',
  'ta-IN': 'ta', 'ta': 'ta',
  'te-IN': 'te', 'te': 'te',
  'bn-IN': 'bn', 'bn': 'bn',
  'gu-IN': 'gu', 'gu': 'gu',
  'mr-IN': 'mr', 'mr': 'mr',
  'pa-IN': 'pa', 'pa': 'pa',
  
  // English
  'en-US': 'en', 'en-GB': 'en', 'en': 'en',
  
  // European Languages
  'es-ES': 'es', 'es': 'es',
  'fr-FR': 'fr', 'fr': 'fr',
  'de-DE': 'de', 'de': 'de',
  'it-IT': 'it', 'it': 'it',
  'pt-PT': 'pt', 'pt': 'pt',
  'ru-RU': 'ru', 'ru': 'ru',
  'nl-NL': 'nl', 'nl': 'nl',
  'pl-PL': 'pl', 'pl': 'pl',
  'tr-TR': 'tr', 'tr': 'tr',
  
  // East Asian
  'zh-CN': 'zh-CN', 'zh': 'zh-CN',
  'ja-JP': 'ja', 'ja': 'ja',
  'ko-KR': 'ko', 'ko': 'ko',
  
  // Southeast Asian
  'th-TH': 'th', 'th': 'th',
  'vi-VN': 'vi', 'vi': 'vi',
  'id-ID': 'id', 'id': 'id',
  'ms-MY': 'ms', 'ms': 'ms',
  'fil-PH': 'fil', 'fil': 'fil',
  
  // Middle Eastern
  'ar-SA': 'ar', 'ar': 'ar',
  'he-IL': 'iw', 'he': 'iw',
  'fa-IR': 'fa', 'fa': 'fa',
  
  // Other
  'af-ZA': 'af', 'af': 'af',
  'sw-KE': 'sw', 'sw': 'sw'
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET - Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'VoxBridge gTTS API - Vercel Serverless',
      version: '4.0',
      engine: 'Google Text-to-Speech (gTTS)',
      supported_languages: Object.keys(LANGUAGE_MAP).length,
      endpoint: '/api/tts (POST with {text, language})',
      quality: 'High-quality native pronunciation'
    });
  }

  // Handle POST - TTS with gTTS quality
  if (req.method === 'POST') {
    try {
      const { text, language } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'No text provided' });
      }

      // Map language code
      const langCode = LANGUAGE_MAP[language] || language || 'en';
      
      console.log(`[TTS] Generating: "${text}" in ${langCode}`);

      // Use Google Translate TTS API (same backend as gTTS!)
      // This is the official Google TTS endpoint used by gTTS library
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text)}`;

      // Fetch audio from Google with proper headers
      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });

      if (!response.ok) {
        console.error(`[TTS] Google API error: ${response.status}`);
        throw new Error(`Google TTS API failed: ${response.status}`);
      }

      // For Vercel, use arrayBuffer instead of buffer
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      if (audioBuffer.length === 0) {
        throw new Error('Empty audio response from Google TTS');
      }

      console.log(`[TTS] Success: ${audioBuffer.length} bytes for "${text}" in ${langCode}`);

      // Send audio response
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.status(200).send(audioBuffer);

    } catch (error) {
      console.error('[TTS] Error:', error);
      return res.status(500).json({ 
        error: error.message,
        details: 'Failed to generate speech. Please try again.'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
