# 🚨 RENDER DEPLOYMENT FIX

## Problem
Error: `ModuleNotFoundError: No module named 'app'`

## Solution
Render is running wrong command. You need to **manually override** the settings.

---

## 🔧 Fix Steps on Render.com:

### 1. Delete Current Service (if exists)
- Dashboard → Select service → Settings → Delete Web Service

### 2. Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect: `Akash-62/voxbridge-real-time-speech-translator-`

### 3. **IMPORTANT: Manual Configuration**

**DO NOT use auto-detect! Set these manually:**

```
Name: voxbridge-gtts-server
Region: Choose yours (e.g., Singapore)
Branch: main
Root Directory: (leave blank)
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT gtts_server:app
```

**⚠️ The Start Command MUST be exactly:**
```
gunicorn --bind 0.0.0.0:$PORT gtts_server:app
```

NOT `gunicorn app:app` ❌

### 4. Environment Variables
Click "Advanced" → Add:
- Key: `PYTHON_VERSION`
- Value: `3.11.0`

### 5. Deploy
Click **"Create Web Service"**

---

## ✅ Expected Output

After 3-5 minutes, you should see:

```
==> Build successful 🎉
==> Deploying...
==> Starting gtts_server:app with gunicorn
[INFO] Listening at: http://0.0.0.0:10000
[INFO] Using worker sync
Your service is live at https://voxbridge-gtts-server.onrender.com
```

---

## 🧪 Test Deployment

Visit: `https://voxbridge-gtts-server.onrender.com/`

Should show:
```json
{
  "status": "gTTS Server is running!",
  "version": "1.0",
  "supported_languages": 50
}
```

---

## 📝 Quick Reference

| Setting | Value |
|---------|-------|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn --bind 0.0.0.0:$PORT gtts_server:app` |
| Python Version | `3.11.0` |
| Port | Auto (from $PORT) |

---

**The key fix:** Change `app:app` to `gtts_server:app` in Start Command!
