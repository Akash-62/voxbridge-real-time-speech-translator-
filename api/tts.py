from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs
import json
from gtts import gTTS
import tempfile
import os
import base64

# Language mapping
LANGUAGE_MAP = {
    'en': 'en', 'hi': 'hi', 'kn': 'kn', 'ml': 'ml', 'ta': 'ta', 'te': 'te',
    'bn': 'bn', 'gu': 'gu', 'mr': 'mr', 'pa': 'pa', 'es': 'es', 'fr': 'fr',
    'de': 'de', 'it': 'it', 'pt': 'pt', 'ru': 'ru', 'ja': 'ja', 'ko': 'ko',
    'zh': 'zh-CN', 'ar': 'ar', 'nl': 'nl', 'pl': 'pl', 'tr': 'tr', 'th': 'th',
    'vi': 'vi', 'id': 'id', 'ms': 'ms', 'fil': 'tl', 'sv': 'sv', 'no': 'no',
    'da': 'da', 'fi': 'fi', 'el': 'el', 'cs': 'cs', 'ro': 'ro', 'hu': 'hu',
    'uk': 'uk', 'he': 'iw', 'fa': 'fa', 'sw': 'sw', 'af': 'af', 'am': 'am'
}

class handler(BaseHTTPRequestHandler):
    """Vercel Serverless Function Handler"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'status': 'VoxBridge TTS API - Vercel Serverless',
            'version': '2.0',
            'supported_languages': len(LANGUAGE_MAP),
            'endpoint': '/api/tts (POST with {text, language})'
        }
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Generate TTS audio"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            # Parse JSON
            data = json.loads(body)
            text = data.get('text', '').strip()
            language = data.get('language', 'en')
            
            if not text:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No text provided'}).encode())
                return
            
            # Get language code
            lang_code = LANGUAGE_MAP.get(language.lower(), 'en')
            
            print(f"Generating TTS: '{text}' in {lang_code}")
            
            # Generate speech with gTTS
            tts = gTTS(text=text, lang=lang_code, slow=False)
            
            # Save to temp file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            tts.save(temp_file.name)
            temp_file.close()
            
            # Read audio file
            with open(temp_file.name, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            # Clean up temp file
            try:
                os.unlink(temp_file.name)
            except:
                pass
            
            # Send audio response
            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Content-Length', str(len(audio_data)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(audio_data)
            
            print(f"✅ TTS generated successfully: {len(audio_data)} bytes")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
