from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
from app.core.tts_engine import TTSEngine

router = APIRouter()

# EDIT these to match your system:
PIPER_EXE = r"C:\Users\Acer\Desktop\Interview ai\interview-ace-pro\tts-local\piper\piper.exe"
MODEL_PATH = r"C:\Users\Acer\Desktop\Interview ai\interview-ace-pro\tts-local\piper\en_US-amy-low.onnx"
CONFIG_PATH = r"C:\Users\Acer\Desktop\Interview ai\interview-ace-pro\tts-local\piper\en_US-amy-low.onnx.json"

engine = TTSEngine(
    model_path=MODEL_PATH,
    config_path=CONFIG_PATH,
    piper_exe=PIPER_EXE
)

class TTSIn(BaseModel):
    text: str
    length_scale: float = 1.0
    noise_scale: float = 0.667
    noise_w: float = 0.8

@router.post("/tts")
def tts(inp: TTSIn):
    try:
        audio_bytes = engine.synthesize(
            inp.text,
            length_scale=inp.length_scale,
            noise_scale=inp.noise_scale,
            noise_w=inp.noise_w
        )
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
