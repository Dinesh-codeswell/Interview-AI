"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  Timer, 
  Volume1, 
  Mic, 
  Camera, 
  MessageSquare, 
  Edit3, 
  FileText, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  ScanFace, 
  Webcam, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Pause,
  Building,
  User,
  BarChart3,
  Shield
} from "lucide-react";

interface LiveInterviewInterfaceProps {
  company: string;
  role: string;
  onEndInterview: () => void;
}

export default function LiveInterviewInterface({ 
  company, 
  role, 
  onEndInterview 
}: LiveInterviewInterfaceProps) {
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState('');
  const [lastCandidateResponse, setLastCandidateResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiResponse, setAiResponse] = useState("Welcome to your AI interview! I'm excited to learn more about you and your interest in this role. Let's start with telling me about yourself and why you're interested in this position at " + company + ".");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Mock proctoring data
  const [proctoring] = useState({
    score: 95,
    faceDetected: true,
    gazeTracking: true,
    environment: 'stable'
  });

  // Mock AI questions
  const aiQuestions = [
    "Welcome to your AI interview! I'm excited to learn more about you and your interest in this role. Let's start with telling me about yourself and why you're interested in this position at " + company + ".",
    "Can you tell me about a challenging project you've worked on and how you overcame the obstacles?",
    "How do you handle working under pressure and tight deadlines?",
    "What interests you most about working at " + company + "?",
    "Where do you see yourself in 5 years?",
    "Do you have any questions for me about the role or company?"
  ];

  // Mock AI persona
  const currentPersona = {
    name: "Sarah Chen",
    avatar: "👩‍💼"
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCandidateResponse = (response: string) => {
    // Simulate AI processing
    setAiSpeaking(true);
    setTimeout(() => {
      if (currentQuestion < aiQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setAiResponse(aiQuestions[currentQuestion + 1]);
      } else {
        setAiResponse("Thank you for your responses! That concludes our interview. You'll hear back from us soon.");
      }
      setAiSpeaking(false);
    }, 2000);
  };

  const completeInterview = () => {
    setIsInterviewActive(false);
    onEndInterview();
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">Live Interview</h1>
            <div className="flex items-center space-x-2 text-gray-300">
              <Building className="w-4 h-4" />
              <span className="text-sm">{company}</span>
              <span className="text-gray-500">•</span>
              <span className="text-sm">{role}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">
                {Math.floor(interviewTimer / 60)}:{(interviewTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            <Button 
              onClick={completeInterview}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - AI Interviewer */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* AI Persona */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">AI Interviewer</h3>
                  <p className="text-gray-400 text-xs">Senior HR Manager</p>
                </div>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-3">
                <p className="text-gray-200 text-sm leading-relaxed">
                  {aiResponse}
                </p>
              </div>
            </div>

            {/* Candidate's Last Response */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 text-sm">Your Last Response:</h4>
              <div className="bg-gray-600 rounded-lg p-3">
                <p className="text-gray-200 text-sm leading-relaxed">
                  {lastCandidateResponse || "No response yet..."}
                </p>
              </div>
            </div>

            {/* Interview Progress */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Progress</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Questions</span>
                    <span>{currentQuestion + 1}/{aiQuestions.length}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / aiQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Time Elapsed</span>
                    <span>{Math.floor(interviewTimer / 60)}m {interviewTimer % 60}s</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((interviewTimer / (30 * 60)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Proctoring */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Live Proctoring</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Face Detection</span>
                  <div className={`flex items-center space-x-1 ${
                    proctoring.faceDetected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {proctoring.faceDetected ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{proctoring.faceDetected ? 'Detected' : 'Not Found'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gaze Tracking</span>
                  <div className={`flex items-center space-x-1 ${
                    proctoring.gazeTracking ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {proctoring.gazeTracking ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{proctoring.gazeTracking ? 'Good' : 'Caution'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Environment</span>
                  <div className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Candidate Video & Interaction */}
        <div className="flex-1 bg-gray-900 relative">
          <div className="absolute inset-4">
            <div className="bg-gray-800 rounded-lg h-full flex flex-col relative">
              {/* Video Feed Area */}
              <div className="flex-1 flex items-center justify-center relative p-6">
                <div className="text-center">
                  <Webcam className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Your Camera Feed</p>
                  <p className="text-gray-500 text-sm mt-1">Ensure good lighting and stable connection</p>
                </div>
                
                {/* Recording Indicator */}
                <div className="absolute top-6 right-6 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">REC</span>
                </div>
                
                {/* AI Speaking Indicator */}
                {aiSpeaking && (
                  <div className="absolute top-6 left-6 flex items-center space-x-2 bg-green-600 px-3 py-2 rounded-full">
                    <Volume1 className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-white text-sm">AI Speaking</span>
                  </div>
                )}
              </div>
              
              {/* Response Area */}
              <div className="p-6 bg-gray-700 rounded-b-lg">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Your Response:</h4>
                    <Textarea 
                      className="w-full h-24 p-3 bg-gray-600 text-white rounded-lg text-sm resize-none border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Type your response here or use voice input..."
                      value={candidateResponse}
                      onChange={(e) => setCandidateResponse(e.target.value)}
                      disabled={aiSpeaking}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button 
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
                        disabled={aiSpeaking}
                      >
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">Voice Input</span>
                      </Button>
                      <Button 
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                        disabled={aiSpeaking}
                        onClick={() => {
                          setAiResponse("Take your time. Let me know when you're ready to continue.");
                        }}
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Need Time</span>
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        if (candidateResponse.trim()) {
                          handleCandidateResponse(candidateResponse);
                          setCandidateResponse('');
                        }
                      }}
                      disabled={!candidateResponse.trim() || aiSpeaking}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Response
                    </Button>
                  </div>
                  
                  {/* Quick Response Options */}
                  <div className="space-y-2">
                    <span className="text-gray-400 text-xs">Quick responses:</span>
                    <Button 
                      onClick={() => setCandidateResponse("Could you please repeat the question?")}
                      className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500"
                      disabled={aiSpeaking}
                    >
                      Repeat Question
                    </Button>
                    <Button 
                      onClick={() => setCandidateResponse("I need a moment to think about this.")}
                      className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500"
                      disabled={aiSpeaking}
                    >
                      Thinking
                    </Button>
                    <Button 
                      onClick={() => setCandidateResponse("Can you provide more context about this question?")}
                      className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500"
                      disabled={aiSpeaking}
                    >
                      Need Clarification
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4 bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                  <Button className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Tools & Information */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Current Question Context */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Question Context</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">HR/Behavioral</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Focus:</span>
                  <span className="text-white">Company Fit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Left:</span>
                  <span className="text-white">{Math.max(0, 30 * 60 - interviewTimer)} sec</span>
                </div>
              </div>
            </div>
            
            {/* Whiteboard */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Whiteboard</span>
              </h4>
              <div className="bg-white rounded-lg h-40 p-2 relative">
                <canvas 
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair"
                  width={280}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                />
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <Button 
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                      }
                    }}
                    className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                  >
                    Clear
                  </Button>
                  <Button className="px-2 py-1 bg-blue-200 rounded text-xs hover:bg-blue-300">
                    Save
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Private Notes */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Private Notes</span>
              </h4>
              <Textarea 
                className="w-full h-28 p-3 bg-gray-600 text-white rounded-lg text-sm resize-none border border-gray-500 focus:border-blue-500"
                placeholder="Take notes during the interview... (Only visible to you)"
              />
            </div>
            
            {/* Interview Tips */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>Live Tips</span>
              </h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                  <span>Use STAR method for behavioral questions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-2"></div>
                  <span>Maintain eye contact with camera</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2"></div>
                  <span>Take time to think before responding</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full mt-2"></div>
                  <span>Ask clarifying questions when needed</span>
                </div>
              </div>
            </div>
            
            {/* Session Controls */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 text-sm">Session Controls</h4>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(prev => prev - 1);
                      setAiResponse(aiQuestions[currentQuestion - 1]);
                    }
                  }}
                  disabled={currentQuestion === 0}
                  className="w-full p-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" />
                  Previous Question
                </Button>
                <Button 
                  onClick={() => {
                    setAiResponse('Take your time. I\'m here when you\'re ready to continue with the next part.');
                  }}
                  className="w-full p-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-500"
                >
                  <Pause className="w-4 h-4 inline mr-1" />
                  Request Break
                </Button>
                <Button 
                  onClick={() => {
                    if (currentQuestion < aiQuestions.length - 1) {
                      setCurrentQuestion(prev => prev + 1);
                      setAiResponse(aiQuestions[currentQuestion + 1]);
                    }
                  }}
                  disabled={currentQuestion >= aiQuestions.length - 1}
                  className="w-full p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 inline mr-1" />
                  Next Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}