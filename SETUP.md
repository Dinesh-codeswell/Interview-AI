# Interview Ace Pro - Setup Instructions

## Prerequisites

Before running the application, you need to set up the Speech-to-Text (STT) and Text-to-Speech (TTS) components.

## STT (Speech-to-Text) Setup

### 1. Download Vosk Model
```bash
cd stt
# Download the Vosk English model (approximately 1.8GB)
wget https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip
unzip vosk-model-en-us-0.22.zip
mv vosk-model-en-us-0.22 model/
```

### 2. Install Python Dependencies
```bash
cd stt
pip install -r requirements.txt
```

### 3. Start STT Server
```bash
cd stt
python stt_server_fixed.py
```

## TTS (Text-to-Speech) Setup

### 1. Download Piper Model and Binaries
```bash
cd tts-local/piper
# Download Piper executable and model files
# Visit: https://github.com/rhasspy/piper/releases
# Download the appropriate version for your OS
```

### 2. Install Python Dependencies
```bash
cd tts-local
pip install -r requirements.txt
```

### 3. Start TTS Server
```bash
cd tts-local
python app/main.py
```

## Main Application Setup

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

## Important Notes

- The STT model files are large (~1.8GB) and are excluded from git
- The TTS Piper binaries and models are also excluded from git
- All generated audio files (*.wav, *.mp3) are excluded from git
- Virtual environments (.venv/) are excluded from git

## File Structure

```
interview-ace-pro/
├── src/                    # Next.js application
├── stt/                    # Speech-to-Text server
│   ├── model/             # Vosk model (excluded from git)
│   ├── requirements.txt   # Python dependencies
│   └── stt_server_fixed.py # STT server
├── tts-local/             # Text-to-Speech server
│   ├── app/               # FastAPI application
│   ├── piper/             # Piper binaries (excluded from git)
│   └── requirements.txt   # Python dependencies
└── .gitignore             # Excludes large files and dependencies
```