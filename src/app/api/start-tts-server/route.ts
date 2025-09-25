import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let ttsProcess: ChildProcess | null = null;

export async function POST(_request: NextRequest) {
  try {
    // First, check if TTS server is already running on port 8001
    try {
      const healthCheck = await fetch('http://localhost:8001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      
      if (healthCheck.ok) {
        console.log('✅ TTS Server already running and healthy');
        return NextResponse.json({ 
          success: true, 
          message: 'TTS Server already running and healthy',
          alreadyRunning: true
        });
      }
    } catch (_healthError) {
      // Server not running, continue with startup
      console.log('TTS Server not running, starting new instance...');
    }

    // Check if we have a process reference but it might be dead
    if (ttsProcess && !ttsProcess.killed) {
      return NextResponse.json({ 
        success: true, 
        message: 'TTS Server process already exists',
        pid: ttsProcess.pid 
      });
    }

    // Path to TTS server
    const ttsPath = path.join(process.cwd(), 'tts-local');
    
    console.log('🚀 Starting TTS Server from:', ttsPath);

    // Start TTS server process using uvicorn
    ttsProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8001'], {
      cwd: ttsPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    // Handle process events
    ttsProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`TTS Server: ${data.toString()}`);
    });

    ttsProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`TTS Server Error: ${data.toString()}`);
    });

    ttsProcess.on('close', (code: number) => {
      console.log(`TTS Server process exited with code ${code}`);
      ttsProcess = null;
    });

    ttsProcess.on('error', (error: Error) => {
      console.error('TTS Server process error:', error);
      ttsProcess = null;
    });

    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    return NextResponse.json({ 
      success: true, 
      message: 'TTS Server started successfully',
      pid: ttsProcess.pid 
    });

  } catch (error) {
    console.error('Failed to start TTS Server:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    running: ttsProcess && !ttsProcess.killed,
    pid: ttsProcess?.pid || null
  });
}