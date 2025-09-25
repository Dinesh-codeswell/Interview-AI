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
import { useInterviewEngine } from '@/hooks/useInterviewEngine';
import { ChatInterface } from '@/components/ChatInterface';
import { serverManager } from '@/lib/server-manager';

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

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

export default function LiveInterviewInterface({ company, role }: LiveInterviewInterfaceProps) {
  // Existing state variables
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // New state for AI interview
  const [messages, setMessages] = useState<Message[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // AI Interview Engine - always call the hook to avoid conditional hooks violation
  const interviewEngine = useInterviewEngine({
    company,
    role,
    mediaStream: stream, // Pass stream even if null, hook will handle it
    onInterviewComplete: () => {
      console.log('Interview completed!');
      // Handle interview completion
    }
  });

  // Extract values directly from the hook
  const {
    questions,
    currentQuestion,
    currentQuestionIndex,
    isAISpeaking,
    isUserSpeaking,
    currentTranscription,
    finalTranscription,
    silenceTimer,
    interviewPhase,
    moveToNextQuestion,
    resetSilenceTimer
  } = interviewEngine;

  // Update messages when AI speaks or user responds
  useEffect(() => {
    if (currentQuestion && !messages.find(m => m.content === currentQuestion.text)) {
      setMessages(prev => [...prev, {
        id: `ai-${currentQuestionIndex}`,
        type: 'ai',
        content: currentQuestion.text,
        timestamp: new Date()
      }]);
    }
  }, [currentQuestion, currentQuestionIndex, messages]);

  useEffect(() => {
    if (finalTranscription.trim()) {
      setMessages(prev => {
        // Remove any existing partial message for this response
        const filtered = prev.filter(m => !(m.type === 'user' && m.isPartial));
        return [...filtered, {
          id: `user-${Date.now()}`,
          type: 'user',
          content: finalTranscription.trim(),
          timestamp: new Date()
        }];
      });
    }
  }, [finalTranscription]);

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

  // Simple and stable media access function
  // Request media access (camera and microphone)
  const requestMediaAccess = useCallback(async () => {
    console.log('🎥 Requesting media access...');
    setPermissionRequested(true);
    setError(null);
    setIsInitializing(true);
    
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setStream(null);
      }

      let mediaStream: MediaStream;
      
      // Try with optimized constraints first
      try {
        console.log('🎥 Attempting high-quality media access...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920, min: 640 },
            height: { ideal: 720, max: 1080, min: 480 },
            frameRate: { ideal: 30, max: 60, min: 15 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: { ideal: 48000 }
          }
        });
        console.log('✅ High-quality media stream obtained');
      } catch (constraintError) {
        console.warn('⚠️ High quality constraints failed, trying basic settings:', constraintError);
        
        // Fallback to very basic constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true
          });
          console.log('✅ Basic media stream obtained');
        } catch (basicError) {
          console.warn('⚠️ Basic constraints failed, trying minimal settings:', basicError);
          
          // Final fallback - absolute minimal constraints
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          console.log('✅ Minimal media stream obtained');
        }
      }

      // Validate stream
      if (!mediaStream || !mediaStream.active) {
        throw new Error('Media stream is not active');
      }

      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();

      if (videoTracks.length === 0) {
        throw new Error('No video track available');
      }

      if (audioTracks.length === 0) {
        throw new Error('No audio track available');
      }

      console.log('✅ Media stream validated:', {
        video: videoTracks.length > 0,
        audio: audioTracks.length > 0,
        videoTrackState: videoTracks[0]?.readyState,
        audioTrackState: audioTracks[0]?.readyState,
        videoSettings: videoTracks[0]?.getSettings(),
        audioSettings: audioTracks[0]?.getSettings()
      });

      // Store stream reference
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCameraOn(true);
      setIsMicOn(true);

      // Set up video element with enhanced error handling
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not found');
      }

      console.log('📹 Setting up video element...');
      
      // Clear any existing src
      video.srcObject = null;
      video.src = '';
      
      // Set up comprehensive event handlers
      const handleVideoReady = () => {
        console.log('📹 Video is ready and playing');
        setIsVideoReady(true);
        setIsInitializing(false);
        setError(null);
      };

      const handleVideoError = (event: Event) => {
        console.error('📹 Video error:', event);
        const videoElement = event.target as HTMLVideoElement;
        if (videoElement && videoElement.error) {
          console.error('Video error details:', videoElement.error);
        }
      };

      video.onloadedmetadata = () => {
        console.log('📹 Video metadata loaded');
        video.play().catch(playError => {
          console.warn('📹 Video play failed:', playError);
          setError('Click anywhere to start video');
        });
      };
      
      video.onloadeddata = () => {
        console.log('📹 Video data loaded');
      };
      
      video.oncanplay = () => {
        console.log('📹 Video can play');
        handleVideoReady();
      };
      
      video.onplaying = () => {
        console.log('📹 Video is playing');
        handleVideoReady();
      };

      video.onerror = handleVideoError;
      
      // Set the stream
      video.srcObject = mediaStream;
      
      // Try to play the video with better error handling
      try {
        await video.play();
        console.log('✅ Video playing successfully');
        handleVideoReady();
      } catch (playError) {
        console.warn('⚠️ Video autoplay blocked or failed:', playError);
        setError('Click anywhere to start video');
        
        const startVideoOnClick = async () => {
          try {
            await video.play();
            console.log('✅ Video started after user interaction');
            handleVideoReady();
            document.removeEventListener('click', startVideoOnClick);
          } catch (clickPlayError) {
            console.error('❌ Video play failed even after user interaction:', clickPlayError);
            setError('Video playback failed. Please refresh and try again.');
          }
        };
        
        document.addEventListener('click', startVideoOnClick, { once: true });
      }

      // Enter fullscreen mode for better interview experience
      try {
        await enterFullscreen();
      } catch (fullscreenError) {
        console.warn('⚠️ Fullscreen not supported or blocked:', fullscreenError);
        // Continue without fullscreen
      }
      
      // Safety timeout - ensure we don't stay in initializing state forever
      setTimeout(() => {
        if (mediaStream && mediaStream.active && video && video.srcObject === mediaStream) {
          console.log('🔧 Safety timeout: Forcing video ready state');
          setIsVideoReady(true);
          setIsInitializing(false);
          
          // If video is still paused, try to play it
          if (video.paused) {
            video.play().catch(timeoutPlayError => {
              console.warn('🔧 Safety timeout play failed:', timeoutPlayError);
              setError('Click anywhere to start video');
            });
          }
        }
      }, 5000);
      
    } catch (error: unknown) {
      console.error('❌ Media access failed:', error);
      
      let errorMessage = 'Camera and microphone access failed';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera and microphone access denied. Please allow permissions and refresh the page.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera or microphone found. Please connect your devices and refresh the page.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is busy or being used by another application. Please close other apps using the camera and refresh.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Camera settings not supported by your device. Trying basic settings...';
            
            // Final attempt with absolute minimal constraints
            try {
              console.log('🔧 Final attempt with minimal constraints...');
              const minimalStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
              });
              
              if (minimalStream && minimalStream.active) {
                streamRef.current = minimalStream;
                setStream(minimalStream);
                setIsCameraOn(true);
                setIsMicOn(true);
                
                const video = videoRef.current;
                if (video) {
                  video.srcObject = minimalStream;
                  await video.play();
                  setIsVideoReady(true);
                  setIsInitializing(false);
                  setError(null);
                  console.log('✅ Minimal constraints worked');
                  return;
                }
              }
            } catch (minimalError) {
              console.error('❌ Even minimal constraints failed:', minimalError);
              errorMessage = `Camera initialization failed: ${minimalError instanceof Error ? minimalError.message : 'Unknown error'}`;
            }
            break;
          case 'AbortError':
            errorMessage = 'Camera access was interrupted. Please try again.';
            break;
          default:
            errorMessage = `Camera error: ${error.message || 'Unknown error occurred'}`;
        }
      } else {
        errorMessage = 'An unexpected error occurred while accessing camera and microphone.';
      }
      
      setError(errorMessage);
      setPermissionRequested(false);
      setIsVideoReady(false);
      setIsInitializing(false);
      setIsCameraOn(false);
      setIsMicOn(false);
    }
  }, [enterFullscreen]);

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
        
        // Notify the interview engine about microphone state change
        if (audioTrack.enabled) {
          console.log('🎤 Microphone enabled - starting listening');
        } else {
          console.log('🎤 Microphone disabled - stopping listening');
        }
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
        
        // First, start all required servers
        console.log('🔧 Starting required servers...');
        const serverResults = await serverManager.startAllServers();
        
        if (!serverResults.stt) {
          console.warn('⚠️ STT Server failed to start, speech recognition may not work');
        }
        
        if (!serverResults.tts) {
          console.warn('⚠️ TTS Server failed to start, audio responses may not work');
        }
        
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser does not support camera/microphone access');
        }
        
        // Check available devices first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        console.log('📱 Available devices:', {
          video: videoDevices.length,
          audio: audioDevices.length
        });
        
        if (videoDevices.length === 0) {
          throw new Error('No camera found. Please connect a camera and refresh the page.');
        }
        
        if (audioDevices.length === 0) {
          throw new Error('No microphone found. Please connect a microphone and refresh the page.');
        }
        
        await requestMediaAccess();
      } catch (error) {
        console.error('❌ Failed to initialize interview:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize interview');
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
  }, []); // Empty dependency array - only run once on mount

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
          {/* Video Element - Always rendered for immediate access */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ 
              transform: 'scaleX(-1)', // Mirror effect
              opacity: stream ? 1 : 0, // Use opacity instead of display
              pointerEvents: stream ? 'auto' : 'none'
            }}
            onLoadedData={() => {
              console.log('Video data loaded and ready');
              setIsVideoReady(true);
              setIsInitializing(false);
            }}
            onError={(e) => console.error('Video error:', e)}
          />
          
          {/* Fallback UI when no stream */}
          {!stream && (
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
          
          {/* Chat Interface - Bottom Left with proper spacing */}
          {stream && (
            <div className="absolute bottom-24 left-8 w-96 max-h-80 z-10">
              <ChatInterface
                messages={messages}
                currentTranscription={currentTranscription}
                isAISpeaking={isAISpeaking}
                isUserSpeaking={isUserSpeaking}
                silenceTimer={silenceTimer}
                interviewPhase={interviewPhase}
              />
            </div>
          )}

          {/* Camera Controls - Bottom Center with Blur Background */}
          {stream && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
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