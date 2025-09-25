#!/usr/bin/env python3
"""
STT Server for Python 3.9 compatibility with Vosk
This server is designed to work with Python 3.9 to avoid Vosk compatibility issues
"""

import asyncio
import websockets
import json
import base64
import io
import wave
import vosk
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class STTServer:
    def __init__(self, model_path="model", port=8765):
        self.model_path = Path(model_path)
        self.port = port
        self.model = None
        self.clients = set()
        
    def load_model(self):
        """Load Vosk model"""
        try:
            logger.info(f"Loading Vosk model from: {self.model_path}")
            
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model directory not found: {self.model_path}")
            
            # Load model without RNNLM to avoid hanging
            self.model = vosk.Model(str(self.model_path))
            logger.info("✅ Vosk model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load Vosk model: {e}")
            return False
    
    async def handle_client(self, websocket, path):
        """Handle WebSocket client connection"""
        client_id = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"🔌 Client connected: {client_id}")
        
        self.clients.add(websocket)
        
        # Create recognizer for this client
        rec = vosk.KaldiRecognizer(self.model, 16000)
        rec.SetWords(True)
        rec.SetPartialWords(True)
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'audio':
                        # Decode base64 audio data
                        audio_data = base64.b64decode(data['data'])
                        
                        # Process audio with Vosk
                        if rec.AcceptWaveform(audio_data):
                            # Final result
                            result = json.loads(rec.Result())
                            if result.get('text'):
                                await websocket.send(json.dumps({
                                    'type': 'final',
                                    'text': result['text']
                                }))
                        else:
                            # Partial result
                            partial = json.loads(rec.PartialResult())
                            if partial.get('partial'):
                                await websocket.send(json.dumps({
                                    'type': 'partial',
                                    'text': partial['partial']
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
        
        logger.info(f"🚀 Starting STT WebSocket server on ws://localhost:{self.port}")
        
        try:
            async with websockets.serve(self.handle_client, "localhost", self.port):
                logger.info(f"✅ STT Server running on ws://localhost:{self.port}")
                logger.info("🎤 Ready to accept audio connections")
                
                # Keep server running
                await asyncio.Future()  # Run forever
                
        except Exception as e:
            logger.error(f"❌ Server error: {e}")

def main():
    """Main entry point"""
    # Use the model directory relative to this script
    script_dir = Path(__file__).parent
    model_path = script_dir / "model" / "vosk-model-en-us-0.22"
    
    server = STTServer(model_path=model_path, port=8765)
    
    try:
        asyncio.run(server.start_server())
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server failed: {e}")

if __name__ == "__main__":
    main()