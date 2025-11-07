@echo off
COLOR 0A
echo.
echo ============================================================
echo     🎤 VoxBridge gTTS Complete Setup
echo ============================================================
echo.
echo This will set up everything you need for native-quality
echo pronunciation in Indian languages!
echo.
echo ============================================================
echo.
pause

REM Check Python
echo [Step 1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    COLOR 0C
    echo.
    echo ❌ ERROR: Python is not installed!
    echo.
    echo Please install Python 3.8+ from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation!
    echo.
    pause
    exit /b 1
)
python --version
echo ✅ Python found!
echo.

REM Install Python packages
echo [Step 2/4] Installing Python packages...
echo Installing: Flask, Flask-CORS, gTTS, Requests
pip install -r requirements.txt
if errorlevel 1 (
    COLOR 0C
    echo.
    echo ❌ ERROR: Failed to install Python packages!
    echo.
    echo Try running: python -m pip install --upgrade pip
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)
echo ✅ Python packages installed!
echo.

REM Check Node.js
echo [Step 3/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    COLOR 0E
    echo.
    echo ⚠️  WARNING: Node.js not found!
    echo.
    echo VoxBridge app won't run without Node.js.
    echo Please install from: https://nodejs.org/
    echo.
    echo Python server is ready, but you need Node.js for the app.
    echo.
    pause
    goto test_server
)
node --version
npm --version
echo ✅ Node.js found!
echo.

REM Install Node packages
echo Installing Node.js packages...
call npm install
if errorlevel 1 (
    COLOR 0E
    echo.
    echo ⚠️  WARNING: npm install had issues
    echo The app might not work properly.
    echo.
    pause
)
echo ✅ Node packages installed!
echo.

:test_server
REM Test Python server
echo [Step 4/4] Testing gTTS server...
echo Starting server temporarily...
start /B python gtts_server.py
timeout /t 5 /nobreak >nul

echo Testing server health...
python test_gtts_server.py
if errorlevel 1 (
    COLOR 0E
    echo.
    echo ⚠️  Server test had issues, but setup is complete.
    echo You can still try running the server manually.
    echo.
) else (
    COLOR 0A
    echo.
    echo ✅ Server test passed!
    echo.
)

REM Stop test server
taskkill /F /IM python.exe >nul 2>&1

COLOR 0A
echo.
echo ============================================================
echo     🎉 Setup Complete!
echo ============================================================
echo.
echo Everything is ready to use!
echo.
echo 📋 What's next:
echo.
echo   1. Run: start_all.bat
echo      This starts both gTTS server and VoxBridge app
echo.
echo   2. Open: http://localhost:5173
echo      Your browser will open automatically
echo.
echo   3. Select languages and click "Start Session"
echo.
echo   4. Speak and enjoy NATIVE-QUALITY pronunciation! 🎉
echo.
echo ============================================================
echo.
echo 📚 Documentation:
echo   - Quick Start: QUICKSTART_GTTS.md
echo   - Full Guide: GTTS_SERVER_SETUP.md
echo   - Summary: GTTS_INTEGRATION_SUMMARY.md
echo.
echo ============================================================
echo.
echo Would you like to start the app now? (Y/N)
set /p start_now="Start now? (Y/N): "

if /i "%start_now%"=="Y" (
    echo.
    echo Starting VoxBridge with gTTS...
    echo.
    start_all.bat
) else (
    echo.
    echo No problem! Run start_all.bat whenever you're ready.
    echo.
    pause
)
