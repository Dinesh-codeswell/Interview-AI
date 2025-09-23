"use client";

import React from 'react';
import LiveInterviewInterface from '@/components/live-interview-interface';
import { useRouter } from 'next/navigation';

interface InterviewPageProps {
  params: Promise<{
    company: string;
    role: string;
  }>;
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const router = useRouter();
  
  // Use React.use() to unwrap the Promise for client components
  const resolvedParams = React.use(params);
  
  // Decode URL parameters
  const company = decodeURIComponent(resolvedParams.company);
  const role = decodeURIComponent(resolvedParams.role);

  const handleEndInterview = () => {
    // Navigate back to homepage after interview ends
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full">
      <LiveInterviewInterface
        company={company}
        role={role}
        onEndInterview={handleEndInterview}
      />
    </div>
  );
}