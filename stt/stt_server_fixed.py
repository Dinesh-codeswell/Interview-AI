#!/usr/bin/env python3
"""
Fixed STT Server based on the working test_microphone.py approach
This server uses the same model loading and audio processing logic that works in VS Code
"""

import asyncio
import websockets
import json
import base64
import io
import wave
import os
import numpy as np
from vosk import Model, KaldiRecognizer
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FixedSTTServer:
    def __init__(self, model_path="model", port=8765):
        self.model_path = Path(__file__).parent / model_path / "vosk-model-en-us-0.22"
        self.port = port
        self.model = None
        self.clients = set()
        
    def load_model(self):
        """Load Vosk model using the same approach as test_microphone.py"""
        try:
            logger.info(f"Loading Vosk model from: {self.model_path}")
            
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model directory not found: {self.model_path}")
            
            # Use the exact same model loading approach as test_microphone.py
            print(f"Using local model: {self.model_path}")
            self.model = Model(str(self.model_path))
            logger.info("✅ Vosk model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load Vosk model: {e}")
            return False
    
    def convert_webm_to_pcm(self, webm_data):
        """Convert WebM audio data to PCM format that Vosk expects"""
        try:
            # For now, we'll assume the browser sends us compatible audio
            # In a production environment, you'd use ffmpeg or similar to convert
            # For this fix, we'll work with the raw audio data
            return webm_data
        except Exception as e:
            logger.error(f"❌ Audio conversion error: {e}")
            return None
    
    async def process_audio_chunk(self, audio_data, recognizer):
        """Process audio chunk and return recognition result"""
        try:
            # Convert audio data to the format Vosk expects
            if isinstance(audio_data, str):
                # Decode base64 audio data
                try:
                    audio_bytes = base64.b64decode(audio_data)
                except Exception as e:
                    logger.error(f"❌ Base64 decode error: {e}")
                    return None, None
                
                # Convert WebM/Opus to raw PCM using ffmpeg (same approach as test_microphone.py)
                import subprocess
                import tempfile
                import time
                import os
                
                # Create temporary files for conversion
                temp_dir = tempfile.gettempdir()
                webm_path = os.path.join(temp_dir, f"audio_{int(time.time() * 1000000)}.webm")
                pcm_path = os.path.join(temp_dir, f"audio_{int(time.time() * 1000000)}.pcm")
                
                try:
                    # Write WebM data to temporary file
                    with open(webm_path, 'wb') as f:
                        f.write(audio_bytes)
                    
                    # Use pydub to convert WebM to PCM (fallback if ffmpeg not available)
                    try:
                        from pydub import AudioSegment
                        from pydub.utils import which
                        
                        # Load WebM audio using pydub
                        audio = AudioSegment.from_file(webm_path, format="webm")
                        
                        # Convert to 16kHz, mono, 16-bit PCM (same as test_microphone.py)
                        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
                        
                        # Export as raw PCM
                        audio.export(pcm_path, format="raw", parameters=["-f", "s16le"])
                        
                        # Read the converted PCM data
                        with open(pcm_path, 'rb') as f:
                            pcm_data = f.read()
                        
                        # Clean up temporary files
                        os.unlink(webm_path)
                        os.unlink(pcm_path)
                        
                        # Process with Vosk using the same approach as test_microphone.py
                        if recognizer.AcceptWaveform(pcm_data):
                            # Final result - same as test_microphone.py line 85-86
                            result = recognizer.Result()
                            return json.loads(result), 'final'
                        else:
                            # Partial result - same as test_microphone.py line 87-88
                            partial = recognizer.PartialResult()
                            return json.loads(partial), 'partial'
                            
                    except ImportError:
                        logger.error("❌ pydub not available and ffmpeg not found. Please install ffmpeg or pydub.")
                        return None, None
                    except Exception as e:
                        logger.error(f"❌ Audio conversion failed: {e}")
                        return None, None
                        
                except Exception as e:
                    # Clean up on error
                    try:
                        if os.path.exists(webm_path):
                            os.unlink(webm_path)
                        if os.path.exists(pcm_path):
                            os.unlink(pcm_path)
                    except:
                        pass
                    raise e
            else:
                # Direct audio bytes (fallback)
                audio_bytes = audio_data
                
                # Try to process with Vosk using the same approach as test_microphone.py
                if recognizer.AcceptWaveform(audio_bytes):
                    result = recognizer.Result()
                    return json.loads(result), 'final'
                else:
                    partial = recognizer.PartialResult()
                    return json.loads(partial), 'partial'
                
        except Exception as e:
            logger.error(f"❌ Error processing audio chunk: {e}")
            return None, None
    
    async def handle_client(self, websocket):
        """Handle WebSocket client connection with improved audio processing"""
        client_id = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"🔌 Client connected: {client_id}")
        
        self.clients.add(websocket)
        
        # Create recognizer for this client using the same approach as test_microphone.py
        # Line 82: rec = KaldiRecognizer(model, args.samplerate)
        recognizer = KaldiRecognizer(self.model, 16000)
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'audio':
                        # Process audio using the same logic as test_microphone.py
                        result, result_type = self.process_audio_chunk(data['data'], recognizer)
                        
                        if result and result_type:
                            if result_type == 'final' and result.get('text'):
                                await websocket.send(json.dumps({
                                    'type': 'final',
                                    'text': result['text']
                                }))
                                logger.info(f"📝 Final: {result['text']}")
                            elif result_type == 'partial' and result.get('partial'):
                                await websocket.send(json.dumps({
                                    'type': 'partial', 
                                    'text': result['partial']
                                }))
                                
                except json.JSONDecodeError:
                    logger.error("❌ Invalid JSON received")
                except Exception as e:
                    logger.error(f"❌ Error processing message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"🔌 Client disconnected: {client_id}")
        except Exception as e:
            logger.error(f"❌ Client error: {e}")
        finally:
            self.clients.discard(websocket)
    
    async def start_server(self):
        """Start the WebSocket server"""
        if not self.load_model():
            logger.error("❌ Failed to start server: Model loading failed")
            return
        
        logger.info(f"🚀 Starting STT WebSocket server on port {self.port}")
        
        try:
            async with websockets.serve(self.handle_client, "localhost", self.port):
                logger.info(f"✅ STT Server running on ws://localhost:{self.port}")
                await asyncio.Future()  # Run forever
        except Exception as e:
            logger.error(f"❌ Server error: {e}")

def main():
    """Main function to start the server"""
    try:
        # Use the same model path structure as test_microphone.py
        model_path = "model"  # This will resolve to stt/model/vosk-model-en-us-0.22
        server = FixedSTTServer(model_path=model_path, port=8765)
        
        logger.info("🎤 Starting Fixed STT Server...")
        asyncio.run(server.start_server())
        
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server startup error: {e}")

if __name__ == "__main__":
    main()