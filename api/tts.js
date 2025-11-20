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
  // ENHANCED CORS - Critical for Vercel serverless functions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    console.log('[TTS] ✅ CORS preflight request handled');
    return res.status(200).end();
  }

  // Handle GET - Health check with detailed diagnostics
  if (req.method === 'GET') {
    console.log('[TTS] 📊 Health check requested');
    return res.status(200).json({
      status: '✅ VoxBridge gTTS API - Vercel Serverless ACTIVE',
      version: '5.0',
      engine: 'Google Text-to-Speech (gTTS)',
      supported_languages: Object.keys(LANGUAGE_MAP).length,
      endpoint: '/api/tts',
      usage: 'POST with JSON body: {text: "hello", language: "en-US"}',
      quality: 'High-quality native pronunciation',
      timestamp: new Date().toISOString(),
      vercel: true
    });
  }

  // Handle POST - TTS with enhanced error handling
  if (req.method === 'POST') {
    const startTime = Date.now();

    try {
      // Log incoming request
      console.log('[TTS] 📥 Incoming request:', {
        method: req.method,
        headers: req.headers,
        bodyType: typeof req.body
      });

      // Parse body if needed (Vercel should auto-parse JSON)
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.error('[TTS] ❌ JSON parse error:', e);
          return res.status(400).json({
            error: 'Invalid JSON in request body',
            details: e.message
          });
        }
      }

      const { text, language } = body;

      // Validate input
      if (!text || typeof text !== 'string' || !text.trim()) {
        console.error('[TTS] ❌ No text provided');
        return res.status(400).json({
          error: 'No text provided',
          details: 'Request must include "text" field with non-empty string'
        });
      }

      // Map language code
      const langCode = LANGUAGE_MAP[language] || language || 'en';

      console.log(`[TTS] 🎯 Processing: "${text.substring(0, 50)}..." in ${langCode}`);

      // Use Google Translate TTS API (same backend as gTTS!)
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text)}`;

      console.log(`[TTS] 🌐 Calling Google TTS API...`);

      // Fetch audio from Google with proper headers and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
          'Accept': 'audio/mpeg'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`[TTS] 📡 Google API response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`[TTS] ❌ Google API error: ${response.status} - ${errorText}`);
        return res.status(502).json({
          error: `Google TTS API failed with status ${response.status}`,
          details: errorText,
          language: langCode
        });
      }

      // Get audio data
      const audioBuffer = Buffer.from(await response.arrayBuffer());

      if (audioBuffer.length === 0) {
        console.error('[TTS] ❌ Empty audio response from Google');
        return res.status(502).json({
          error: 'Empty audio response from Google TTS',
          details: 'Google returned 200 OK but no audio data'
        });
      }

      const duration = Date.now() - startTime;
      console.log(`[TTS] ✅ Success: ${audioBuffer.length} bytes in ${duration}ms for "${text.substring(0, 30)}..." (${langCode})`);

      // Send audio response with proper headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('X-TTS-Language', langCode);
      res.setHeader('X-TTS-Duration', duration.toString());

      return res.status(200).send(audioBuffer);

    } catch (error) {
      const duration = Date.now() - startTime;

      // Detailed error logging
      console.error('[TTS] ❌ Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      });

      // Handle specific error types
      if (error.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request timeout',
          details: 'Google TTS API took too long to respond (>15s)'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
        type: error.name
      });
    }
  }

  console.log(`[TTS] ❌ Method not allowed: ${req.method}`);
  return res.status(405).json({
    error: 'Method not allowed',
    allowed: ['GET', 'POST', 'OPTIONS']
  });
};
