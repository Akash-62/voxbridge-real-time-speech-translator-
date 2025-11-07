@echo off
echo ============================================================
echo 🚀 VoxBridge Complete Startup
echo ============================================================
echo.
echo Starting both gTTS Server and VoxBridge App...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python not found!
    echo Please run setup_gtts_server.bat first
    pause
    exit /b 1
)

REM Start gTTS server in background
echo [1/2] Starting gTTS Server (Port 5000)...
start "gTTS Server" /MIN python gtts_server.py

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Start VoxBridge dev server
echo [2/2] Starting VoxBridge App (Port 5173)...
echo.
echo ============================================================
echo ✅ Ready!
echo ============================================================
echo.
echo gTTS Server: http://localhost:5000
echo VoxBridge App: http://localhost:5173
echo.
echo Browser will open automatically...
echo.
echo To stop: Close this window or press Ctrl+C
echo ============================================================
echo.

npm run dev
