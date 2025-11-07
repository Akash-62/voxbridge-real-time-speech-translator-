"""
🎤 VoxBridge TTS Server - Local TTS with gTTS
Runs locally, FREE, and supports Indian languages!
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from gtts import gTTS
import base64
import os
from pathlib import Path
import io

app = FastAPI(title="VoxBridge TTS Server")

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    language: str

class VoiceInfo(BaseModel):
    language: str
    voice: str
    quality: str

# 🇮🇳 Indian languages supported by gTTS
INDIAN_LANGUAGES = {
    'hi': {
        'tld': 'co.in',
        'name': 'Hindi (Google)',
        'quality': 'excellent'
    },
    'kn': {
        'tld': 'co.in',
        'name': 'Kannada (Google)',
        'quality': 'excellent'
    },
    'ta': {
        'tld': 'co.in',
        'name': 'Tamil (Google)',
        'quality': 'excellent'
    },
    'te': {
        'tld': 'co.in',
        'name': 'Telugu (Google)',
        'quality': 'excellent'
    },
    'ml': {
        'tld': 'co.in',
        'name': 'Malayalam (Google)',
        'quality': 'excellent'
    },
    'en': {
        'tld': 'com',
        'name': 'English (Google)',
        'quality': 'excellent'
    },
    'bn': {
        'tld': 'co.in',
        'name': 'Bengali (Google)',
        'quality': 'excellent'
    },
    'gu': {
        'tld': 'co.in',
        'name': 'Gujarati (Google)',
        'quality': 'excellent'
    },
    'mr': {
        'tld': 'co.in',
        'name': 'Marathi (Google)',
        'quality': 'excellent'
    }
}

@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "VoxBridge TTS Server",
        "version": "1.0.0",
        "supported_languages": list(INDIAN_LANGUAGES.keys())
    }

@app.get("/voices")
async def get_voices():
    """Get all available voices"""
    return {
        "voices": INDIAN_LANGUAGES,
        "total": len(INDIAN_LANGUAGES)
    }

@app.post("/speak")
async def speak(request: TTSRequest):
    """Generate speech from text"""
    try:
        print(f"🎤 Generating speech: '{request.text}' in {request.language}")
        
        # Get language config
        lang_config = INDIAN_LANGUAGES.get(request.language)
        if not lang_config:
            raise HTTPException(
                status_code=400,
                detail=f"Language '{request.language}' not supported. Available: {list(INDIAN_LANGUAGES.keys())}"
            )
        
        # Generate speech using gTTS
        tts = gTTS(
            text=request.text,
            lang=request.language,
            tld=lang_config['tld'],
            slow=False
        )
        
        # Save to BytesIO buffer instead of file
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Encode to base64
        audio_data = audio_buffer.read()
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        print(f"✅ Speech generated successfully using {lang_config['name']}")
        
        return {
            "success": True,
            "audio": audio_base64,
            "voice": lang_config['name'],
            "language": request.language,
            "text": request.text
        }
        
    except Exception as e:
        print(f"❌ Error generating speech: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting VoxBridge TTS Server...")
    print("📝 Supported languages:", list(INDIAN_LANGUAGES.keys()))
    print("🌐 Server will be available at: http://localhost:8000")
    print("📖 API docs: http://localhost:8000/docs")
    print("🎤 Using Google TTS (gTTS) - Reliable & Works!")
    uvicorn.run(app, host="0.0.0.0", port=8000)

