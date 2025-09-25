#!/usr/bin/env python3

import os
import json
import asyncio
import websockets
import numpy as np
from vosk import Model, KaldiRecognizer
import base64
import wave
import struct

class SimpleSTTServer:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "model", "vosk-model-en-us-0.22")
        self.model = None
        self.sample_rate = 16000
        self.clients = {}  # Store recognizer per client
        self.load_model()
    
    def load_model(self):
        """Load the Vosk model without RNNLM to avoid hanging"""
        if not os.path.exists(self.model_path):
            print(f"Model not found at {self.model_path}")
            return
        
        print("Loading Vosk model (simplified)...")
        try:
            # Load model without advanced features to avoid hanging
            self.model = Model(self.model_path)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    async def register_client(self, websocket):
        """Register a new WebSocket client"""
        client_id = id(websocket)
        # Create a recognizer for each client
        if self.model:
            self.clients[client_id] = {
                'websocket': websocket,
                'recognizer': KaldiRecognizer(self.model, self.sample_rate)
            }
            print(f"Client registered. Total clients: {len(self.clients)}")
        else:
            print("Model not loaded, cannot register client")
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
            # Client disconnected, will be cleaned up in register_client
            pass
        except Exception as e:
            print(f"Error sending message to client: {e}")
    
    def process_audio_chunk(self, audio_data):
        """Process raw audio data - simplified approach"""
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Convert to 16-bit PCM if needed
            # Assume the data is already in the correct format from MediaRecorder
            return audio_bytes
            
        except Exception as e:
            print(f"Error processing audio chunk: {e}")
            return None
    
    async def process_audio_data(self, websocket, audio_data):
        """Process audio data received from WebSocket"""
        client_id = id(websocket)
        
        if client_id not in self.clients:
            print("Client not found")
            return
        
        try:
            # Process the audio chunk
            pcm_data = self.process_audio_chunk(audio_data)
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
                    # Only print partial results occasionally to reduce noise
                    if len(partial_result['partial']) > 3:
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
                if client_id in self.clients and self.model:
                    self.clients[client_id]['recognizer'] = KaldiRecognizer(self.model, self.sample_rate)
                    await self.send_to_client(websocket, {
                        'type': 'ready',
                        'message': 'STT ready for audio'
                    })
            elif data.get('type') == 'stop':
                print("Client stopped recording")
                # Get final result
                client_id = id(websocket)
                if client_id in self.clients:
                    recognizer = self.clients[client_id]['recognizer']
                    final_result = json.loads(recognizer.FinalResult())
                    if final_result.get('text'):
                        await self.send_to_client(websocket, {
                            'type': 'final',
                            'text': final_result['text']
                        })
                
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
    server = SimpleSTTServer()
    
    if server.model is None:
        print("Failed to load model. Exiting.")
        return None
    
    print("Simple STT Server is starting...")
    
    # Start the WebSocket server
    start_server = websockets.serve(handle_websocket, "localhost", 8765)
    
    print("STT Server is running on ws://localhost:8765")
    print("Ready to accept connections!")
    
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