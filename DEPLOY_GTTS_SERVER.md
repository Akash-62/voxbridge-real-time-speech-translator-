# 🚀 Deploy gTTS Server to Render.com

## Quick Deploy (5 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)

### Step 2: Deploy gTTS Server
1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository: `voxbridge-real-time-speech-translator-`
4. Render will auto-detect `render.yaml`
5. Click "Create Web Service"
6. Wait 5-10 minutes for build & deployment

### Step 3: Copy Your Server URL
After deployment completes:
1. Copy the URL (e.g., `https://voxbridge-gtts-server.onrender.com`)
2. Test it: `https://your-url.onrender.com/` (should show "VoxBridge gTTS Server is running!")

### Step 4: Update Vercel Environment Variable
1. Go to https://vercel.com → Your Project
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - **Name:** `VITE_GTTS_SERVER_URL`
   - **Value:** `https://your-render-url.onrender.com/tts`
   - Check all environments (Production, Preview, Development)
4. Click "Save"
5. Redeploy your Vercel app

### Step 5: Test Production
1. Open your Vercel URL
2. Click Start → Speak
3. Check console - should see:
   ```
   ✅ gTTS server connected via https://your-render-url.onrender.com/tts
   ```
4. Audio should play with high-quality gTTS voice!

---

## ⚠️ Important Notes

### Free Tier Limits
- Render.com free tier: Server sleeps after 15 minutes of inactivity
- First request after sleep: ~30 seconds to wake up
- Subsequent requests: Fast (1-2 seconds)

### Keep Server Awake (Optional)
Use a service like UptimeRobot to ping your server every 5 minutes:
1. Go to https://uptimerobot.com
2. Add New Monitor
3. Monitor Type: HTTP(s)
4. URL: `https://your-render-url.onrender.com/`
5. Monitoring Interval: 5 minutes

---

## 🔧 Troubleshooting

### Issue: "Failed to connect to gTTS"
**Solution:** Check Render logs
1. Go to Render.com dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors

### Issue: Server is slow
**Solution:** Free tier waking up (wait 30 seconds)

### Issue: CORS errors
**Solution:** Already configured in gtts_server.py with flask-cors

---

## 💰 Cost

- **Render.com Free Tier:**
  - ✅ FREE forever
  - 750 hours/month free
  - Enough for testing and demo

- **Paid Tier (Optional):**
  - $7/month
  - Always-on (no sleep)
  - Better performance

---

## 📊 Expected Performance

| Metric | Free Tier | Paid Tier |
|--------|-----------|-----------|
| First Request (after sleep) | 30s | <2s |
| Subsequent Requests | 1-2s | <1s |
| Audio Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Uptime | 100% | 100% |
| Concurrent Users | 10-20 | 100+ |

---

## ✅ Verification Checklist

- [ ] Render.com account created
- [ ] gTTS server deployed on Render
- [ ] Render URL copied
- [ ] Environment variable added in Vercel
- [ ] Vercel app redeployed
- [ ] Tested on production
- [ ] gTTS audio working correctly

---

## 🎯 Final Setup

After deployment, your setup will be:

```
User Browser (Vercel)
      ↓
Vercel Frontend (React App)
      ↓
Render.com Backend (Python gTTS Server)
      ↓
Google TTS API
      ↓
MP3 Audio → User
```

Everything connected and working! 🎉
