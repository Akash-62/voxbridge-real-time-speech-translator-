# 🚀 Deploy gTTS Server - Get Google TTS Quality!

Your app uses **browser TTS by default** (lower quality). To get **Google TTS quality**, deploy the gTTS server separately.

## ⚡ Quick Deploy (5 Minutes)

### **Option 1: Render.com (Recommended - Free Tier Available)**

1. **Go to [render.com](https://render.com)** and sign up

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repo** or choose "Public Git Repository":
   ```
   https://github.com/YOUR-USERNAME/voxbridge-real-time-speech-translator-
   ```

4. **Configure**:
   - **Name**: `voxbridge-gtts-server`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r gtts-server-requirements.txt`
   - **Start Command**: `gunicorn gtts-server-standalone:app`
   - **Instance Type**: Free

5. **Click "Create Web Service"**

6. **Wait 2-3 minutes** for deployment

7. **Copy the URL**: `https://voxbridge-gtts-server.onrender.com`

---

### **Option 2: Railway.app (Fast & Easy)**

1. **Go to [railway.app](https://railway.app)** and sign up

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select your repo**

4. **Railway auto-detects Python** ✅

5. **Add environment variable**:
   - **Key**: `PORT`
   - **Value**: `5000`

6. **Deploy** - Railway handles everything!

7. **Copy the URL**: `https://your-project.up.railway.app`

---

### **Option 3: Fly.io (Free Tier)**

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`

2. Login: `fly auth login`

3. Create `fly.toml`:
   ```toml
   app = "voxbridge-gtts"
   
   [build]
     builder = "paketobuildpacks/builder:base"
   
   [[services]]
     internal_port = 5000
     protocol = "tcp"
   
     [[services.ports]]
       handlers = ["http"]
       port = 80
   ```

4. Deploy: `fly deploy`

5. Get URL: `fly info`

---

## 🔧 Configure Vercel

Once your gTTS server is deployed:

### **Step 1: Add Environment Variable to Vercel**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_GTTS_SERVER_URL`
   - **Value**: `https://your-gtts-server.onrender.com/tts` (your server URL + `/tts`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
4. Click **Save**

### **Step 2: Redeploy Vercel**

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment → **Redeploy**
3. Wait 1-2 minutes

### **Step 3: Test!**

1. Open your Vercel site
2. Open browser console (F12)
3. Click "Start" and speak
4. Look for these logs:
   ```
   🌐 Using gTTS server: https://your-server.onrender.com/tts
   🌐 Calling gTTS server: https://your-server.onrender.com/tts
   📡 Response: 200 OK
   📦 Received audio: 12345 bytes
   ✅ gTTS playing - GOOGLE TTS QUALITY!
   ```

---

## ✅ Success!

If you see **"GOOGLE TTS QUALITY!"** in the logs, it's working! 🎉

Your app now uses **Google Text-to-Speech** for high-quality, natural-sounding speech in 40+ languages!

---

## 🐛 Troubleshooting

### "No VITE_GTTS_SERVER_URL set"
- Add environment variable in Vercel dashboard
- Make sure value ends with `/tts`
- Redeploy after adding

### "gTTS server timeout"
- Check if server is running (visit the URL in browser)
- Should see: `{"status": "VoxBridge gTTS Server Running"}`

### "gTTS server error: 500"
- Check server logs on Render/Railway
- May need to wait for initial cold start (~30 seconds)

---

## 💰 Cost

- **Render.com Free Tier**: 750 hours/month (enough for demos)
- **Railway.app Free Tier**: $5 credit/month
- **Fly.io Free Tier**: 3 shared VMs free

For production, upgrade to paid plans (~$7-10/month).

---

## 🚀 Quick Commands

**Test server locally:**
```bash
pip install -r gtts-server-requirements.txt
python gtts-server-standalone.py
# Visit http://localhost:5000
```

**Test endpoint:**
```bash
curl -X POST http://localhost:5000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello", "language":"en-US"}'
```

---

Need help? Check server logs or create an issue! 🙋‍♂️
