@echo off
echo ========================================
echo   Starting Piper TTS Server
echo ========================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call piper_env\Scripts\activate.bat

echo.
echo Starting Piper server on http://localhost:5001
echo Press Ctrl+C to stop the server
echo.

python piper_server.py

pause
