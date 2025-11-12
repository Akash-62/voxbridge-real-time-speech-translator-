const fetch = require('node-fetch');

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
      status: 'VoxBridge TTS API - Vercel Node.js',
      version: '3.0',
      endpoint: '/api/tts (POST)'
    });
  }

  // Handle POST - TTS
  if (req.method === 'POST') {
    try {
      const { text, language } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'No text provided' });
      }

      // Use Google Translate TTS API
      const lang = language || 'en';
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;

      // Fetch audio from Google
      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Google TTS failed: ${response.status}`);
      }

      const audioBuffer = await response.buffer();

      // Send audio response
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(audioBuffer);

    } catch (error) {
      console.error('TTS Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
