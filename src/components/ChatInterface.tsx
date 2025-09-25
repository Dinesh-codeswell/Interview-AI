import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  currentTranscription: string;
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
  silenceTimer: number;
  interviewPhase: 'loading' | 'speaking' | 'listening' | 'processing' | 'completed';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentTranscription,
  isAISpeaking,
  isUserSpeaking,
  silenceTimer,
  interviewPhase
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getPhaseDisplay = () => {
    switch (interviewPhase) {
      case 'loading':
        return { text: 'Loading...', color: 'bg-gray-500' };
      case 'speaking':
        return { text: 'AI Speaking', color: 'bg-blue-500' };
      case 'listening':
        return { text: 'Listening', color: 'bg-green-500' };
      case 'processing':
        return { text: 'Processing', color: 'bg-yellow-500' };
      case 'completed':
        return { text: 'Completed', color: 'bg-purple-500' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const phaseDisplay = getPhaseDisplay();

  return (
    <Card className="w-80 h-96 flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Interview Chat</h3>
          <Badge className={`${phaseDisplay.color} text-white text-xs`}>
            {phaseDisplay.text}
          </Badge>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            {isAISpeaking ? (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            )}
            <span className="text-gray-600">AI</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {isUserSpeaking ? (
              <>
                <Mic className="w-3 h-3 text-green-500" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </>
            ) : (
              <>
                <MicOff className="w-3 h-3 text-gray-400" />
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </>
            )}
            <span className="text-gray-600">You</span>
          </div>
          
          {silenceTimer > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-600 text-xs">
                {5 - silenceTimer}s
              </span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${
              message.type === 'ai' ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.type === 'ai' && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] p-2 rounded-lg text-sm ${
                message.type === 'ai'
                  ? 'bg-blue-50 text-blue-900 border border-blue-200'
                  : 'bg-green-50 text-green-900 border border-green-200'
              } ${message.isPartial ? 'opacity-70' : ''}`}
            >
              <p className="leading-relaxed">{message.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {formatTime(message.timestamp)}
              </span>
            </div>
            
            {message.type === 'user' && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Current transcription (partial) */}
        {currentTranscription && (
          <div className="flex items-start space-x-2 justify-end">
            <div className="max-w-[70%] p-2 rounded-lg text-sm bg-green-50 text-green-900 border border-green-200 opacity-70">
              <p className="leading-relaxed">{currentTranscription}</p>
              <span className="text-xs opacity-60 mt-1 block">
                typing...
              </span>
            </div>
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {interviewPhase === 'loading' && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading interview...</span>
          </div>
        )}
        
        {/* Processing indicator */}
        {interviewPhase === 'processing' && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">Processing response...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};