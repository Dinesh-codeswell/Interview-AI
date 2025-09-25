import { useState, useEffect, useCallback, useRef } from 'react';

interface Question {
  id: number;
  text: string;
  type: string;
  expectedDuration: number;
}

interface InterviewState {
  questions: Question[];
  currentQuestionIndex: number;
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
  currentTranscription: string;
  finalTranscription: string;
  silenceTimer: number;
  interviewPhase: 'loading' | 'speaking' | 'listening' | 'processing' | 'completed';
}

interface UseInterviewEngineProps {
  company: string;
  role: string;
  mediaStream?: MediaStream | null;
  onInterviewComplete?: () => void;
}

export const useInterviewEngine = ({ company, role, mediaStream, onInterviewComplete }: UseInterviewEngineProps) => {
  const [state, setState] = useState<InterviewState>({
    questions: [],
    currentQuestionIndex: 0,
    isAISpeaking: false,
    isUserSpeaking: false,
    currentTranscription: '',
    finalTranscription: '',
    silenceTimer: 0,
    interviewPhase: 'loading'
  });

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Load interview questions
  const loadQuestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/interview/questions?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`);
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          questions: data.questions,
          interviewPhase: 'speaking'
        }));
        
        // Start with the first question - call directly to avoid circular dependency
        const firstQuestionText = data.questions[0].text;
        setState(prev => ({ ...prev, isAISpeaking: true, interviewPhase: 'speaking' }));
        
        try {
          console.log('🔊 Generating TTS for first question:', firstQuestionText.substring(0, 50) + '...');
          
          const response = await fetch('http://localhost:8001/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: firstQuestionText })
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            if (audioRef.current) {
              audioRef.current.src = audioUrl;
              await audioRef.current.play();
            }
          }
        } catch (error) {
          console.error('TTS Error for first question:', error);
        } finally {
          setState(prev => ({ ...prev, isAISpeaking: false, interviewPhase: 'listening' }));
        }
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  }, [company, role]); // Remove speakQuestion dependency to avoid circular reference

  // Speak question using TTS
  const speakQuestion: (text: string) => Promise<void> = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, isAISpeaking: true, interviewPhase: 'speaking' }));
    
    try {
      console.log('🔊 Generating TTS for:', text.substring(0, 50) + '...');
      
      const response = await fetch('http://localhost:8001/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('✅ TTS audio generated, blob size:', audioBlob.size, 'bytes');
        
        if (audioRef.current) {
          // Stop any currently playing audio to prevent AbortError
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          
          // Set volume to ensure audio is audible
          audioRef.current.volume = 0.8;
          audioRef.current.src = audioUrl;
          
          audioRef.current.onended = () => {
            console.log('🔊 Audio playback ended');
            setState(prev => ({ 
              ...prev, 
              isAISpeaking: false, 
              interviewPhase: 'listening' 
            }));
            startListening();
            // Clean up blob URL
            URL.revokeObjectURL(audioUrl);
          };
          
          audioRef.current.onerror = (error) => {
            console.error('🔊 Audio playback error:', error);
            setState(prev => ({ 
              ...prev, 
              isAISpeaking: false, 
              interviewPhase: 'listening' 
            }));
            startListening();
            URL.revokeObjectURL(audioUrl);
          };
          
          // Add error handling for play() promise
          try {
            console.log('🔊 Starting audio playback...');
            await audioRef.current.play();
            console.log('✅ Audio playback started successfully');
          } catch (playError: unknown) {
            console.error('❌ Audio play failed:', playError);
            
            // Check if it's an autoplay policy issue
            if (playError instanceof Error && playError.name === 'NotAllowedError') {
              console.warn('🚫 Autoplay blocked by browser policy');
              alert('Please click anywhere on the page to enable audio playback, then the interview will continue.');
              
              // Add click listener to enable audio
              const enableAudio = async () => {
                try {
                  await audioRef.current?.play();
                  console.log('✅ Audio enabled after user interaction');
                  document.removeEventListener('click', enableAudio);
                } catch (retryError) {
                  console.error('❌ Audio still failed after user interaction:', retryError);
                }
              };
              document.addEventListener('click', enableAudio, { once: true });
            }
            
            // Still proceed with the interview flow
            setState(prev => ({ 
              ...prev, 
              isAISpeaking: false, 
              interviewPhase: 'listening' 
            }));
            startListening();
            URL.revokeObjectURL(audioUrl);
          }
        }
      } else {
        console.error('❌ TTS server error:', response.status, response.statusText);
        throw new Error(`TTS server returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ TTS Error:', error);
      setState(prev => ({ 
        ...prev, 
        isAISpeaking: false, 
        interviewPhase: 'listening' 
      }));
      startListening();
    }
  }, []); // Remove startListening dependency to avoid circular reference

  // Play welcome audio with guidelines
  const playWelcomeAudio = useCallback(async () => {
    const welcomeText = `Welcome to your AI interview! I'm excited to help you practice today. Here are some quick guidelines: Please speak clearly and naturally, take your time to think before answering, and remember this is a safe space to practice. I will ask you three questions about your introduction, technical skills, and experience. Let's begin!`;
    
    setState(prev => ({ ...prev, isAISpeaking: true, interviewPhase: 'speaking' }));
    
    try {
      console.log('🎉 Playing welcome audio...');
      
      const response = await fetch('http://localhost:8001/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: welcomeText })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('✅ Welcome audio generated, blob size:', audioBlob.size, 'bytes');
        
        if (audioRef.current) {
          // Stop any currently playing audio to prevent AbortError
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          
          // Set volume to ensure audio is audible
          audioRef.current.volume = 0.8;
          audioRef.current.src = audioUrl;
          
          audioRef.current.onended = () => {
            console.log('🎉 Welcome audio playback ended');
            setState(prev => ({ 
              ...prev, 
              isAISpeaking: false, 
              interviewPhase: 'listening' 
            }));
            // Start the first question after welcome message
            setTimeout(() => {
              if (state.questions.length > 0) {
                speakQuestion(state.questions[0].text);
              }
            }, 1000);
            // Clean up blob URL
            URL.revokeObjectURL(audioUrl);
          };
          
          audioRef.current.onerror = (error) => {
            console.error('🎉 Welcome audio playback error:', error);
            setState(prev => ({ 
              ...prev, 
              isAISpeaking: false, 
              interviewPhase: 'listening' 
            }));
            setTimeout(() => {
              if (state.questions.length > 0) {
                speakQuestion(state.questions[0].text);
              }
            }, 1000);
            URL.revokeObjectURL(audioUrl);
          };
          
          // Add error handling for play() promise
          try {
            console.log('🎉 Starting welcome audio playback...');
            await audioRef.current.play();
            console.log('✅ Welcome audio playback started successfully');
          } catch (playError: unknown) {
            console.error('❌ Welcome audio play failed:', playError);
            
            // Check if it's an autoplay policy issue
            if (playError instanceof Error && playError.name === 'NotAllowedError') {
              console.warn('🚫 Welcome audio autoplay blocked by browser policy');
              alert('Welcome! Please click anywhere on the page to start the interview with audio.');
              
              // Add click listener to enable audio
              const enableWelcomeAudio = async () => {
                try {
                  await audioRef.current?.play();
                  console.log('✅ Welcome audio enabled after user interaction');
                  document.removeEventListener('click', enableWelcomeAudio);
                } catch (retryError) {
                  console.error('❌ Welcome audio still failed after user interaction:', retryError);
                  // Proceed without audio
                  setState(prev => ({ 
                    ...prev, 
                    isAISpeaking: false, 
                    interviewPhase: 'listening' 
                  }));
                  setTimeout(() => {
                    if (state.questions.length > 0) {
                      speakQuestion(state.questions[0].text);
                    }
                  }, 1000);
                }
              };
              document.addEventListener('click', enableWelcomeAudio, { once: true });
            } else {
              // Still proceed with the interview
              setState(prev => ({ 
                ...prev, 
                isAISpeaking: false, 
                interviewPhase: 'listening' 
              }));
              setTimeout(() => {
                if (state.questions.length > 0) {
                  speakQuestion(state.questions[0].text);
                }
              }, 1000);
            }
            URL.revokeObjectURL(audioUrl);
          }
        }
      } else {
        console.error('❌ Welcome TTS server error:', response.status, response.statusText);
        throw new Error(`Welcome TTS server returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Welcome TTS Error:', error);
      setState(prev => ({ 
        ...prev, 
        isAISpeaking: false, 
        interviewPhase: 'listening' 
      }));
      // Still start the interview
      setTimeout(() => {
        if (state.questions.length > 0) {
          speakQuestion(state.questions[0].text);
        }
      }, 1000);
    }
  }, [state.questions, speakQuestion]);

  // Reset silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearInterval(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setState(prev => ({ ...prev, silenceTimer: 0 }));
  }, []);

  // Move to next question
  const moveToNextQuestion = useCallback(async () => {
    resetSilenceTimer();
    setState(prev => ({ ...prev, interviewPhase: 'processing' }));
    
    // Save current response
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (currentQuestion && state.finalTranscription.trim()) {
      try {
        await fetch('/api/interview/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            userResponse: state.finalTranscription,
            transcription: state.finalTranscription
          })
        });
      } catch (error) {
        console.error('Failed to save response:', error);
      }
    }

    // Move to next question or complete interview
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex < state.questions.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        finalTranscription: '',
        currentTranscription: '',
        silenceTimer: 0,
        interviewPhase: 'speaking'
      }));
      
      await speakQuestion(state.questions[nextIndex].text);
    } else {
      // Interview completed
      setState(prev => ({ ...prev, interviewPhase: 'completed' }));
      if (onInterviewComplete) {
        onInterviewComplete();
      }
    }
  }, [state.questions, state.currentQuestionIndex, state.finalTranscription, onInterviewComplete, speakQuestion, resetSilenceTimer]);

  // Start silence timer (10 seconds)
   const startSilenceTimer = useCallback(() => {
     // Don't start timer if already running
     if (silenceTimeoutRef.current) {
       return;
     }
     
     resetSilenceTimer();
     
     let seconds = 0;
     const interval = setInterval(() => {
       seconds++;
       setState(prev => ({ ...prev, silenceTimer: seconds }));
       
       if (seconds >= 10) {
         clearInterval(interval);
         silenceTimeoutRef.current = null;
         moveToNextQuestion();
       }
     }, 1000);
     
     silenceTimeoutRef.current = interval;
   }, [resetSilenceTimer, moveToNextQuestion]);

  // Start audio streaming to STT server
  const startAudioStreaming = useCallback(async () => {
    try {
      console.log('🎤 Starting audio streaming...');
      
      // Check if media stream is available
      if (!mediaStream) {
        console.error('❌ No media stream provided for audio streaming');
        return;
      }
      
      // Get audio tracks from the existing stream
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.error('❌ No audio tracks found in media stream');
        return;
      }
      
      console.log(`✅ Found ${audioTracks.length} audio track(s)`);
      
      // Create a new stream with only audio tracks
      const audioStream = new MediaStream(audioTracks);
      audioStreamRef.current = audioStream;
      
      // Create MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          // Convert audio blob to base64 and send to STT server
          const reader = new FileReader();
          reader.onload = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            websocketRef.current?.send(JSON.stringify({
              type: 'audio',
              data: base64Audio
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      // Start recording with small chunks for real-time processing
      mediaRecorder.start(100); // 100ms chunks
      
      console.log('✅ Audio streaming started');
      
    } catch (error) {
      console.error('❌ Failed to start audio streaming:', error);
    }
  }, [mediaStream]);

  // Stop audio streaming
  const stopAudioStreaming = useCallback(() => {
    console.log('🛑 Stopping audio streaming...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Don't stop the main media stream as it's managed by the parent component
    // Just clear our reference
    audioStreamRef.current = null;
    mediaRecorderRef.current = null;
    console.log('✅ Audio streaming stopped');
  }, []);

  // Start listening for user response
  const startListening = useCallback(() => {
    if (!websocketRef.current) {
      console.log('🔌 Connecting to STT WebSocket server...');
      
      try {
        // Connect to STT WebSocket server
        websocketRef.current = new WebSocket('ws://localhost:8765');
        
        websocketRef.current.onopen = () => {
          console.log('✅ STT WebSocket connected');
          setState(prev => ({ ...prev, interviewPhase: 'listening' }));
          
          // Start audio streaming when WebSocket is connected and media stream is available
          if (mediaStream) {
            startAudioStreaming();
          } else {
            console.warn('⚠️ Media stream not available for audio streaming');
          }
        };
        
        websocketRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📝 STT message received:', data);
            
            if (data.type === 'partial' && data.text) {
              setState(prev => ({ 
                ...prev, 
                currentTranscription: data.text || '',
                isUserSpeaking: true
              }));
              resetSilenceTimer();
            } else if (data.type === 'final' && data.text && data.text.trim()) {
              setState(prev => ({ 
                ...prev, 
                finalTranscription: prev.finalTranscription + ' ' + data.text.trim(),
                currentTranscription: '',
                isUserSpeaking: false
              }));
              // Start silence timer after receiving final result
              startSilenceTimer();
            } else if (data.type === 'partial' && !data.text) {
              // Empty partial result indicates silence - start timer if we have some transcription
              setState(prev => {
                if (prev.finalTranscription.trim() || prev.currentTranscription.trim()) {
                  startSilenceTimer();
                  return { ...prev, isUserSpeaking: false, currentTranscription: '' };
                }
                return prev;
              });
            }
          } catch (error) {
            console.error('❌ Error parsing STT message:', error);
          }
        };

        websocketRef.current.onclose = (event) => {
          console.log('🔌 STT WebSocket disconnected', event.code, event.reason);
          websocketRef.current = null;
          
          // Retry connection after a delay if it wasn't a clean close
          if (event.code !== 1000) {
            console.log('🔄 Retrying STT WebSocket connection in 3 seconds...');
            setTimeout(() => {
              if (!websocketRef.current) {
                startListening();
              }
            }, 3000);
          }
        };

        websocketRef.current.onerror = (error) => {
          console.error('❌ STT WebSocket error:', error);
          console.log('🔍 Checking if STT server is running on ws://localhost:8765');
          
          // Close the connection to trigger retry
          if (websocketRef.current) {
            websocketRef.current.close();
          }
        };
      } catch (error) {
        console.error('❌ Failed to create STT WebSocket connection:', error);
        websocketRef.current = null;
        
        // Retry after delay
        setTimeout(() => {
          if (!websocketRef.current) {
            startListening();
          }
        }, 3000);
      }
    }
  }, [resetSilenceTimer, startSilenceTimer, mediaStream, startAudioStreaming]);

  // Initialize interview
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    
    // Only start interview if we have questions loaded
    if (state.questions.length === 0) {
      // Load questions and start interview
      loadQuestions();
      
      // Play welcome audio after a short delay
      setTimeout(() => {
        playWelcomeAudio();
      }, 2000);
    }

    // Cleanup
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Stop audio streaming
      stopAudioStreaming();
    };
  }, [loadQuestions, playWelcomeAudio, stopAudioStreaming]); // Add proper dependencies

  // Establish WebSocket connection when media stream becomes available
  useEffect(() => {
    if (mediaStream && !websocketRef.current) {
      console.log('🎤 Media stream available, establishing STT WebSocket connection...');
      startListening();
    }
  }, [mediaStream, startListening, state.questions.length]);

  return {
    ...state,
    currentQuestion: state.questions[state.currentQuestionIndex],
    speakQuestion,
    playWelcomeAudio,
    startListening,
    moveToNextQuestion,
    resetSilenceTimer
  };
};