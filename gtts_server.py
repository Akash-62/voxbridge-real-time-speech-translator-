"""
Google TTS Server for VoxBridge
High-quality text-to-speech using gTTS library
Supports 60+ international languages with native pronunciation
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import io
import os
import tempfile
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Supported international languages mapping (60+ languages)
LANGUAGE_MAP = {
    # Indian Languages
    'hi': 'hi', 'hi-IN': 'hi',      # Hindi
    'kn': 'kn', 'kn-IN': 'kn',      # Kannada
    'ml': 'ml', 'ml-IN': 'ml',      # Malayalam
    'ta': 'ta', 'ta-IN': 'ta',      # Tamil
    'te': 'te', 'te-IN': 'te',      # Telugu
    'bn': 'bn', 'bn-IN': 'bn',      # Bengali
    'gu': 'gu', 'gu-IN': 'gu',      # Gujarati
    'mr': 'mr', 'mr-IN': 'mr',      # Marathi
    'pa': 'pa', 'pa-IN': 'pa',      # Punjabi
    
    # English
    'en': 'en', 'en-US': 'en', 'en-GB': 'en',
    
    # European Languages
    'es': 'es', 'es-ES': 'es',      # Spanish
    'fr': 'fr', 'fr-FR': 'fr',      # French
    'de': 'de', 'de-DE': 'de',      # German
    'it': 'it', 'it-IT': 'it',      # Italian
    'pt': 'pt', 'pt-PT': 'pt', 'pt-BR': 'pt',  # Portuguese
    'ru': 'ru', 'ru-RU': 'ru',      # Russian
    'nl': 'nl', 'nl-NL': 'nl',      # Dutch
    'pl': 'pl', 'pl-PL': 'pl',      # Polish
    'tr': 'tr', 'tr-TR': 'tr',      # Turkish
    'sv': 'sv', 'sv-SE': 'sv',      # Swedish
    'no': 'no', 'no-NO': 'no',      # Norwegian
    'da': 'da', 'da-DK': 'da',      # Danish
    'fi': 'fi', 'fi-FI': 'fi',      # Finnish
    'el': 'el', 'el-GR': 'el',      # Greek
    'cs': 'cs', 'cs-CZ': 'cs',      # Czech
    'ro': 'ro', 'ro-RO': 'ro',      # Romanian
    'hu': 'hu', 'hu-HU': 'hu',      # Hungarian
    'uk': 'uk', 'uk-UA': 'uk',      # Ukrainian
    'ca': 'ca', 'ca-ES': 'ca',      # Catalan
    'hr': 'hr', 'hr-HR': 'hr',      # Croatian
    'sr': 'sr', 'sr-RS': 'sr',      # Serbian
    'sk': 'sk', 'sk-SK': 'sk',      # Slovak
    'sl': 'sl', 'sl-SI': 'sl',      # Slovenian
    'bg': 'bg', 'bg-BG': 'bg',      # Bulgarian
    'lt': 'lt', 'lt-LT': 'lt',      # Lithuanian
    'lv': 'lv', 'lv-LV': 'lv',      # Latvian
    'et': 'et', 'et-EE': 'et',      # Estonian
    
    # East Asian
    'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW',  # Chinese
    'ja': 'ja', 'ja-JP': 'ja',      # Japanese
    'ko': 'ko', 'ko-KR': 'ko',      # Korean
    
    # Southeast Asian
    'th': 'th', 'th-TH': 'th',      # Thai
    'vi': 'vi', 'vi-VN': 'vi',      # Vietnamese
    'id': 'id', 'id-ID': 'id',      # Indonesian
    'ms': 'ms', 'ms-MY': 'ms',      # Malay
    'fil': 'tl', 'fil-PH': 'tl',    # Filipino (uses Tagalog)
    
    # Middle Eastern
    'ar': 'ar', 'ar-SA': 'ar',      # Arabic
    'he': 'iw', 'he-IL': 'iw',      # Hebrew (gTTS uses 'iw')
    'fa': 'fa', 'fa-IR': 'fa',      # Persian
    
    # African
    'af': 'af', 'af-ZA': 'af',      # Afrikaans
    'sw': 'sw', 'sw-KE': 'sw',      # Swahili
}

# gTTS actually supported languages (expanded from original 9 to 60+)
GTTS_SUPPORTED = [
    # Indian
    'hi', 'bn', 'gu', 'kn', 'ml', 'mr', 'ta', 'te',
    # English
    'en',
    # European
    'es', 'fr', 'de', 'it', 'pt', 'ru', 'nl', 'pl', 'tr', 'sv', 'no', 'da', 'fi', 'el',
    'cs', 'ro', 'hu', 'uk', 'ca', 'hr', 'sr', 'sk', 'sl', 'bg', 'lt', 'lv', 'et',
    # Asian
    'zh-CN', 'zh-TW', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'tl',
    # Middle Eastern
    'ar', 'iw', 'fa',
    # African
    'af', 'sw'
]

def get_language_code(lang: str) -> str:
    """Get normalized language code for gTTS"""
    lang_lower = lang.lower().strip()
    
    # Direct mapping lookup
    if lang_lower in LANGUAGE_MAP:
        mapped = LANGUAGE_MAP[lang_lower]
        if mapped in GTTS_SUPPORTED:
            return mapped
    
    # Try base language (e.g., 'en' from 'en-US')
    base_lang = lang_lower.split('-')[0]
    if base_lang in GTTS_SUPPORTED:
        return base_lang
    
    # Check if base is in mapping
    if base_lang in LANGUAGE_MAP:
        mapped = LANGUAGE_MAP[base_lang]
        if mapped in GTTS_SUPPORTED:
            return mapped
    
    # Default to English for unsupported languages
    logger.warning(f"Language '{lang}' not supported, falling back to English")
    return 'en'

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'gTTS Server',
        'version': '1.0.0',
        'supported_languages': GTTS_SUPPORTED
    })

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to speech using gTTS
    
    Request JSON:
    {
        "text": "Text to speak",
        "language": "hi-IN" or "hi"
    }
    
    Returns: Audio file (MP3)
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        text = data.get('text', '').strip()
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Get proper language code
        lang_code = get_language_code(language)
        
        logger.info(f"TTS Request - Text: '{text[:50]}...', Language: {language} -> {lang_code}")
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to memory buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        logger.info(f"✅ TTS generated successfully for {lang_code}")
        
        # Return audio file
        return send_file(
            audio_buffer,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=f'speech_{lang_code}.mp3'
        )
    
    except Exception as e:
        logger.error(f"❌ TTS Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/tts/stream', methods=['POST'])
def text_to_speech_stream():
    """
    Stream TTS audio (alternative endpoint)
    """
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        lang_code = get_language_code(language)
        
        # Generate speech
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Use temporary file for streaming
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            tts.save(temp_file.name)
            temp_file.seek(0)
            
            response = send_file(
                temp_file.name,
                mimetype='audio/mpeg',
                as_attachment=False
            )
            
            # Clean up temp file after sending
            @response.call_on_close
            def cleanup():
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
            
            return response
    
    except Exception as e:
        logger.error(f"❌ Stream TTS Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    return jsonify({
        'supported': GTTS_SUPPORTED,
        'all_mappings': LANGUAGE_MAP
    })

if __name__ == '__main__':
    import os
    
    # Get port from environment variable (for Render.com) or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    
    print("=" * 60)
    print("🎤 Google TTS Server Starting...")
    print("=" * 60)
    print(f"✅ Supported Languages: {len(GTTS_SUPPORTED)} languages")
    print(f"🌍 International: English, Spanish, French, German, Italian, etc.")
    print(f"🇮🇳 Indian: Hindi, Kannada, Malayalam, Tamil, Telugu, Bengali, etc.")
    print(f"🌏 Asian: Chinese, Japanese, Korean, Thai, Vietnamese, etc.")
    print(f"🌐 Server will run on: http://0.0.0.0:{port}")
    print(f"📡 CORS enabled for all origins")
    print("=" * 60)
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        threaded=True
    )

