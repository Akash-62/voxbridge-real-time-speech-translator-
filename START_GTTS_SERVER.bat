@echo off
echo ====================================
echo 🎤 VoxBridge TTS Server (gTTS)
echo ====================================
echo.
echo Stopping any old servers...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *tts-server*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting NEW server with Google TTS...
echo.
cd server
python tts-server.py
pause

