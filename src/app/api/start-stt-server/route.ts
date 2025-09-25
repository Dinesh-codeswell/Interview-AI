import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

let sttProcess: any = null;

export async function POST(request: NextRequest) {
  try {
    // Check if STT server is already running
    if (sttProcess && !sttProcess.killed) {
      return NextResponse.json({ 
        success: true, 
        message: 'STT Server already running',
        pid: sttProcess.pid 
      });
    }

    // Path to STT server - using the fixed version
    const sttPath = path.join(process.cwd(), 'stt');
    const pythonScript = path.join(sttPath, 'stt_server_fixed.py');

    console.log('Starting STT Server from:', pythonScript);

    // Start STT server process
    sttProcess = spawn('python', [pythonScript], {
      cwd: sttPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    // Handle process events
    sttProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`STT Server: ${data.toString()}`);
    });

    sttProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`STT Server Error: ${data.toString()}`);
    });

    sttProcess.on('close', (code: number) => {
      console.log(`STT Server process exited with code ${code}`);
      sttProcess = null;
    });

    sttProcess.on('error', (error: Error) => {
      console.error('STT Server process error:', error);
      sttProcess = null;
    });

    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ 
      success: true, 
      message: 'STT Server started successfully',
      pid: sttProcess.pid 
    });

  } catch (error) {
    console.error('Failed to start STT Server:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    running: sttProcess && !sttProcess.killed,
    pid: sttProcess?.pid || null
  });
}