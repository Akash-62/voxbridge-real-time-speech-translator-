// Local development TTS server (runs alongside Vite)
import http from 'http';
import https from 'https';

const PORT = 3002;

// Language code mapping (same as api/tts.js)
const LANGUAGE_MAP = {
  'english': 'en',
  'hindi': 'hi',
  'kannada': 'kn',
  'tamil': 'ta',
  'telugu': 'te',
  'malayalam': 'ml',
  'bengali': 'bn',
  'gujarati': 'gu',
  'marathi': 'mr',
  'punjabi': 'pa',
  'urdu': 'ur',
  'spanish': 'es',
  'french': 'fr',
  'german': 'de',
  'chinese': 'zh',
  'japanese': 'ja',
  'korean': 'ko',
  'arabic': 'ar',
  'russian': 'ru',
  'portuguese': 'pt',
  'italian': 'it',
  'dutch': 'nl',
  'turkish': 'tr',
  'polish': 'pl',
  'vietnamese': 'vi',
  'thai': 'th',
  'indonesian': 'id',
  'filipino': 'tl',
  'malay': 'ms',
  'persian': 'fa',
  'hebrew': 'he',
  'greek': 'el',
  'czech': 'cs',
  'swedish': 'sv',
  'danish': 'da',
  'finnish': 'fi',
  'norwegian': 'no',
  'romanian': 'ro',
  'hungarian': 'hu',
  'slovak': 'sk',
  'bulgarian': 'bg',
  'croatian': 'hr',
  'serbian': 'sr',
  'ukrainian': 'uk'
};

function handleRequest(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Local TTS server running',
      port: PORT 
    }));
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { text, language } = JSON.parse(body);
        
        if (!text || !language) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing text or language' }));
          return;
        }

        const langCode = LANGUAGE_MAP[language.toLowerCase()] || language;
        
        console.log(`[TTS] Generating: "${text.substring(0, 50)}..." in ${langCode}`);

        // Build Google TTS URL
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(text)}`;
        
        // Fetch from Google
        https.get(ttsUrl, (googleRes) => {
          if (googleRes.statusCode !== 200) {
            console.error(`[TTS] Google error: ${googleRes.statusCode}`);
            res.writeHead(googleRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Google TTS failed' }));
            return;
          }

          // Forward the audio
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=3600'
          });

          googleRes.pipe(res);
          
          googleRes.on('end', () => {
            console.log(`[TTS] Success: ${text.substring(0, 30)}...`);
          });

        }).on('error', (error) => {
          console.error(`[TTS] Error:`, error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        });

      } catch (error) {
        console.error('[TTS] Parse error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🔊 Local TTS server running at http://localhost:${PORT}`);
  console.log(`✅ Ready to handle requests from Vite dev server`);
});
