"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Mic, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  RefreshCw
} from "lucide-react";

interface PermissionScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: () => void;
  company: string;
  role: string;
}

export default function PermissionScreen({ 
  isOpen, 
  onClose, 
  onPermissionsGranted, 
  company, 
  role 
}: PermissionScreenProps) {
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isRequesting, setIsRequesting] = useState(false);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
    }
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
    }
  };

  const requestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      // Request camera permission
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      cameraStream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
      
      // Request microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      micStream.getTracks().forEach(track => track.stop()); // Stop the stream after checking
      
    } catch (error) {
      console.error('Permission denied:', error);
      setCameraPermission('denied');
      setMicPermission('denied');
    }
    
    setIsRequesting(false);
  };

  const retryPermissions = () => {
    setCameraPermission('pending');
    setMicPermission('pending');
    requestPermissions();
  };

  const canProceed = cameraPermission === 'granted' && micPermission === 'granted';

  const handleProceed = () => {
    if (canProceed) {
      onPermissionsGranted();
    }
  };

  const getPermissionIcon = (status: 'pending' | 'granted' | 'denied') => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPermissionText = (status: 'pending' | 'granted' | 'denied') => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Pending';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[70vw] h-[70vh] max-w-4xl max-h-[600px] bg-white rounded-lg shadow-xl overflow-hidden">
        <Card className="h-full border-0 rounded-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Camera & Microphone Setup</CardTitle>
                <CardDescription className="text-blue-100">
                  {company} - {role} Interview
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Required
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 h-full flex flex-col">
            <div className="flex-1">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  We need access to your camera and microphone
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  To conduct your interview, we need permission to access your camera and microphone. 
                  This ensures a smooth interview experience.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Camera Permission */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Camera Access</h4>
                      <p className="text-sm text-gray-600">Required for video interview</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPermissionIcon(cameraPermission)}
                    <span className="text-sm font-medium">
                      {getPermissionText(cameraPermission)}
                    </span>
                    {cameraPermission === 'pending' && (
                      <Button size="sm" onClick={requestCameraPermission}>
                        Allow Camera
                      </Button>
                    )}
                  </div>
                </div>

                {/* Microphone Permission */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mic className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Microphone Access</h4>
                      <p className="text-sm text-gray-600">Required for audio communication</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPermissionIcon(micPermission)}
                    <span className="text-sm font-medium">
                      {getPermissionText(micPermission)}
                    </span>
                    {micPermission === 'pending' && (
                      <Button size="sm" onClick={requestMicPermission}>
                        Allow Microphone
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission denied help */}
              {(cameraPermission === 'denied' || micPermission === 'denied') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Permission Denied</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Please check your browser settings and allow camera/microphone access for this site. 
                        You may need to click the camera/microphone icon in your browser&apos;s address bar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              <div className="flex space-x-3">
                {(cameraPermission === 'denied' || micPermission === 'denied') && (
                  <Button variant="outline" onClick={retryPermissions} disabled={isRequesting}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRequesting ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                )}
                
                {cameraPermission === 'pending' && micPermission === 'pending' && (
                  <Button onClick={requestPermissions} disabled={isRequesting}>
                    {isRequesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      'Allow Access'
                    )}
                  </Button>
                )}
                
                {canProceed && (
                  <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Start Interview
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}