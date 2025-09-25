#!/usr/bin/env python3

import os
import json
import asyncio
import websockets
import numpy as np
from vosk import Model, KaldiRecognizer
import threading
import queue
import time
import base64

class STTServer:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "model", "vosk-model-en-us-0.22")
        self.model = None
        self.sample_rate = 16000
        self.clients = set()
        self.audio_queue = queue.Queue()
        self.is_recording = False
        self.load_model()
    
    def load_model(self):
        """Load the Vosk model"""
        if not os.path.exists(self.model_path):
            print(f"Model not found at {self.model_path}")
            return
        
        print("Loading Vosk model...")
        self.model = Model(self.model_path)
        print("Model loaded successfully")
    
    async def register_client(self, websocket):
        """Register a new WebSocket client"""
        self.clients.add(websocket)
        print(f"Client registered. Total clients: {len(self.clients)}")
        
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)
            print(f"Client disconnected. Total clients: {len(self.clients)}")
    
    async def broadcast_transcription(self, message):
        """Broadcast transcription to all connected clients"""
        if self.clients:
            disconnected_clients = set()
            for client in self.clients:
                try:
                    await client.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
            
            # Remove disconnected clients
            self.clients -= disconnected_clients
    
    async def process_audio_data(self, audio_data):
        """Process audio data received from WebSocket"""
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Convert to numpy array (assuming 16-bit PCM)
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Create recognizer for this audio chunk
            rec = KaldiRecognizer(self.model, self.sample_rate)
            
            # Process the audio
            if rec.AcceptWaveform(audio_np.tobytes()):
                result = json.loads(rec.Result())
                if result.get('text'):
                    await self.broadcast_transcription({
                        'type': 'final',
                        'text': result['text']
                    })
            else:
                partial_result = json.loads(rec.PartialResult())
                if partial_result.get('partial'):
                    await self.broadcast_transcription({
                        'type': 'partial',
                        'text': partial_result['partial']
                    })
        except Exception as e:
            print(f"Error processing audio: {e}")
    
    async def handle_message(self, websocket, message):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(message)
            
            if data.get('type') == 'audio':
                await self.process_audio_data(data.get('data'))
            elif data.get('type') == 'start':
                print("Client started recording")
            elif data.get('type') == 'stop':
                print("Client stopped recording")
                
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error handling message: {e}")

async def handle_websocket(websocket):
    """Handle WebSocket connections"""
    print("New WebSocket connection")
    await server.register_client(websocket)
    
    try:
        async for message in websocket:
            await server.handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"Error in WebSocket handler: {e}")

def start_stt_server():
    """Start the STT server"""
    global server
    server = STTServer()
    
    print("STT Server is starting...")
    
    # Start the WebSocket server
    start_server = websockets.serve(handle_websocket, "localhost", 8765)
    
    print("STT Server is running on ws://localhost:8765")
    
    return start_server

# Global server instance
server = None

if __name__ == "__main__":
    import signal
    
    stt_server_instance = None

    async def main():
        global server
        start_server = start_stt_server()
        await start_server
        
        # Keep the server running
        await asyncio.Future()  # Run forever
    
    def signal_handler(sig, frame):
        print("\nShutting down STT server...")
        if server:
            print("Server stopped")
        exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down STT server...")
        if server:
            print("Server stopped")