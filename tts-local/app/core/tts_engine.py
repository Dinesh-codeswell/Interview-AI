import os
import shutil
import subprocess
import tempfile
from typing import Optional

def _abs(p: str) -> str:
    return os.path.abspath(os.path.expanduser(p))

class TTSEngine:
    def __init__(
        self,
        model_path: str,
        config_path: str,
        piper_exe: Optional[str] = None
    ):
        # Resolve absolute paths
        self.model_path = _abs(model_path)
        self.config_path = _abs(config_path)

        # Prefer explicit piper path, else try PATH, else common Windows locations
        if piper_exe:
            self.piper_exe = _abs(piper_exe)
        else:
            found = shutil.which("piper")
            if found:
                self.piper_exe = found
            else:
                common = [
                    r"D:\tts-local\piper\piper.exe",
                    r"D:\Program Files\piper\piper.exe",
                    r"D:\Program Files (x86)\piper\piper.exe"
                ]
                self.piper_exe = next((p for p in common if os.path.isfile(p)), None)

        # Validate
        if not self.piper_exe or not os.path.isfile(self.piper_exe):
            raise FileNotFoundError(
                "piper.exe not found. Set TTSEngine(..., piper_exe='C:\\\\piper\\\\piper.exe') "
                "or add Piper to PATH."
            )
        if not os.path.isfile(self.model_path):
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        if not os.path.isfile(self.config_path):
            raise FileNotFoundError(f"Config file not found: {self.config_path}")

    def synthesize(
        self,
        text: str,
        length_scale: float = 1.0,
        noise_scale: float = 0.667,
        noise_w: float = 0.8
    ) -> bytes:
        if not text or not text.strip():
            text = "Hello, this is a local Piper TTS test."
        
        # Create a temporary file for output
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            cmd = [
                self.piper_exe,
                "--model", self.model_path,
                "--config", self.config_path,
                "--length_scale", str(length_scale),
                "--noise_scale", str(noise_scale),
                "--noise_w", str(noise_w),
                "--output_file", temp_path
            ]
            proc = subprocess.Popen(
                cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False
            )
            stdout, stderr = proc.communicate(input=text.encode("utf-8"))
            
            if proc.returncode != 0:
                raise RuntimeError(
                    f"Piper failed (exit {proc.returncode}). Cmd: {cmd}\nError: {stderr.decode('utf-8', errors='ignore')}"
                )
            
            # Read the generated audio file
            with open(temp_path, 'rb') as f:
                wav_bytes = f.read()
            
            return wav_bytes
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
