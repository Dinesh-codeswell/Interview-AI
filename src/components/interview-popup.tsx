"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  X,
  Clock,
  MapPin,
  Briefcase,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Building2,
  TrendingUp
} from "lucide-react";
import PermissionScreen from "@/components/permission-screen";
import InterviewInterface from "@/components/interview-interface";

interface InterviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: () => void;
  company: string;
  role: string;
  duration: string;
  type: string;
  difficulty: string;
  logo?: string;
}

export default function InterviewPopup({
  isOpen,
  onClose,
  onStartInterview,
  company,
  role,
  duration,
  type,
  difficulty,
  logo
}: InterviewPopupProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [showInterviewInterface, setShowInterviewInterface] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setIsResumeUploaded(true);
    }
  };

  const handleStartInterview = () => {
    onClose(); // Close the popup first
    setShowPermissionScreen(true);
  };

  const handlePermissionsGranted = () => {
    setShowPermissionScreen(false);
    setShowInterviewInterface(true);
    onClose(); // Close the popup when starting interview
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden bg-white border-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100 duration-150">
          <div className="overflow-y-auto max-h-[85vh] scrollbar-hide">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-50 rounded-xl flex items-center justify-center shadow-md border border-gray-100/50 overflow-hidden">
                    {logo ? (
                      <img 
                        src={logo} 
                        alt={`${company} logo`}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${logo ? 'hidden' : 'flex'}`}>
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {company}
                    </DialogTitle>
                    <div className="text-base font-semibold text-gray-700">{role}</div>
                    <DialogDescription className="text-gray-600 flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3" />
                      Prepare for your interview with confidence
                    </DialogDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-5 space-y-5">
              {/* Interview Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Duration</h3>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{duration}</p>
                  <p className="text-xs text-gray-600">Estimated time</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Target className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Type</h3>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{type}</p>
                  <p className="text-xs text-gray-600">Interview format</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                       <TrendingUp className="w-3 h-3 text-white" />
                     </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Difficulty</h3>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">{difficulty}</p>
                  <p className="text-xs text-gray-600">Challenge level</p>
                </div>
              </div>

              {/* Guidelines Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Interview Guidelines</h3>
                    <p className="text-gray-600 text-xs">Please review these important points</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-gray-700 text-xs font-medium">Quiet, well-lit environment</span>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-gray-700 text-xs font-medium">Stable internet & working camera/mic</span>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-gray-700 text-xs font-medium">Professional demeanor & eye contact</span>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-gray-700 text-xs font-medium">Clear, concise answers</span>
                  </div>
                </div>
                
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-red-700 text-xs font-medium">No external help or resources allowed</span>
                  </div>
                </div>
              </div>

              {/* Resume Upload Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Upload Resume</h3>
                    <p className="text-gray-600 text-xs">Help us tailor questions to your experience</p>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label 
                    htmlFor="resume-upload" 
                    className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                      isResumeUploaded 
                        ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {isResumeUploaded ? (
                      <div className="space-y-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-700 text-sm">Resume uploaded successfully!</p>
                          <p className="text-xs text-gray-600 mt-1">{resumeFile?.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 text-sm">Click to upload your resume</p>
                          <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX (Max 5MB)</p>
                        </div>
                      </div>
                    )}
                  </label>
                  
                  {isResumeUploaded && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-2 h-2 text-white" />
                        </div>
                        <p className="text-green-700 text-xs font-medium">Your resume will be analyzed to create personalized interview questions</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="px-4 py-2 border-2 hover:bg-gray-50 transition-all duration-200 rounded-lg text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartInterview}
                  disabled={!isResumeUploaded}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                    isResumeUploaded 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isResumeUploaded ? 'Start Interview' : 'Upload Resume First'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    
    {/* Permission Screen */}
    {showPermissionScreen && (
      <PermissionScreen
        isOpen={showPermissionScreen}
        onClose={() => setShowPermissionScreen(false)}
        onPermissionsGranted={handlePermissionsGranted}
        company={company}
        role={role}
      />
    )}
    
    {/* Interview Interface */}
    {showInterviewInterface && (
      <InterviewInterface
        isOpen={showInterviewInterface}
        onClose={() => setShowInterviewInterface(false)}
        company={company}
        role={role}
      />
    )}
    </>
  );
}