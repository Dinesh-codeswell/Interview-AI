#!/usr/bin/env python3
import os
import sys
import subprocess
from vosk import Model, KaldiRecognizer, SetLogLevel

SAMPLE_RATE = 16000
SetLogLevel(0)

# 1) Default model directory name (unzip the model folder here or provide absolute path)
DEFAULT_MODEL_DIR = "vosk-model-en-us-0.22"

# 2) Resolve model path priority: CLI arg 2 > ENV > default
# Usage: python transcribe.py <audio_file> [<model_dir>]
if len(sys.argv) < 2:
    print("Usage: python transcribe.py <audio_file> [<model_dir>]")
    sys.exit(1)

audio_path = sys.argv[1]
model_dir = (
    sys.argv[2] if len(sys.argv) >= 3 else
    os.environ.get("VOSK_MODEL_PATH", DEFAULT_MODEL_DIR)
)

if not os.path.isdir(model_dir):
    print(f"Error: model directory not found: {model_dir}")
    print("Tip: unzip 'vosk-model-en-us-0.22' and pass its folder path as second argument,")
    print("     or set VOSK_MODEL_PATH, or place the folder next to this script.")
    sys.exit(1)

# 3) Load the specific model (0.22)
#    You can also pass a 'grammar' or 'spk_model' if needed.
model = Model(model_dir)
rec = KaldiRecognizer(model, SAMPLE_RATE)

# 4) Use ffmpeg to decode arbitrary input to 16 kHz mono s16le
ffmpeg_cmd = [
    "ffmpeg", "-loglevel", "quiet",
    "-i", audio_path,
    "-ar", str(SAMPLE_RATE),
    "-ac", "1",
    "-f", "s16le", "-"
]

with subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE) as process:
    while True:
        data = process.stdout.read(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            print(rec.Result())
        else:
            print(rec.PartialResult())

    print(rec.FinalResult())
