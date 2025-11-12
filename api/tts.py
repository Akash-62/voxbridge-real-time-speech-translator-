from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import tempfile
import os

app = Flask(__name__)
CORS(app)

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

@app.route('/api/tts', methods=['GET', 'POST'])
def text_to_speech():
    """Vercel Serverless Function for TTS"""
    
    # Handle OPTIONS for CORS
    if request.method == 'OPTIONS':
        return '', 200
    
    # Handle GET for health check
    if request.method == 'GET':
        return jsonify({
            'status': 'VoxBridge TTS API - Vercel Serverless',
            'version': '2.0',
            'supported_languages': len(LANGUAGE_MAP),
            'endpoint': '/api/tts (POST)'
        })
    
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Get language code
        lang_code = LANGUAGE_MAP.get(language.lower(), 'en')
        
        # Generate speech with gTTS
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        tts.save(temp_file.name)
        temp_file.close()
        
        # Send file
        response = send_file(
            temp_file.name,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name='speech.mp3'
        )
        
        # Clean up after sending
        @response.call_on_close
        def cleanup():
            try:
                os.unlink(temp_file.name)
            except:
                pass
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vercel serverless handler
def handler(environ, start_response):
    """WSGI handler for Vercel"""
    with app.request_context(environ):
        response = app.full_dispatch_request()
        return response(environ, start_response)
