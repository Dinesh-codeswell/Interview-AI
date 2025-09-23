"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, 
  Mic, 
  MicOff, 
  VideoOff, 
  Send, 
  MessageSquare,
  Clock,
  User,
  Bot,
  Volume2,
  VolumeX,
  Settings,
  Minimize2,
  Maximize2,
  X
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'interviewer';
  content: string;
  timestamp: Date;
}

interface InterviewInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  role: string;
}

export default function InterviewInterface({ 
  isOpen, 
  onClose, 
  company, 
  role 
}: InterviewInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'interviewer',
      content: `Hello! Welcome to your ${company} ${role} interview. I'm excited to get to know you better. Let's start with a simple question: Can you tell me a bit about yourself and what interests you about this role?`,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setInterviewTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize camera and microphone
  useEffect(() => {
    if (isOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      
      // Simulate interviewer response after a delay
      setTimeout(() => {
        const responses = [
          "That's interesting! Can you elaborate on that experience?",
          "Great! Now, let me ask you about a technical challenge you've faced.",
          "I see. How would you approach solving this problem?",
          "Excellent point. What would you say is your biggest strength?",
          "Thank you for sharing. Can you walk me through your thought process?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const interviewerMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'interviewer',
          content: randomResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, interviewerMessage]);
      }, 2000 + Math.random() * 3000);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      if (streamRef.current) {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        
        // Auto-stop after 30 seconds (demo purposes)
        setTimeout(() => {
          if (mediaRecorderRef.current && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            // Simulate speech-to-text result
            setCurrentMessage(prev => prev + " [Voice input detected]");
          }
        }, 30000);
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-96 h-64' : 'w-[95vw] h-[95vh] max-w-7xl'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold">{company} Interview</h2>
              <p className="text-blue-100">{role}</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(interviewTime)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex h-full">
            {/* Video Section - 70% width */}
            <div className="w-[70%] bg-gray-900 relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="w-16 h-16 mx-auto mb-4" />
                    <p>Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Video Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  onClick={toggleMute}
                  className="rounded-full"
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={toggleVideo}
                  className="rounded-full"
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  onClick={toggleRecording}
                  className="rounded-full"
                >
                  {isRecording ? (
                    <div className="w-6 h-6 bg-red-500 rounded-sm animate-pulse" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>

            {/* Chat Section - 30% width */}
            <div className="w-[30%] bg-white border-l flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Interview Chat
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.type === 'user' ? 'You' : 'Interviewer'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={toggleRecording}
                      size="sm"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {isRecording && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                    Recording... (Click mic to stop)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">{company} Interview</p>
                <p className="text-sm text-gray-600">{formatTime(interviewTime)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={toggleMute}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleVideo}>
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}