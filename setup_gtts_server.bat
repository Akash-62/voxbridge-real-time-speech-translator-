@echo off
echo ========================================
echo Google TTS Server Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Python found
python --version
echo.

echo [2/3] Installing required packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)
echo.

echo [3/3] Installation complete!
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the gTTS server, run:
echo     python gtts_server.py
echo.
echo The server will be available at:
echo     http://localhost:5000
echo.
pause
