#!/usr/bin/env python3

import os
import json
import asyncio
import websockets
import numpy as np
from vosk import Model, KaldiRecognizer, SetLogLevel
import base64

# Reduce Vosk logging to minimize output
SetLogLevel(-1)

class BasicSTTServer:
    def __init__(self):
        # Try to find a smaller model first, fallback to the main model
        model_dir = os.path.join(os.path.dirname(__file__), "model")
        
        # Look for available models
        possible_models = [
            "vosk-model-small-en-us-0.15",
            "vosk-model-en-us-0.22-lgraph",  # Lightweight version
            "vosk-model-en-us-0.22"
        ]
        
        self.model_path = None
        for model_name in possible_models:
            test_path = os.path.join(model_dir, model_name)
            if os.path.exists(test_path):
                self.model_path = test_path
                break
        
        if not self.model_path:
            # Use the default model
            self.model_path = os.path.join(model_dir, "vosk-model-en-us-0.22")
        
        self.model = None
        self.sample_rate = 16000
        self.clients = {}
        self.load_model()
    
    def load_model(self):
        """Load the Vosk model with minimal features"""
        if not os.path.exists(self.model_path):
            print(f"Model not found at {self.model_path}")
            return
        
        print(f"Loading Vosk model from: {self.model_path}")
        try:
            # Load model
            self.model = Model(self.model_path)
            print("✅ Model loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
    
    async def register_client(self, websocket):
        """Register a new WebSocket client"""
        if not self.model:
            print("❌ Model not loaded, cannot register client")
            await websocket.close()
            return
            
        client_id = id(websocket)
        try:
            # Create a recognizer for each client
            recognizer = KaldiRecognizer(self.model, self.sample_rate)
            self.clients[client_id] = {
                'websocket': websocket,
                'recognizer': recognizer
            }
            print(f"✅ Client registered. Total clients: {len(self.clients)}")
            
            # Send ready message
            await self.send_to_client(websocket, {
                'type': 'ready',
                'message': 'STT server ready'
            })
            
        except Exception as e:
            print(f"❌ Error registering client: {e}")
            await websocket.close()
            return
        
        try:
            await websocket.wait_closed()
        finally:
            if client_id in self.clients:
                del self.clients[client_id]
            print(f"Client disconnected. Total clients: {len(self.clients)}")
    
    async def send_to_client(self, websocket, message):
        """Send message to specific client"""
        try:
            await websocket.send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error sending message: {e}")
    
    def convert_audio_data(self, audio_data):
        """Convert base64 audio data to PCM format"""
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # For MediaRecorder, the data might be in different formats
            # Let's try to handle it as raw PCM data
            return audio_bytes
            
        except Exception as e:
            print(f"Error converting audio: {e}")
            return None
    
    async def process_audio_data(self, websocket, audio_data):
        """Process audio data from WebSocket"""
        client_id = id(websocket)
        
        if client_id not in self.clients:
            return
        
        try:
            # Convert audio data
            pcm_data = self.convert_audio_data(audio_data)
            if not pcm_data:
                return
            
            recognizer = self.clients[client_id]['recognizer']
            
            # Process with Vosk
            if recognizer.AcceptWaveform(pcm_data):
                # Final result
                result = json.loads(recognizer.Result())
                text = result.get('text', '').strip()
                if text:
                    await self.send_to_client(websocket, {
                        'type': 'final',
                        'text': text
                    })
                    print(f"🎯 Final: {text}")
            else:
                # Partial result
                partial_result = json.loads(recognizer.PartialResult())
                partial_text = partial_result.get('partial', '').strip()
                if partial_text:
                    await self.send_to_client(websocket, {
                        'type': 'partial',
                        'text': partial_text
                    })
                    if len(partial_text) > 2:  # Only log meaningful partial results
                        print(f"🔄 Partial: {partial_text}")
                    
        except Exception as e:
            print(f"❌ Error processing audio: {e}")
    
    async def handle_message(self, websocket, message):
        """Handle WebSocket messages"""
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            
            if msg_type == 'audio':
                await self.process_audio_data(websocket, data.get('data'))
                
            elif msg_type == 'start':
                print("🎤 Client started recording")
                client_id = id(websocket)
                if client_id in self.clients:
                    # Reset recognizer for new session
                    self.clients[client_id]['recognizer'] = KaldiRecognizer(self.model, self.sample_rate)
                    await self.send_to_client(websocket, {
                        'type': 'started',
                        'message': 'Recording started'
                    })
                    
            elif msg_type == 'stop':
                print("⏹️ Client stopped recording")
                client_id = id(websocket)
                if client_id in self.clients:
                    # Get final result
                    recognizer = self.clients[client_id]['recognizer']
                    try:
                        final_result = json.loads(recognizer.FinalResult())
                        text = final_result.get('text', '').strip()
                        if text:
                            await self.send_to_client(websocket, {
                                'type': 'final',
                                'text': text
                            })
                            print(f"🏁 Final result: {text}")
                    except:
                        pass
                
        except json.JSONDecodeError:
            print("❌ Invalid JSON received")
        except Exception as e:
            print(f"❌ Error handling message: {e}")

# Global server instance
server = None

async def handle_websocket(websocket):
    """Handle WebSocket connections"""
    print("🔗 New WebSocket connection")
    await server.register_client(websocket)
    
    try:
        async for message in websocket:
            await server.handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        print("🔌 WebSocket connection closed")
    except Exception as e:
        print(f"❌ Error in WebSocket handler: {e}")

def start_stt_server():
    """Start the STT server"""
    global server
    server = BasicSTTServer()
    
    if server.model is None:
        print("❌ Failed to load model. Exiting.")
        return None
    
    print("🚀 Starting Basic STT Server...")
    
    # Start WebSocket server
    start_server = websockets.serve(handle_websocket, "localhost", 8765)
    
    print("✅ STT Server is running on ws://localhost:8765")
    print("🎯 Ready to accept connections!")
    
    return start_server

if __name__ == "__main__":
    import signal
    
    async def main():
        start_server = start_stt_server()
        
        if start_server is None:
            return
            
        await start_server
        await asyncio.Future()  # Run forever
    
    def signal_handler(sig, frame):
        print("\n🛑 Shutting down STT server...")
        exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 STT server stopped")