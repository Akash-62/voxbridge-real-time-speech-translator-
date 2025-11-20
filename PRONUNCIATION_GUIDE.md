# VoxBridge Pronunciation Enhancement Guide

## 🎯 Overview
VoxBridge now includes advanced pronunciation optimization for natural, high-quality speech synthesis across 60+ languages with special focus on Indian languages.

## 🚀 What's New (v4.0)

### ✨ Pronunciation Optimizer
- **Automatic text preprocessing** for better TTS quality
- **Language-specific rules** for Indian and international languages
- **Smart text chunking** for optimal audio generation
- **Indian English fixes** (Rs, Cr, Lakh, etc.)
- **Natural pause insertion** for better flow

### 🎤 Enhanced gTTS Quality
The `/api/tts` endpoint now uses:
- **Official Google TTS API** (same backend as gTTS Python library)
- **60+ language support** with full locale codes
- **Pronunciation optimization** before synthesis
- **Audio caching** (1 hour) for faster responses
- **Enhanced error handling** with detailed logging

## 📝 How It Works

### Pronunciation Optimization
Text is automatically optimized before TTS synthesis:

```typescript
// Original text
"Dr. Smith earns Rs 5 Lakh per month. i.e., Rs. 5,00,000."

// Optimized for TTS
"Doctor Smith earns Rupees 5,00,000 per month. that is, Rupees 5,00,000."
```

### Language-Specific Rules

#### Hindi/Indian Languages
- Adds natural pauses before Devanagari punctuation (।॥)
- Ensures proper spacing after punctuation
- Handles mixed script (English + Indian)

#### English
- Expands abbreviations (Dr. → Doctor, etc. → etcetera)
- Fixes Indian English terms (Rs → Rupees, Cr → Crore)
- Handles currency symbols (₹ → Rupees)

#### General Optimizations
- Normalizes whitespace and punctuation
- Adds natural pauses at sentence boundaries
- Formats large numbers with commas
- Removes excessive punctuation (!!!, ???, ...)

## 🌍 Supported Languages (60+)

### Indian Languages (9)
- Hindi (hi-IN), Kannada (kn-IN), Malayalam (ml-IN)
- Tamil (ta-IN), Telugu (te-IN), Bengali (bn-IN)
- Gujarati (gu-IN), Marathi (mr-IN), Punjabi (pa-IN)

### European Languages (20+)
Spanish, French, German, Italian, Portuguese, Russian, Dutch, Polish, Turkish, Swedish, Norwegian, Danish, Finnish, Greek, Czech, Romanian, Hungarian, Ukrainian, Croatian, Serbian, Slovak, Slovenian, Bulgarian, Lithuanian, Latvian, Estonian

### East Asian (3)
Chinese (zh-CN), Japanese (ja-JP), Korean (ko-KR)

### Southeast Asian (5)
Thai (th-TH), Vietnamese (vi-VN), Indonesian (id-ID), Malay (ms-MY), Filipino (fil-PH)

### Middle Eastern (3)
Arabic (ar-SA), Hebrew (he-IL), Persian (fa-IR)

### African (2)
Afrikaans (af-ZA), Swahili (sw-KE)

## 🔧 API Usage

### Basic TTS Request
```bash
curl -X POST https://your-vercel-app.vercel.app/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "language": "en-US"
  }'
```

### Response
- **Content-Type**: `audio/mpeg`
- **Cache-Control**: `public, max-age=3600` (1 hour cache)
- **Audio Format**: MP3

### Health Check
```bash
curl https://your-vercel-app.vercel.app/api/tts
```

Returns:
```json
{
  "status": "VoxBridge gTTS API - Vercel Serverless",
  "version": "4.0",
  "engine": "Google Text-to-Speech (gTTS)",
  "supported_languages": 60,
  "endpoint": "/api/tts (POST with {text, language})",
  "quality": "High-quality native pronunciation"
}
```

## 💡 Pronunciation Tips

### For Best Results

1. **Use full locale codes**: `hi-IN` instead of `hi`
2. **Keep sentences moderate length**: Auto-chunked at 200 chars
3. **Use proper punctuation**: Helps with natural pauses
4. **Avoid excessive symbols**: Cleaned automatically

### Indian English
- ✅ **Rs 500** → "Rupees 500"
- ✅ **5 Cr** → "5 Crore"
- ✅ **₹1L** → "Rupees 1 Lakh"

### Abbreviations
- ✅ **Dr. Smith** → "Doctor Smith"
- ✅ **etc.** → "etcetera"
- ✅ **i.e.** → "that is"
- ✅ **e.g.** → "for example"

## 🎯 Text Chunking

Long text is automatically split for optimal quality:

```typescript
// Text longer than 200 characters is split at sentence/comma boundaries
"Very long text..." → ["Chunk 1.", "Chunk 2.", "Chunk 3."]
```

Each chunk is:
- Synthesized separately
- Played sequentially
- No interruption between chunks
- Optimal audio quality maintained

## 🔍 Debugging

### Enable Console Logs
Check browser console for detailed TTS logs:

```
🌐 Calling gTTS server: /api/tts
🌐 Language: hi-IN
📝 Original: "नमस्ते, आप कैसे हैं?"
✨ Optimized: "नमस्ते. आप कैसे हैं?"
📦 Split into 1 chunk(s)
🔊 Playing chunk 1/1
📡 Response: 200 OK
📦 Received audio: 15234 bytes, type: audio/mpeg
✅ Chunk 1/1 completed - GOOGLE TTS!
✅ All chunks completed - gTTS with pronunciation optimization!
```

### Common Issues

1. **Empty audio received**
   - Check if text is too long (max ~500 chars per chunk)
   - Verify language code is supported

2. **Timeout errors**
   - Network connectivity issue
   - Vercel cold start (first request may be slower)

3. **Playback errors**
   - Browser audio permissions
   - Check browser console for audio element errors

## 📊 Performance

- **Average response time**: 1-3 seconds
- **Cache duration**: 1 hour (subsequent requests are instant)
- **Audio quality**: Google TTS native quality
- **Supported text length**: Up to 5000 characters (auto-chunked)

## 🔐 Security

- CORS enabled for all origins
- No API key required (uses Google's public TTS endpoint)
- Rate limiting via Vercel (100 requests/10 seconds per IP)

## 🚀 Deployment

Already deployed on Vercel! The API automatically:
- Detects Node.js runtime
- Installs dependencies (node-fetch)
- Deploys to serverless functions
- Enables edge caching

No Python dependencies needed - pure Node.js implementation!

## 📈 Future Enhancements

- [ ] Voice customization (speed, pitch)
- [ ] SSML support for advanced control
- [ ] Custom pronunciation dictionary
- [ ] Emotion/tone control
- [ ] Multiple voice options per language

## 🤝 Contributing

To add new pronunciation rules:

1. Edit `utils/PronunciationOptimizer.ts`
2. Add patterns to `PRONUNCIATION_RULES`
3. Test with various text samples
4. Submit PR

---

**Built with ❤️ for VoxBridge - Real-time Speech Translation**
