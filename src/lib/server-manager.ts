// Server Manager - Automatically starts STT and TTS servers
export class ServerManager {
  private static instance: ServerManager;
  private sttServerProcess: unknown = null;
  private ttsServerProcess: unknown = null;
  private sttServerStarted = false;
  private ttsServerStarted = false;

  private constructor() {}

  public static getInstance(): ServerManager {
    if (!ServerManager.instance) {
      ServerManager.instance = new ServerManager();
    }
    return ServerManager.instance;
  }

  // Check if servers are running
  private async checkServerHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Start STT Server
  public async startSTTServer(): Promise<boolean> {
    if (this.sttServerStarted) {
      console.log('🎤 STT Server already started');
      return true;
    }

    try {
      console.log('🚀 Starting STT Server...');
      
      // Check if STT server is already running
      const isRunning = await this.checkServerHealth('ws://localhost:8765');
      if (isRunning) {
        console.log('✅ STT Server already running');
        this.sttServerStarted = true;
        return true;
      }

      // Start STT server via API call to Next.js backend
      const response = await fetch('/api/start-stt-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('✅ STT Server started successfully');
        this.sttServerStarted = true;
        return true;
      } else {
        console.error('❌ Failed to start STT Server');
        return false;
      }
    } catch (error) {
      console.error('❌ Error starting STT Server:', error);
      return false;
    }
  }

  // Start TTS Server
  public async startTTSServer(): Promise<boolean> {
    try {
      console.log('🚀 Checking TTS Server status...');
      
      // Check if TTS server is already running
      const isRunning = await this.checkServerHealth('http://localhost:8001/health');
      if (isRunning) {
        console.log('✅ TTS Server already running');
        this.ttsServerStarted = true;
        return true;
      }

      if (this.ttsServerStarted) {
        console.log('🔊 TTS Server already started by this manager');
        return true;
      }

      // Start TTS server via API call to Next.js backend
      const response = await fetch('/api/start-tts-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('✅ TTS Server started successfully');
        this.ttsServerStarted = true;
        return true;
      } else {
        console.error('❌ Failed to start TTS Server');
        return false;
      }
    } catch (error) {
      console.error('❌ Error starting TTS Server:', error);
      return false;
    }
  }

  // Start both servers
  public async startAllServers(): Promise<{ stt: boolean; tts: boolean }> {
    console.log('🚀 Starting all servers...');
    
    const [sttResult, ttsResult] = await Promise.all([
      this.startSTTServer(),
      this.startTTSServer()
    ]);

    return {
      stt: sttResult,
      tts: ttsResult
    };
  }

  // Reset server states (for testing/debugging)
  public resetServerStates(): void {
    this.sttServerStarted = false;
    this.ttsServerStarted = false;
    console.log('🔄 Server states reset');
  }
}

// Export singleton instance
export const serverManager = ServerManager.getInstance();