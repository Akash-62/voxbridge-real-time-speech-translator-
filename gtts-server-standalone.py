"""
Simple gTTS Server for VoxBridge
Deploy this on Render.com, Railway.app, or any Python hosting
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Language mapping (same as in api/tts.py)
LANGUAGE_MAP = {
    'en-US': 'en', 'en-GB': 'en', 'hi-IN': 'hi', 'kn-IN': 'kn', 'ml-IN': 'ml', 
    'ta-IN': 'ta', 'te-IN': 'te', 'bn-IN': 'bn', 'gu-IN': 'gu', 'mr-IN': 'mr', 
    'pa-IN': 'pa', 'es-ES': 'es', 'fr-FR': 'fr', 'de-DE': 'de', 'it-IT': 'it',
    'pt-PT': 'pt', 'ru-RU': 'ru', 'ja-JP': 'ja', 'ko-KR': 'ko', 'zh-CN': 'zh-CN',
    'ar-SA': 'ar', 'nl-NL': 'nl', 'pl-PL': 'pl', 'tr-TR': 'tr', 'th-TH': 'th',
    'vi-VN': 'vi', 'id-ID': 'id', 'ms-MY': 'ms', 'fil-PH': 'tl', 'sv-SE': 'sv',
    'no-NO': 'no', 'da-DK': 'da', 'fi-FI': 'fi', 'el-GR': 'el', 'cs-CZ': 'cs',
    'ro-RO': 'ro', 'hu-HU': 'hu', 'uk-UA': 'uk', 'he-IL': 'iw', 'fa-IR': 'fa',
    'sw-KE': 'sw', 'af-ZA': 'af'
}

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'VoxBridge gTTS Server Running',
        'version': '1.0',
        'supported_languages': len(LANGUAGE_MAP),
        'endpoint': '/tts (POST)'
    })

@app.route('/tts', methods=['POST', 'OPTIONS'])
def text_to_speech():
    """Generate TTS audio using Google TTS"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        language = data.get('language', 'en-US')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Map language code
        lang_code = LANGUAGE_MAP.get(language, 'en')
        
        print(f"Generating TTS: '{text}' in {lang_code}")
        
        # Generate speech with gTTS (Google TTS quality!)
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        tts.save(temp_file.name)
        temp_file.close()
        
        print(f"✅ Generated audio: {os.path.getsize(temp_file.name)} bytes")
        
        # Send file and clean up
        response = send_file(
            temp_file.name,
            mimetype='audio/mpeg',
            as_attachment=False
        )
        
        # Schedule cleanup after sending
        @response.call_on_close
        def cleanup():
            try:
                os.unlink(temp_file.name)
                print(f"✅ Cleaned up temp file")
            except Exception as e:
                print(f"⚠️ Cleanup error: {e}")
        
        return response
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
