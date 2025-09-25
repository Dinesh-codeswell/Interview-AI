#!/usr/bin/env python3

import os
import json
import asyncio
import websockets
import numpy as np
from vosk import Model, KaldiRecognizer
import base64
import io
import wave
import struct

class STTServer:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "model", "vosk-model-en-us-0.22")
        self.model = None
        self.sample_rate = 16000
        self.clients = {}  # Store recognizer per client
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
        client_id = id(websocket)
        # Create a recognizer for each client
        self.clients[client_id] = {
            'websocket': websocket,
            'recognizer': KaldiRecognizer(self.model, self.sample_rate)
        }
        print(f"Client registered. Total clients: {len(self.clients)}")
        
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
            # Client disconnected, will be cleaned up in register_client
            pass
        except Exception as e:
            print(f"Error sending message to client: {e}")
    
    def convert_webm_to_pcm(self, webm_data):
        """Convert WebM audio data to PCM format for Vosk"""
        try:
            # For now, we'll assume the browser is sending raw audio data
            # In a production environment, you'd need proper WebM/Opus decoding
            # This is a simplified approach that works with MediaRecorder
            
            # Try to interpret as raw audio data
            audio_bytes = base64.b64decode(webm_data)
            
            # Convert to numpy array and normalize
            # Assuming 16-bit PCM data from MediaRecorder
            try:
                # Try as 16-bit signed integers
                audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
                # Convert to bytes for Vosk
                return audio_np.tobytes()
            except:
                # If that fails, try as float32 and convert
                audio_np = np.frombuffer(audio_bytes, dtype=np.float32)
                # Convert float32 to int16
                audio_int16 = (audio_np * 32767).astype(np.int16)
                return audio_int16.tobytes()
                
        except Exception as e:
            print(f"Error converting audio: {e}")
            return None
    
    async def process_audio_data(self, websocket, audio_data):
        """Process audio data received from WebSocket"""
        client_id = id(websocket)
        
        if client_id not in self.clients:
            print("Client not found")
            return
        
        try:
            # Convert audio data to PCM format
            pcm_data = self.convert_webm_to_pcm(audio_data)
            if pcm_data is None:
                return
            
            recognizer = self.clients[client_id]['recognizer']
            
            # Process the audio with Vosk
            if recognizer.AcceptWaveform(pcm_data):
                # Final result
                result = json.loads(recognizer.Result())
                if result.get('text'):
                    await self.send_to_client(websocket, {
                        'type': 'final',
                        'text': result['text']
                    })
                    print(f"Final: {result['text']}")
            else:
                # Partial result
                partial_result = json.loads(recognizer.PartialResult())
                if partial_result.get('partial'):
                    await self.send_to_client(websocket, {
                        'type': 'partial',
                        'text': partial_result['partial']
                    })
                    print(f"Partial: {partial_result['partial']}")
                    
        except Exception as e:
            print(f"Error processing audio: {e}")
    
    async def handle_message(self, websocket, message):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(message)
            
            if data.get('type') == 'audio':
                await self.process_audio_data(websocket, data.get('data'))
            elif data.get('type') == 'start':
                print("Client started recording")
                # Reset recognizer for new session
                client_id = id(websocket)
                if client_id in self.clients:
                    self.clients[client_id]['recognizer'] = KaldiRecognizer(self.model, self.sample_rate)
            elif data.get('type') == 'stop':
                print("Client stopped recording")
                
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error handling message: {e}")

# Global server instance
server = None

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
    
    if server.model is None:
        print("Failed to load model. Exiting.")
        return None
    
    print("STT Server is starting...")
    
    # Start the WebSocket server
    start_server = websockets.serve(handle_websocket, "localhost", 8765)
    
    print("STT Server is running on ws://localhost:8765")
    
    return start_server

if __name__ == "__main__":
    import signal
    
    async def main():
        global server
        start_server = start_stt_server()
        
        if start_server is None:
            print("Failed to start server")
            return
            
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