"""
Test script for gTTS Server
Tests all supported Indian languages
"""

import requests
import json

SERVER_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not reachable: {e}")
        return False

def test_tts(text, language):
    """Test TTS endpoint"""
    print(f"\n🎤 Testing TTS: '{text}' in {language}")
    try:
        response = requests.post(
            f"{SERVER_URL}/tts",
            json={"text": text, "language": language},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ TTS successful - Audio size: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ TTS failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ TTS error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 gTTS Server Test Suite")
    print("=" * 60)
    print()
    
    # Test health
    if not test_health():
        print("\n❌ Server is not running. Start it with: python gtts_server.py")
        return
    
    print("\n" + "=" * 60)
    print("Testing Indian Languages")
    print("=" * 60)
    
    # Test cases for Indian languages
    tests = [
        ("नमस्ते, आप कैसे हैं?", "hi-IN", "Hindi"),
        ("ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?", "kn-IN", "Kannada"),
        ("வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?", "ta-IN", "Tamil"),
        ("నమస్కారం, మీరు ఎలా ఉన్నారు?", "te-IN", "Telugu"),
        ("നമസ്കാരം, നിങ്ങൾക്ക് എങ്ങനെയുണ്ട്?", "ml-IN", "Malayalam"),
        ("નમસ્તે, તમે કેમ છો?", "gu-IN", "Gujarati"),
        ("नमस्कार, तुम्ही कसे आहात?", "mr-IN", "Marathi"),
        ("নমস্কার, আপনি কেমন আছেন?", "bn-IN", "Bengali"),
        ("Hello, how are you?", "en-IN", "English"),
    ]
    
    passed = 0
    failed = 0
    
    for text, lang, name in tests:
        if test_tts(text, lang):
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print("📊 Test Results")
    print("=" * 60)
    print(f"✅ Passed: {passed}/{len(tests)}")
    print(f"❌ Failed: {failed}/{len(tests)}")
    
    if failed == 0:
        print("\n🎉 All tests passed! gTTS server is working perfectly!")
    else:
        print(f"\n⚠️ Some tests failed. Check server logs.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
