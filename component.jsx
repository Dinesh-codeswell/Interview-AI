import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, Clock, Video, Users, BookOpen, BarChart3, Settings, LogOut, Mic, MicOff, Camera, CameraOff, MessageSquare, FileText, CheckCircle, AlertCircle, TrendingUp, Star, Timer, Play, Pause, RotateCcw, Send, Plus, Edit3, Trash2, Eye, Download, Upload, Filter, Search, Bell, Award, Target, Brain, Zap, Globe, Shield, Building2, GraduationCap, Briefcase, UserCheck, ClipboardCheck, PieChart, BarChart, Activity, Map, Coffee, BookMarked, Lightbulb, Headphones, Volume2, VolumeX, Maximize2, Minimize2, MoreHorizontal, Bot, Cpu, ScanFace, AlertTriangle, Shield as ShieldIcon, Webcam, Volume1, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const AIInterviewPro = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedTenant, setSelectedTenant] = useState('iit-bombay');
  const [isRecording, setIsRecording] = useState(false);
  const [interviewTimer, setInterviewTimer] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [whiteboard, setWhiteboard] = useState({ drawings: [], currentTool: 'pen' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewFeedback, setInterviewFeedback] = useState({});
  
  // AI Interview Pro specific states
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [language, setLanguage] = useState('english');
  const [consentGiven, setConsentGiven] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState('');
  const [proctoring, setProctoring] = useState({
    faceDetected: true,
    multiplefaces: false,
    gazeTracking: true,
    audioAnomalies: false,
    score: 95
  });
  const [interviewPhase, setInterviewPhase] = useState('setup'); // setup, active, completed
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  // Multi-tenant configuration
  const tenants = {
    'iit-bombay': { name: 'IIT Bombay', logo: '🏛️', color: '#3B82F6', domain: 'iitb.ac.in', type: 'college' },
    'iit-delhi': { name: 'IIT Delhi', logo: '🎓', color: '#EF4444', domain: 'iitd.ac.in', type: 'college' },
    'nit-trichy': { name: 'NIT Trichy', logo: '⚙️', color: '#10B981', domain: 'nitt.edu', type: 'college' },
    'tech-corp': { name: 'TechCorp Inc', logo: '🏢', color: '#8B5CF6', domain: 'techcorp.com', type: 'company' }
  };

  // Target companies database
  const companies = [
    { id: 1, name: 'Google', domain: 'Software Engineering', culture: 'Innovation, Data-driven decisions', stack: 'Go, Python, Java, Kubernetes' },
    { id: 2, name: 'Microsoft', domain: 'Product Management', culture: 'Growth mindset, Collaboration', stack: 'Azure, .NET, React, TypeScript' },
    { id: 3, name: 'Amazon', domain: 'Data Science', culture: 'Customer obsession, Ownership', stack: 'AWS, Python, R, Scala' },
    { id: 4, name: 'Meta', domain: 'Frontend Engineering', culture: 'Move fast, Be bold', stack: 'React, GraphQL, Hack, PyTorch' },
    { id: 5, name: 'Goldman Sachs', domain: 'Quantitative Analysis', culture: 'Excellence, Client service', stack: 'Java, C++, Python, KDB+' }
  ];

  // Role competency matrix
  const roleCompetencies = {
    'Software Engineer': {
      core: ['Data Structures', 'Algorithms', 'System Design', 'OOP'],
      technical: ['Coding', 'Debugging', 'Testing', 'Code Review'],
      behavioral: ['Problem Solving', 'Communication', 'Teamwork']
    },
    'Data Scientist': {
      core: ['Statistics', 'Machine Learning', 'Data Analysis', 'SQL'],
      technical: ['Python/R', 'Visualization', 'A/B Testing', 'Model Building'],
      behavioral: ['Business Acumen', 'Storytelling', 'Critical Thinking']
    },
    'Product Manager': {
      core: ['Product Strategy', 'Market Analysis', 'User Research', 'Roadmapping'],
      technical: ['Analytics', 'Technical Architecture', 'API Understanding'],
      behavioral: ['Leadership', 'Stakeholder Management', 'Decision Making']
    }
  };

  const users = {
    student: { id: 1, name: 'Rahul Sharma', email: 'rahul@iitb.ac.in', role: 'student', college: 'iit-bombay', branch: 'Computer Science', semester: 6, avatar: '👨‍🎓' },
    admin: { id: 3, name: 'Prof. Amit Kumar', email: 'amit@iitb.ac.in', role: 'admin', college: 'iit-bombay', department: 'T&P Office', avatar: '👨‍💼' },
    super: { id: 4, name: 'System Admin', email: 'admin@aiinterviewpro.com', role: 'super_admin', avatar: '⚡' }
  };

  const interviewTypes = {
    hr: { name: 'HR/Behavioral', duration: 30, icon: '🗣️', description: 'STAR method, culture fit, values assessment', aiPersona: 'HR Director' },
    technical: { name: 'Technical (Verbal)', duration: 45, icon: '💻', description: 'DSA logic, system design, CS fundamentals', aiPersona: 'Senior Engineer' },
    case: { name: 'Case/Analytics', duration: 30, icon: '📊', description: 'Guesstimates, product sense, analytical thinking', aiPersona: 'Business Analyst' }
  };

  // AI-Generated Dynamic Question Banks
  const baseQuestionBanks = {
    hr: {
      opener: [
        "I see you're interested in {company}. What specifically draws you to our mission and values?",
        "Tell me about a project from your resume that you're most proud of. What was your role?",
        "Looking at your background in {domain}, why are you interested in this {role} position?"
      ],
      behavioral: [
        "Describe a time when you had to work under tight deadlines. How did you prioritize and deliver?",
        "Tell me about a conflict you had with a team member. How did you resolve it?",
        "Give me an example of when you took ownership of a problem that wasn't originally yours.",
        "Describe a situation where you had to learn something completely new quickly."
      ],
      values: [
        "How do you handle failure or setbacks in your work?",
        "Describe your ideal work environment and team dynamics.",
        "What motivates you to do your best work?"
      ]
    },
    technical: {
      fundamentals: [
        "Explain how you would approach solving {specific_project} from your resume. What algorithms would you consider?",
        "I see you've worked with {technology}. Can you explain the trade-offs compared to alternatives?",
        "Walk me through your thought process for designing a system that handles {scale} users."
      ],
      problem_solving: [
        "How would you debug a system where {specific_issue}? Take me through your approach step by step.",
        "Explain the time and space complexity of your solution for {project_name}. How could you optimize it?",
        "Design a caching strategy for {use_case}. What factors would you consider?"
      ],
      deep_dive: [
        "I noticed you mentioned {achievement} in your resume. Can you elaborate on the technical challenges?",
        "How did you measure the success of {project}? What metrics did you track?",
        "If you had to scale {project} to 10x the current load, what would you change?"
      ]
    },
    case: {
      estimation: [
        "Estimate the number of {product} users in {geography}. Walk me through your reasoning.",
        "How would you size the market opportunity for {company}'s new {product} feature?",
        "Calculate the potential revenue impact of improving {metric} by 10%."
      ],
      product: [
        "You're launching a new product similar to {existing_product}. What's your go-to-market strategy?",
        "How would you prioritize features for {product_type} given limited engineering resources?",
        "Design metrics to measure success for {business_scenario}."
      ],
      business: [
        "A competitor just launched {feature}. How should {company} respond?",
        "Revenue dropped 15% last quarter. How would you investigate and address this?",
        "How would you convince stakeholders to invest in {risky_initiative}?"
      ]
    }
  };

  // AI Personas for different interview types
  const aiPersonas = {
    'HR Director': {
      name: 'Sarah Chen',
      avatar: '👩‍💼',
      style: 'warm, empathetic, focuses on cultural fit and behavioral examples',
      intro: "Hi! I'm Sarah, HR Director at {company}. I'm excited to learn more about you and your experiences."
    },
    'Senior Engineer': {
      name: 'Alex Kumar',
      avatar: '👨‍💻',
      style: 'analytical, detail-oriented, focuses on technical depth and problem-solving',
      intro: "Hello! I'm Alex, a Senior Engineer here. I'll be asking about your technical experience and approach to problem-solving."
    },
    'Business Analyst': {
      name: 'Maya Patel',
      avatar: '👩‍📊',
      style: 'data-driven, strategic, focuses on business impact and analytical thinking',
      intro: "Hi there! I'm Maya, a Business Analyst. I'm interested in hearing about your analytical approach and business acumen."
    }
  };

  // AI Interview Engine Functions
  const generatePersonalizedQuestions = (company, role, resumeData) => {
    const questions = [];
    const selectedBank = baseQuestionBanks[currentView.includes('hr') ? 'hr' : 
                                         currentView.includes('technical') ? 'technical' : 'case'];
    
    Object.values(selectedBank).forEach(category => {
      category.forEach(template => {
        let question = template
          .replace('{company}', company || 'the company')
          .replace('{role}', role || 'this position')
          .replace('{domain}', role || 'your field')
          .replace('{technology}', resumeData?.skills?.[0] || 'your technology stack')
          .replace('{project}', resumeData?.projects?.[0]?.name || 'your project')
          .replace('{achievement}', resumeData?.achievements?.[0] || 'your accomplishment');
        questions.push(question);
      });
    });
    return questions.slice(0, 8); // Limit to 8 personalized questions
  };

  const simulateAIResponse = (userResponse) => {
    const followUps = [
      "That's interesting. Can you elaborate on the specific challenges you faced?",
      "How did you measure the success of that approach?",
      "What would you do differently if you encountered a similar situation again?",
      "Can you walk me through your thought process step by step?",
      "What trade-offs did you consider when making that decision?",
      "How did you ensure stakeholder alignment throughout the process?"
    ];
    return followUps[Math.floor(Math.random() * followUps.length)];
  };

  const calculateCompetencyScores = (responses) => {
    // Mock scoring based on response analysis
    return {
      communication: Math.floor(Math.random() * 30) + 70,
      technical: Math.floor(Math.random() * 25) + 75,
      problemSolving: Math.floor(Math.random() * 20) + 80,
      cultural: Math.floor(Math.random() * 15) + 85,
      overall: Math.floor(Math.random() * 20) + 80
    };
  };

  // Timer management
  useEffect(() => {
    if (isInterviewActive) {
      timerRef.current = setInterval(() => {
        setInterviewTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isInterviewActive]);

  // Proctoring simulation
  useEffect(() => {
    if (isInterviewActive) {
      const interval = setInterval(() => {
        setProctoring(prev => ({
          ...prev,
          faceDetected: Math.random() > 0.1, // 90% face detection
          gazeTracking: Math.random() > 0.15, // 85% appropriate gaze
          score: Math.max(70, prev.score + (Math.random() - 0.5) * 5)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isInterviewActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Authentication
  const login = (userType) => {
    setCurrentUser(users[userType]);
    setCurrentView(userType === 'student' ? 'student-dashboard' : 
                   userType === 'admin' ? 'admin-dashboard' : 'super-dashboard');
  };

  const startInterviewSetup = (type) => {
    setCurrentView('interview-setup');
    setInterviewPhase('setup');
  };

  const startAIInterview = () => {
    if (targetCompany && targetRole && resumeUploaded && consentGiven) {
      const questions = generatePersonalizedQuestions(targetCompany, targetRole, resumeData);
      setAiQuestions(questions);
      setCurrentView('ai-interview-live');
      setInterviewPhase('active');
      setIsInterviewActive(true);
      setIsRecording(true);
      setInterviewTimer(0);
      setCurrentQuestion(0);
      
      // Simulate AI greeting
      const persona = aiPersonas[interviewTypes['hr'].aiPersona];
      setTimeout(() => {
        setAiSpeaking(true);
        setAiResponse(persona.intro.replace('{company}', targetCompany));
        setTimeout(() => {
          setAiSpeaking(false);
          setAiResponse(aiQuestions[0] || "Let's start with telling me about yourself and your interest in this role.");
        }, 3000);
      }, 1000);
    }
  };

  const handleCandidateResponse = (response) => {
    if (!response.trim()) return;
    
    setCandidateResponse(response);
    setAiSpeaking(true);
    
    // Simulate AI processing and follow-up
    setTimeout(() => {
      const followUp = simulateAIResponse(response);
      setAiResponse(followUp);
      
      setTimeout(() => {
        setAiSpeaking(false);
        // Move to next question after follow-up
        setTimeout(() => {
          if (currentQuestion < aiQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setAiSpeaking(true);
            setTimeout(() => {
              setAiResponse(aiQuestions[currentQuestion + 1]);
              setAiSpeaking(false);
            }, 2000);
          } else {
            // Interview completion
            setAiResponse("Thank you for your responses. Let me provide you with some final thoughts before we conclude.");
            setTimeout(() => {
              completeInterview();
            }, 4000);
          }
        }, 5000);
      }, 3000);
    }, 2000);
  };

  const completeInterview = () => {
    setIsInterviewActive(false);
    setIsRecording(false);
    setInterviewPhase('completed');
    setCurrentView('interview-results');
    
    // Generate final scores
    const scores = calculateCompetencyScores([]);
    setInterviewFeedback(scores);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    // Reset all interview states
    setTargetCompany('');
    setTargetRole('');
    setResumeUploaded(false);
    setConsentGiven(false);
    setInterviewPhase('setup');
  };

  // Whiteboard functionality
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setWhiteboard(prev => ({
      ...prev,
      isDrawing: true,
      lastPoint: { x, y }
    }));
  };

  const draw = (e) => {
    if (!whiteboard.isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(whiteboard.lastPoint.x, whiteboard.lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setWhiteboard(prev => ({
      ...prev,
      lastPoint: { x, y }
    }));
  };

  const stopDrawing = () => {
    setWhiteboard(prev => ({ ...prev, isDrawing: false }));
  };

  const clearWhiteboard = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Component: Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Interview Suite</h1>
          <p className="text-xl text-gray-600 mb-8">Prepare for success with AI-powered mock interviews</p>
          
          <div className="flex justify-center mb-8">
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {Object.entries(tenants).map(([key, tenant]) => (
                <option key={key} value={key}>{tenant.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { type: 'student', title: 'Student', icon: GraduationCap, desc: 'Practice interviews, get feedback' },
            { type: 'mentor', title: 'Mentor', icon: UserCheck, desc: 'Conduct interviews, provide guidance' },
            { type: 'admin', title: 'T&P Admin', icon: Building2, desc: 'Manage batches, view analytics' },
            { type: 'super', title: 'Super Admin', icon: Shield, desc: 'System administration' }
          ].map(({ type, title, icon: Icon, desc }) => (
            <div
              key={type}
              onClick={() => login(type)}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Component: Student Dashboard
  const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [bookingStep, setBookingStep] = useState(1);
    
    const prepPlan = [
      { module: 'Resume Review', progress: 100, status: 'completed' },
      { module: 'Technical Fundamentals', progress: 75, status: 'in-progress' },
      { module: 'Behavioral Questions', progress: 50, status: 'in-progress' },
      { module: 'System Design Basics', progress: 25, status: 'pending' },
      { module: 'Case Study Practice', progress: 0, status: 'pending' }
    ];

    const upcomingInterviews = [
      { id: 1, type: 'technical', date: '2024-01-15', time: '10:00 AM', mentor: 'Dr. Priya Singh', status: 'confirmed' },
      { id: 2, type: 'hr', date: '2024-01-17', time: '2:00 PM', mentor: 'Ms. Anjali Rao', status: 'pending' }
    ];

    const pastInterviews = [
      { id: 3, type: 'hr', date: '2024-01-10', score: 85, feedback: 'Great storytelling using STAR method' },
      { id: 4, type: 'technical', date: '2024-01-08', score: 78, feedback: 'Good problem-solving approach, work on optimization' }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="text-2xl mr-4">{tenants[selectedTenant].logo}</div>
                <h1 className="text-xl font-semibold text-gray-900">Mock Interview Suite</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentUser.avatar}</span>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { key: 'book', label: 'Book Interview', icon: Calendar },
                { key: 'practice', label: 'Practice', icon: BookOpen },
                { key: 'reports', label: 'Reports', icon: FileText }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">78%</p>
                      <p className="text-sm text-gray-600">Interview Readiness</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-sm text-gray-600">Interviews Completed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">+15%</p>
                      <p className="text-sm text-gray-600">Score Improvement</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Personal Prep Plan</h3>
                  <div className="space-y-4">
                    {prepPlan.map((module, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{module.module}</span>
                            <span className="text-sm text-gray-600">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                module.status === 'completed' ? 'bg-green-500' : 
                                module.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          {module.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : module.status === 'in-progress' ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Interviews</h3>
                  <div className="space-y-3">
                    {upcomingInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{interviewTypes[interview.type].icon}</div>
                          <div>
                            <p className="font-medium">{interviewTypes[interview.type].name}</p>
                            <p className="text-sm text-gray-600">{interview.date} at {interview.time}</p>
                            <p className="text-xs text-gray-500">with {interview.mentor}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCurrentView('live-interview')}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
                <div className="space-y-3">
                  {pastInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{interviewTypes[interview.type].icon}</div>
                        <div>
                          <p className="font-medium">{interviewTypes[interview.type].name}</p>
                          <p className="text-sm text-gray-600">{interview.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{interview.score}%</p>
                        <p className="text-xs text-gray-500">{interview.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'book' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-6">Book Mock Interview</h3>
              
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Select Interview Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(interviewTypes).map(([key, type]) => (
                      <div
                        key={key}
                        onClick={() => {
                          setSelectedInterview({ type: key, ...type });
                          setBookingStep(2);
                        }}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{type.icon}</span>
                          <h5 className="font-medium">{type.name}</h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                        <p className="text-xs text-gray-500">Duration: {type.duration} minutes</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookingStep === 2 && selectedInterview && (
                <div className="space-y-6">
                  <button 
                    onClick={() => setBookingStep(1)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Back to interview types
                  </button>
                  
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium text-blue-900">Selected: {selectedInterview.name}</h4>
                    <p className="text-sm text-blue-700">{selectedInterview.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Date</label>
                      <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Time</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>2:00 PM</option>
                        <option>3:00 PM</option>
                        <option>4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mentor Preference (Optional)</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Any available mentor</option>
                      <option>Dr. Priya Singh - System Design Expert</option>
                      <option>Ms. Anjali Rao - HR Specialist</option>
                      <option>Mr. Rohit Gupta - Technical Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-md px-3 py-2" 
                      rows="3"
                      placeholder="Any specific areas you'd like to focus on..."
                    />
                  </div>

                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Book Interview
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component: Live Interview Interface
  const LiveInterview = () => {
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [notes, setNotes] = useState('');
    const [interviewType] = useState('technical');
    
    const questions = questionBanks[interviewType];

    useEffect(() => {
      setIsInterviewActive(true);
      return () => setIsInterviewActive(false);
    }, []);

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex h-screen">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">Technical Interview</h2>
                <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm">LIVE</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Timer className="w-5 h-5" />
                <span className="text-lg font-mono">{formatTime(interviewTimer)}</span>
              </div>
            </div>

            <div className="flex-1 relative">
              {/* Video Feed Simulation */}
              <div className="h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                    👨‍🎓
                  </div>
                  <p className="text-lg">{currentUser.name}</p>
                  <p className="text-sm text-gray-400">Student</p>
                </div>
              </div>

              {/* Mentor Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">
                    👩‍🏫
                  </div>
                  <p className="text-sm">Dr. Priya Singh</p>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4 bg-gray-800 px-6 py-3 rounded-full">
                  <button
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-700' : 'bg-red-600'}`}
                  >
                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700' : 'bg-red-600'}`}
                  >
                    {isVideoOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-full ${isRecording ? 'bg-red-600' : 'bg-gray-700'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-current" />
                  </button>
                  <button
                    onClick={() => setCurrentView('student-dashboard')}
                    className="bg-red-600 px-6 py-3 rounded-full hover:bg-red-700"
                  >
                    End Interview
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96 bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold mb-2">Current Question</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <p className="text-white">{questions[currentQuestionIndex]}</p>
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  className="bg-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-500"
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold mb-2">Whiteboard</h3>
              <div className="bg-white rounded-lg">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={200}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={clearWhiteboard}
                  className="bg-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-500"
                >
                  Clear
                </button>
                <button className="bg-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-500">
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 bg-gray-700 p-3 rounded-lg resize-none text-white placeholder-gray-400"
                placeholder="Take notes during the interview..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component: Mentor Dashboard
  const MentorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedInterview, setSelectedInterview] = useState(null);
    
    const upcomingSessions = [
      { id: 1, student: 'Rahul Sharma', type: 'technical', time: '10:00 AM', date: 'Today' },
      { id: 2, student: 'Priya Patel', type: 'hr', time: '2:00 PM', date: 'Today' },
      { id: 3, student: 'Amit Kumar', type: 'case', time: '11:00 AM', date: 'Tomorrow' }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="text-2xl mr-4">{tenants[selectedTenant].logo}</div>
                <h1 className="text-xl font-semibold text-gray-900">Mentor Console</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentUser.avatar}</span>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { key: 'sessions', label: 'Sessions', icon: Calendar },
                { key: 'questions', label: 'Question Bank', icon: BookOpen },
                { key: 'feedback', label: 'Feedback', icon: MessageSquare }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-sm text-gray-600">Sessions Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">45</p>
                      <p className="text-sm text-gray-600">Students This Week</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">32h</p>
                      <p className="text-sm text-gray-600">Hours This Month</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{interviewTypes[session.type].icon}</div>
                        <div>
                          <p className="font-medium">{session.student}</p>
                          <p className="text-sm text-gray-600">{interviewTypes[session.type].name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{session.time}</p>
                        <button 
                          onClick={() => setCurrentView('mentor-interview')}
                          className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700 mt-1"
                        >
                          Start Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Question Bank Management</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(questionBanks).map(([type, questions]) => (
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <span className="text-2xl">{interviewTypes[type].icon}</span>
                      <span>{interviewTypes[type].name}</span>
                      <span className="text-sm text-gray-500">({questions.length} questions)</span>
                    </h4>
                    <div className="space-y-2">
                      {questions.slice(0, 3).map((question, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <p className="text-sm flex-1">{question}</p>
                          <div className="flex items-center space-x-2 ml-4">
                            <button className="p-1 text-gray-500 hover:text-blue-600">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {questions.length > 3 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          +{questions.length - 3} more questions
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component: Mentor Interview Console
  const MentorInterview = () => {
    const [currentScore, setCurrentScore] = useState({ technical: 0, communication: 0, problem_solving: 0 });
    const [feedback, setFeedback] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [interviewType] = useState('technical');
    
    const questions = questionBanks[interviewType];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Interview Console</h2>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                In Progress
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Timer className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(interviewTimer)}</span>
              <button
                onClick={() => setCurrentView('mentor-dashboard')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-screen">
          {/* Video Area */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Student: Rahul Sharma</h3>
                <p className="text-sm text-gray-600">Technical Interview - Computer Science</p>
              </div>
              
              <div className="flex-1 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl">
                    👨‍🎓
                  </div>
                  <p className="text-xl font-semibold">Rahul Sharma</p>
                  <p className="text-gray-600">Computer Science, Semester 6</p>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-96 bg-white border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-4">Question Panel</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm">{questions[currentQuestionIndex]}</p>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Ask Question
                </button>
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold mb-4">Live Scoring</h3>
              <div className="space-y-4">
                {Object.entries(currentScore).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium capitalize">{category.replace('_', ' ')}</label>
                      <span className="text-sm text-gray-600">{score}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={score}
                      onChange={(e) => setCurrentScore(prev => ({ ...prev, [category]: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 flex-1">
              <h3 className="font-semibold mb-4">Live Notes</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 border border-gray-300 rounded-md p-3 resize-none"
                placeholder="Add feedback and observations..."
              />
              <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mt-3">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component: Admin Dashboard
  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    
    const cohorts = [
      { id: 1, name: 'CSE 2024 Batch', students: 120, readiness: 78, interviews: 450 },
      { id: 2, name: 'ECE 2024 Batch', students: 85, readiness: 72, interviews: 320 },
      { id: 3, name: 'Mechanical 2024 Batch', students: 95, readiness: 65, interviews: 280 }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="text-2xl mr-4">{tenants[selectedTenant].logo}</div>
                <h1 className="text-xl font-semibold text-gray-900">T&P Admin Console</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{currentUser.avatar}</span>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { key: 'cohorts', label: 'Cohorts', icon: Users },
                { key: 'scheduling', label: 'Scheduling', icon: Calendar },
                { key: 'analytics', label: 'Analytics', icon: PieChart },
                { key: 'settings', label: 'Settings', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">300</p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">1,250</p>
                      <p className="text-sm text-gray-600">Interviews Completed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">72%</p>
                      <p className="text-sm text-gray-600">Avg Readiness</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <UserCheck className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">25</p>
                      <p className="text-sm text-gray-600">Active Mentors</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Cohort Overview</h3>
                  <div className="space-y-4">
                    {cohorts.map((cohort) => (
                      <div key={cohort.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{cohort.name}</h4>
                          <p className="text-sm text-gray-600">{cohort.students} students</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${cohort.readiness}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{cohort.readiness}%</span>
                          </div>
                          <p className="text-xs text-gray-500">{cohort.interviews} interviews</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Bulk scheduling completed</p>
                        <p className="text-xs text-gray-600">50 interviews scheduled for CSE batch</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">New mentor onboarded</p>
                        <p className="text-xs text-gray-600">Dr. Rajesh Kumar joined as Technical Expert</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Low readiness alert</p>
                        <p className="text-xs text-gray-600">15 students below 60% readiness threshold</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cohorts' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Cohort Management</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Cohort</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Cohort Name</th>
                        <th className="text-left py-3 px-4">Students</th>
                        <th className="text-left py-3 px-4">Readiness</th>
                        <th className="text-left py-3 px-4">Interviews</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map((cohort) => (
                        <tr key={cohort.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{cohort.name}</td>
                          <td className="py-3 px-4">{cohort.students}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${cohort.readiness}%` }}
                                />
                              </div>
                              <span className="text-sm">{cohort.readiness}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{cohort.interviews}</td>
                          <td className="py-3 px-4">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-500 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-500 hover:text-yellow-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-500 hover:text-green-600">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Login Page
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">🤖 AI Interview Pro</h1>
            <p className="text-lg text-gray-600">AI-powered interviews tailored to your target company & role</p>
            <div className="mt-4 flex justify-center items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Bot className="w-4 h-4" />
                <span>AI Interviewer</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Webcam className="w-4 h-4" />
                <span>Live Proctoring</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-600">
                <BarChart3 className="w-4 h-4" />
                <span>Smart Analytics</span>
              </div>
            </div>
          </div>

          {/* Tenant Selection */}
          <div className="max-w-md mx-auto mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Organization</label>
            <select 
              value={selectedTenant} 
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(tenants).map(([key, tenant]) => (
                <option key={key} value={key}>
                  {tenant.logo} {tenant.name} ({tenant.type === 'college' ? 'College' : 'Corporate'}) - {tenant.domain}
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => login('student')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-l-4 border-blue-500"
            >
              <div className="text-4xl mb-4">👨‍🎓</div>
              <div className="text-xl font-semibold text-gray-800">Candidate</div>
              <div className="text-sm text-gray-600 mt-2">Take AI interviews, get personalized feedback</div>
              <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-blue-600">
                <Bot className="w-3 h-3" />
                <span>AI-Powered</span>
              </div>
            </button>
            
            <button 
              onClick={() => login('admin')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-l-4 border-orange-500"
            >
              <div className="text-4xl mb-4">👨‍💼</div>
              <div className="text-xl font-semibold text-gray-800">T&P Admin</div>
              <div className="text-sm text-gray-600 mt-2">Manage cohorts, track readiness scores</div>
              <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-orange-600">
                <BarChart3 className="w-3 h-3" />
                <span>Analytics Dashboard</span>
              </div>
            </button>
            
            <button 
              onClick={() => login('super')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-l-4 border-purple-500"
            >
              <div className="text-4xl mb-4">⚡</div>
              <div className="text-xl font-semibold text-gray-800">Super Admin</div>
              <div className="text-sm text-gray-600 mt-2">Platform management, AI model configs</div>
              <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-purple-600">
                <Settings className="w-3 h-3" />
                <span>System Control</span>
              </div>
            </button>
          </div>
          
          {/* Features Showcase */}
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-xl font-semibold text-center text-gray-700 mb-6">Powered by Advanced AI Technology</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-800">Adaptive AI Engine</h4>
                <p className="text-sm text-gray-600 mt-1">Questions tailored to your resume and target company</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ScanFace className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-800">Live Proctoring</h4>
                <p className="text-sm text-gray-600 mt-1">Real-time monitoring for authentic assessment</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-800">Smart Analytics</h4>
                <p className="text-sm text-gray-600 mt-1">Detailed performance insights and improvement plans</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview Setup Page  
  if (currentView === 'interview-setup') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Bot className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">AI Interview Setup</h1>
              </div>
              <button onClick={() => setCurrentView('student-dashboard')} className="text-gray-500 hover:text-gray-700">
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Personalize Your AI Interview</h2>
              <p className="text-gray-600">Provide details to get the most relevant and challenging interview experience</p>
            </div>

            <div className="space-y-6">
              {/* Target Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Company *</label>
                <div className="flex space-x-4">
                  <select 
                    value={targetCompany} 
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a company...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.name}>{company.name}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Or type company name..."
                    value={companies.find(c => c.name === targetCompany) ? '' : targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Role/Domain *</label>
                <select 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select role...</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                </select>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume Upload *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {!resumeUploaded ? (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600">
                        <button 
                          onClick={() => {
                            setResumeUploaded(true);
                            setResumeData({
                              education: 'B.Tech Computer Science, IIT Bombay',
                              experience: '2 internships',
                              projects: [{name: 'E-commerce Platform', tech: 'React, Node.js'}],
                              skills: ['JavaScript', 'Python', 'React', 'Node.js'],
                              achievements: ['Dean\'s List', 'Hackathon Winner']
                            });
                          }}
                          className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                          Click to upload
                        </button>
                        <span> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-green-600 font-medium">Resume uploaded successfully</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Language</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="english" 
                      checked={language === 'english'} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mr-2" 
                    />
                    <span>English</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="hindi-english" 
                      checked={language === 'hindi-english'} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mr-2" 
                    />
                    <span>Hindi + English (Mixed)</span>
                  </label>
                </div>
              </div>

              {/* Privacy Consent */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">Privacy & Consent</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <input 
                      type="checkbox" 
                      checked={consentGiven} 
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1" 
                    />
                    <div>
                      <p>I consent to:</p>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Audio/video recording of the interview session</li>
                        <li>• Live proctoring and monitoring during the interview</li>
                        <li>• Processing of my resume and responses for evaluation</li>
                        <li>• Data storage for performance analytics and improvement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Interview Button */}
              <div className="text-center pt-4">
                <button 
                  onClick={startAIInterview}
                  disabled={!targetCompany || !targetRole || !resumeUploaded || !consentGiven}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Start AI Interview
                </button>
                {(!targetCompany || !targetRole || !resumeUploaded || !consentGiven) && (
                  <p className="text-sm text-gray-500 mt-2">Please complete all required fields to start</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  if (currentView === 'student-dashboard') {
    const completedInterviews = [
      { id: 3, type: 'technical', company: 'Google', aiInterviewer: 'Alex Kumar', overallScore: 85, date: '2024-03-10' },
      { id: 4, type: 'hr', company: 'Microsoft', aiInterviewer: 'Sarah Chen', overallScore: 78, date: '2024-03-08' },
      { id: 5, type: 'case', company: 'Amazon', aiInterviewer: 'Maya Patel', overallScore: 82, date: '2024-03-05' }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Bot className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI Interview Dashboard</h1>
                  <p className="text-sm text-gray-500">{tenants[selectedTenant].name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{currentUser.name}</span>
                </div>
                <button onClick={logout} className="text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}! 👋</h2>
                    <p className="opacity-90">Your AI-powered interview coach is ready to help you excel!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">92</div>
                    <div className="text-sm opacity-90">Readiness Score</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Start AI Interview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New AI Interview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(interviewTypes).map(([key, type]) => (
                    <button 
                      key={key}
                      onClick={() => startInterviewSetup(key)}
                      className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">{type.icon}</div>
                        <Bot className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="font-medium text-gray-900">{type.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{type.duration} mins • AI: {type.aiPersona}</div>
                      <div className="text-xs text-gray-500 mt-2">{type.description}</div>
                      <div className="mt-3 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        → Powered by {type.aiPersona}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Interview History */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">AI Interview History</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Detailed Analytics</button>
                </div>
                <div className="space-y-4">
                  {completedInterviews.map(interview => (
                    <div key={interview.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{interviewTypes[interview.type].icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{interview.company} - {interviewTypes[interview.type].name}</div>
                          <div className="text-sm text-gray-600">AI Interviewer: {interview.aiInterviewer} • {interview.date}</div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Proctoring Clean</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <Video className="w-3 h-3" />
                              <span>Recorded Session Available</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{interview.overallScore}</div>
                          <div className="text-xs text-gray-500">Overall Score</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          interview.overallScore >= 80 ? 'bg-green-500' : interview.overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Card with AI Readiness */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">{currentUser.avatar}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentUser.name}</h3>
                  <p className="text-sm text-gray-600">{currentUser.branch} • Semester {currentUser.semester}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Interview Ready</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-1">92/100</div>
                    <div className="text-xs text-green-700">AI Readiness Score</div>
                  </div>
                </div>
              </div>

              {/* AI Performance Analytics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance Insights</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">AI Interviews</span>
                    </div>
                    <span className="font-semibold text-gray-900">{completedInterviews.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Average Score</span>
                    </div>
                    <span className="font-semibold text-gray-900">82%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ScanFace className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Proctoring Score</span>
                    </div>
                    <span className="font-semibold text-gray-900">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Companies Targeted</span>
                    </div>
                    <span className="font-semibold text-gray-900">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Interview Live Session
  if (currentView === 'ai-interview-live') {
    const currentPersona = aiPersonas[interviewTypes.hr.aiPersona]; // Dynamic based on type
    
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-400" />
                <span className="text-white font-medium">AI Interview - {targetCompany}</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live Recording</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatTime(interviewTimer)}</span>
              </div>
              <button 
                onClick={completeInterview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-screen">
          {/* Left Panel - AI Interviewer */}
          <div className="w-1/3 bg-gray-800 p-6">
            <div className="bg-gray-700 rounded-lg p-6 mb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-4xl">{currentPersona.avatar}</div>
                <div>
                  <h3 className="text-white font-medium">{currentPersona.name}</h3>
                  <p className="text-gray-400 text-sm">{interviewTypes.hr.aiPersona}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  aiSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                }`}></div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-600 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">AI is saying:</h4>
                  <div className="min-h-[100px] max-h-[200px] overflow-y-auto">
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {aiResponse || "Preparing your interview..."}
                    </p>
                  </div>
                  {aiSpeaking && (
                    <div className="flex items-center space-x-2 mt-3 text-green-400">
                      <Volume1 className="w-4 h-4 animate-pulse" />
                      <span className="text-xs">AI is speaking...</span>
                    </div>
                  )}
                </div>
                
                {candidateResponse && (
                  <div className="bg-blue-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Your last response:</h4>
                    <p className="text-blue-100 text-sm">{candidateResponse}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="text-white font-medium mb-2">Interview Progress:</h4>
                <div className="flex items-center space-x-2">
                  {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full ${
                      i <= currentQuestion ? 'bg-blue-500' : 'bg-gray-600'
                    }`}></div>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Question {currentQuestion + 1} of 6 • {Math.round((currentQuestion + 1) / 6 * 100)}% Complete
                </p>
              </div>
            </div>
            
            {/* Proctoring Status */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Live Proctoring</h4>
                <div className="flex items-center space-x-1">
                  <ScanFace className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{proctoring.score}%</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Face Detection</span>
                  <div className={`flex items-center space-x-1 ${
                    proctoring.faceDetected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {proctoring.faceDetected ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{proctoring.faceDetected ? 'Clear' : 'Warning'}</span>
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

          {/* Center Panel - Candidate Video & Interaction */}
          <div className="flex-1 bg-gray-900 relative">
            <div className="absolute inset-4">
              <div className="bg-gray-800 rounded-lg h-full flex flex-col relative">
                {/* Video Feed Area */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="text-center">
                    <Webcam className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your Camera Feed</p>
                    <p className="text-gray-500 text-sm mt-1">Ensure good lighting and stable connection</p>
                  </div>
                  
                  {/* Recording Indicator */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm">REC</span>
                  </div>
                  
                  {/* AI Speaking Indicator */}
                  {aiSpeaking && (
                    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-600 px-3 py-1 rounded-full">
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
                      <textarea 
                        className="w-full h-24 p-3 bg-gray-600 text-white rounded-lg text-sm resize-none border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Type your response here or use voice input..."
                        value={candidateResponse}
                        onChange={(e) => setCandidateResponse(e.target.value)}
                        disabled={aiSpeaking}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button 
                          className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
                          disabled={aiSpeaking}
                        >
                          <Mic className="w-4 h-4" />
                          <span className="text-sm">Voice Input</span>
                        </button>
                        <button 
                          className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                          disabled={aiSpeaking}
                          onClick={() => {
                            setAiResponse("Take your time. Let me know when you're ready to continue.");
                          }}
                        >
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Need Time</span>
                        </button>
                      </div>
                      
                      <button 
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
                      </button>
                    </div>
                    
                    {/* Quick Response Options */}
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-xs">Quick responses:</span>
                      <button 
                        onClick={() => setCandidateResponse("Could you please repeat the question?")}
                        className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500"
                        disabled={aiSpeaking}
                      >
                        Repeat Question
                      </button>
                      <button 
                        onClick={() => setCandidateResponse("I need a moment to think about this.")}
                        className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500"
                        disabled={aiSpeaking}
                      >
                        Thinking
                      </button>
                      <button 
                        onClick={() => setCandidateResponse("Can you provide more context about this question?")}
                        className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500"
                        disabled={aiSpeaking}
                      >
                        Need Clarification
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-4 bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                    <button className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                      <Camera className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Tools & Information */}
          <div className="w-1/3 bg-gray-800 p-6">
            <div className="space-y-6">
              {/* Current Question Context */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
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
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Whiteboard</span>
                </h4>
                <div className="bg-white rounded-lg h-48 p-2 relative">
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    width={300}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <button 
                      onClick={() => {
                        const canvas = canvasRef.current;
                        if (canvas) {
                          const ctx = canvas.getContext('2d');
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                      }}
                      className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                    >
                      Clear
                    </button>
                    <button className="px-2 py-1 bg-blue-200 rounded text-xs hover:bg-blue-300">
                      Save
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Private Notes */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Private Notes</span>
                </h4>
                <textarea 
                  className="w-full h-32 p-3 bg-gray-600 text-white rounded-lg text-sm resize-none border border-gray-500 focus:border-blue-500"
                  placeholder="Take notes during the interview... (Only visible to you)"
                />
              </div>
              
              {/* Interview Tips */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
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
                <h4 className="text-white font-medium mb-3">Session Controls</h4>
                <div className="space-y-2">
                  <button 
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
                  </button>
                  <button 
                    onClick={() => {
                      setAiResponse('Take your time. I\'m here when you\'re ready to continue with the next part.');
                    }}
                    className="w-full p-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-500"
                  >
                    <Pause className="w-4 h-4 inline mr-1" />
                    Request Break
                  </button>
                  <button 
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview Results & Analytics
  if (currentView === 'interview-results') {
    const scores = {
      overall: 82,
      communication: 85,
      technical: 78,
      problemSolving: 88,
      cultural: 79
    };
    
    const improvementAreas = [
      { area: 'System Design', current: 72, target: 85, actions: ['Practice distributed systems', 'Study scalability patterns'] },
      { area: 'Communication', current: 85, target: 90, actions: ['Work on clarity', 'Practice explaining complex topics'] },
      { area: 'Problem Solving', current: 88, target: 92, actions: ['Focus on edge cases', 'Improve time complexity analysis'] }
    ];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Interview Results & Analytics</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentView('student-dashboard')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to Dashboard
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-medium">Interview Completed Successfully!</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{targetCompany} - {targetRole}</h2>
                <div className="flex items-center space-x-6 text-sm opacity-90">
                  <span>Duration: {formatTime(interviewTimer)}</span>
                  <span>AI Interviewer: {currentPersona.name}</span>
                  <span>Proctoring Score: {proctoring.score}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">{scores.overall}</div>
                <div className="text-lg">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Competency Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, score]) => (
                    <div key={key} className="">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            score >= 85 ? 'bg-green-500' : score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {score >= 85 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Interviewer Feedback</h3>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-800">Strengths</h4>
                    <p className="text-gray-700 text-sm mt-1">
                      Excellent problem-solving approach with clear articulation of thought process. 
                      Strong understanding of fundamental concepts and good communication skills.
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-yellow-800">Areas for Improvement</h4>
                    <p className="text-gray-700 text-sm mt-1">
                      Could benefit from deeper system design knowledge and more structured approach 
                      to complex problems. Consider practicing time complexity analysis.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-800">Key Highlights</h4>
                    <ul className="text-gray-700 text-sm mt-1 list-disc list-inside space-y-1">
                      <li>Provided concrete examples from past projects</li>
                      <li>Asked thoughtful clarifying questions</li>
                      <li>Maintained professional demeanor throughout</li>
                      <li>Demonstrated genuine interest in the company</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Proctoring Report */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ScanFace className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Proctoring Report</h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600">{proctoring.score}%</div>
                  <div className="text-sm text-gray-600">Integrity Score</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Face Detection</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Excellent</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Gaze Tracking</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Good</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Audio Quality</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Clear</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Environment</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Appropriate</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">
                    No integrity concerns detected. Session was conducted in a professional environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Bot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Interview Pro</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default AIInterviewPro;