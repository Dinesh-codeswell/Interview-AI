@echo off
echo Setting up Python 3.9 environment for STT server...
echo.

REM Check if Python 3.9 is available
python3.9 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 3.9 not found. Please install Python 3.9 first.
    echo Download from: https://www.python.org/downloads/release/python-3913/
    pause
    exit /b 1
)

echo Python 3.9 found!
echo.

REM Create virtual environment
echo Creating virtual environment...
python3.9 -m venv venv_stt_py39

REM Activate virtual environment
echo Activating virtual environment...
call venv_stt_py39\Scripts\activate.bat

REM Install requirements
echo Installing requirements...
pip install -r requirements_python39.txt

echo.
echo Setup complete!
echo.
echo To run the STT server:
echo 1. Activate the environment: call venv_stt_py39\Scripts\activate.bat
echo 2. Run the server: python stt_server_python39.py
echo.
pause