"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Clock
} from "lucide-react";

// Interface for browser fullscreen APIs
interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
  mozFullScreenElement?: Element;
}

interface ElementWithFullscreen extends Element {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
}

interface LiveInterviewInterfaceProps {
  company: string;
  role: string;
}

export default function LiveInterviewInterface({ company, role }: LiveInterviewInterfaceProps) {
  // State variables
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewActive) {
      interval = setInterval(() => {
        setInterviewTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewActive]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup function for streams
  const cleanupStreams = useCallback(() => {
    console.log('🧹 Cleaning up existing streams...');
    
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track: ${track.label}`);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track: ${track.label}`);
        track.stop();
      });
      setStream(null);
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      videoRef.current.onerror = null;
    }
    
    console.log('✅ Stream cleanup completed');
  }, [stream]);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    try {
      console.log('🔄 Attempting to enter fullscreen mode...');
      
      // Ensure we have a video stream before going fullscreen
      if (!stream || !isVideoReady) {
        console.warn('⚠️ Cannot enter fullscreen: video not ready');
        return;
      }
      
      const element = document.documentElement;
      
      // Try different fullscreen methods for cross-browser compatibility
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        console.log('✅ Standard fullscreen API used');
      } else if ((element as ElementWithFullscreen).webkitRequestFullscreen) {
        await (element as ElementWithFullscreen).webkitRequestFullscreen!();
        console.log('✅ WebKit fullscreen API used');
      } else if ((element as ElementWithFullscreen).msRequestFullscreen) {
        await (element as ElementWithFullscreen).msRequestFullscreen!();
        console.log('✅ MS fullscreen API used');
      } else if ((element as ElementWithFullscreen).mozRequestFullScreen) {
        await (element as ElementWithFullscreen).mozRequestFullScreen!();
        console.log('✅ Mozilla fullscreen API used');
      } else {
        console.warn('⚠️ Fullscreen API not supported');
        // Fallback: hide browser UI as much as possible
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        return;
      }
      
      console.log('🎯 Fullscreen mode activated successfully');
      
      // Add fullscreen change listeners
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as DocumentWithFullscreen).webkitFullscreenElement ||
          (document as DocumentWithFullscreen).msFullscreenElement ||
          (document as DocumentWithFullscreen).mozFullScreenElement
        );
        
        console.log('📱 Fullscreen state changed:', isCurrentlyFullscreen);
        
        if (!isCurrentlyFullscreen) {
          console.log('📤 Exited fullscreen mode');
        }
      };
      
      // Remove existing listeners first
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      
      // Add new listeners
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      
    } catch (error) {
      console.error('❌ Error entering fullscreen:', error);
      setError('Failed to enter fullscreen mode');
      
      // Fallback approach
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }, [stream, isVideoReady]);

  // Exit fullscreen mode
  const exitFullscreen = async () => {
    try {
      console.log('Attempting to exit fullscreen...');
      
      // Add proper type definitions for browser fullscreen APIs
      interface DocumentWithFullscreen extends Document {
        webkitExitFullscreen?: () => Promise<void>;
        webkitFullscreenElement?: Element;
        msExitFullscreen?: () => Promise<void>;
        msFullscreenElement?: Element;
        mozCancelFullScreen?: () => Promise<void>;
        mozFullScreenElement?: Element;
      }
      
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as DocumentWithFullscreen).webkitExitFullscreen && (document as DocumentWithFullscreen).webkitFullscreenElement) {
        await (document as DocumentWithFullscreen).webkitExitFullscreen?.();
      } else if ((document as DocumentWithFullscreen).msExitFullscreen && (document as DocumentWithFullscreen).msFullscreenElement) {
        await (document as DocumentWithFullscreen).msExitFullscreen?.();
      } else if ((document as DocumentWithFullscreen).mozCancelFullScreen && (document as DocumentWithFullscreen).mozFullScreenElement) {
        await (document as DocumentWithFullscreen).mozCancelFullScreen?.();
      }
      
      document.body.style.overflow = 'auto'; // Restore scrolling
      console.log('Fullscreen mode deactivated');
      
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
      document.body.style.overflow = 'auto';
    }
  };

  // Request media access with proper error handling
  const requestMediaAccess = useCallback(async () => {
    try {
      console.log('🎥 Starting media access request...');
      setPermissionRequested(true);
      setError(null);
      setIsVideoReady(false);
      
      // Clean up any existing streams first
      cleanupStreams();
      
      // Wait longer for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📋 Requesting user media with basic constraints...');
      
      // Start with very basic constraints to avoid allocation errors
      const basicConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      console.log('✅ Media stream obtained successfully');
      console.log('📊 Stream tracks:', mediaStream.getTracks().map(track => 
        `${track.kind}: ${track.label} (${track.readyState})`
      ));
      
      // Store stream in both state and ref
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setIsCameraOn(true);
      setIsMicOn(true);
      setIsInterviewActive(true);
      
      // Set up video element
      if (videoRef.current) {
        console.log('🎬 Setting up video element...');
        
        const video = videoRef.current;
        
        // Clear any existing src first
        video.srcObject = null;
        video.src = '';
        
        // Set up event handlers
        const handleLoadedMetadata = () => {
          console.log('📐 Video metadata loaded');
          console.log(`📏 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
          setIsVideoReady(true);
        };
        
        const handleCanPlay = () => {
          console.log('▶️ Video can start playing');
          if (video) {
            video.play().catch(e => {
              console.warn('Autoplay failed, will try on user interaction:', e);
            });
          }
        };
        
        const handlePlaying = () => {
          console.log('✅ Video is playing');
          setIsVideoReady(true);
          setIsInitializing(false);
          // Trigger fullscreen once video is playing
          setTimeout(() => {
            enterFullscreen();
          }, 500);
        };
        
        const handleError = (e: Event) => {
          console.error('❌ Video element error:', e);
          setError('Video playback failed');
          setIsVideoReady(false);
        };
        
        // Remove existing listeners first
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
        
        // Assign event handlers
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('error', handleError);
        
        // Configure video element
        video.srcObject = mediaStream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        console.log('🔗 Stream assigned to video element');
        
        // Force load and play
        try {
          console.log('▶️ Attempting to load and play video...');
          await video.load();
          await video.play();
          console.log('✅ Video playback started successfully');
        } catch (playError) {
          console.error('❌ Video play failed:', playError);
          
          // Retry after a delay
          setTimeout(async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play();
                console.log('✅ Video started on retry');
              }
            } catch (retryError) {
              console.warn('❌ Video retry failed:', retryError);
            }
          }, 1000);
          
          setError('Click anywhere to start video');
        }
      } else {
        console.error('❌ Video ref not available');
        setError('Video element not ready');
      }
      
    } catch (error: unknown) {
      console.error('❌ Media access failed:', error);
      
      // Handle specific error types
      let errorMessage = 'Camera access failed';
      
      if (error instanceof Error) {
        if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
        } else if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera and microphone access denied. Please allow permissions and refresh the page.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a camera and microphone.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported. Trying with minimal settings...';
          
          // Retry with minimal constraints
          try {
            console.log('🔄 Retrying with minimal constraints...');
            const minimalStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          
          setStream(minimalStream);
          streamRef.current = minimalStream;
          setIsCameraOn(true);
          setIsMicOn(true);
          setIsInterviewActive(true);
          
          if (videoRef.current) {
            videoRef.current.srcObject = minimalStream;
            await videoRef.current.play();
            setIsVideoReady(true);
            setIsInitializing(false);
          }
          
          return; // Success with minimal constraints
        } catch (retryError) {
          console.error('❌ Retry with minimal constraints failed:', retryError);
          errorMessage = 'Camera initialization failed even with minimal settings. Please check your camera.';
        }
      }
    }
      
      setError(errorMessage);
      setPermissionRequested(false);
      setIsVideoReady(false);
      setIsInitializing(false);
    }
  }, [cleanupStreams, enterFullscreen]);

  // Handle end interview
  const handleEndInterview = async () => {
    console.log('🔚 Ending interview...');
    
    // Stop media stream
    cleanupStreams();
    
    setIsInterviewActive(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsVideoReady(false);
    setIsInitializing(true);
    
    // Exit fullscreen
    await exitFullscreen();
    
    // Redirect to homepage
    window.location.href = '/';
  };

  // Toggle camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        console.log(`📹 Camera ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        console.log(`🎤 Microphone ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  };

  // Initialize media access on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, initializing interview...');
    
    // Start the interview immediately
    setIsInterviewActive(true);
    
    // Start the interview initialization
    const initializeInterview = async () => {
      try {
        setIsInitializing(true);
        await requestMediaAccess();
      } catch (error) {
        console.error('❌ Failed to initialize interview:', error);
        setError('Failed to initialize interview');
        setIsInitializing(false);
      }
    };

    // Small delay to ensure component is fully mounted
    const timeoutId = setTimeout(initializeInterview, 500);

    // Cleanup function
    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      clearTimeout(timeoutId);
      cleanupStreams();
    };
  }, [requestMediaAccess, cleanupStreams]); // Add missing dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">BC</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{company} Interview</h1>
                <p className="text-sm text-gray-600">{role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(interviewTimer)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600">Recording</span>
              </div>
              
              <Button 
                onClick={handleEndInterview}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Screen Camera */}
      <div className="flex-1 relative h-screen">
        <div className="absolute inset-0 bg-black">
          {stream && videoRef.current && isVideoReady && !isInitializing ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror effect
              onLoadedData={() => console.log('Video data loaded and ready')}
              onError={(e) => console.error('Video error:', e)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center text-white">
                <Video className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                {error ? (
                  <>
                    <p className="text-xl font-medium mb-2 text-red-400">Camera Error</p>
                    <p className="text-gray-400 max-w-md mx-auto">{error}</p>
                    <Button 
                      onClick={() => {
                        setError(null);
                        requestMediaAccess();
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      Try Again
                    </Button>
                  </>
                ) : isInitializing ? (
                  <>
                    <p className="text-xl font-medium mb-2">Initializing Interview...</p>
                    <p className="text-gray-400">Setting up camera and microphone...</p>
                  </>
                ) : permissionRequested ? (
                  <>
                    <p className="text-xl font-medium mb-2">Loading Camera...</p>
                    <p className="text-gray-400">Camera is starting up, please wait...</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-medium mb-2">Requesting Camera Access...</p>
                    <p className="text-gray-400">Please allow camera and microphone permissions to start the interview</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Camera Controls - Bottom Center with Blur Background */}
          {(stream && isVideoReady) && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-6 bg-black/20 backdrop-blur-md px-8 py-4 rounded-full border border-white/10">
                <Button
                  onClick={toggleMicrophone}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isMicOn 
                      ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20' 
                      : 'bg-red-500/80 hover:bg-red-600/80 text-white border border-red-400/50'
                  }`}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </Button>
                
                <Button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    isCameraOn 
                      ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20' 
                      : 'bg-red-500/80 hover:bg-red-600/80 text-white border border-red-400/50'
                  }`}
                >
                  {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}