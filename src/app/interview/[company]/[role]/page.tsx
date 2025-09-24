"use client";

import React from 'react';
import LiveInterviewInterface from '@/components/live-interview-interface';

interface InterviewPageProps {
  params: Promise<{
    company: string;
    role: string;
  }>;
}

export default function InterviewPage({ params }: InterviewPageProps) {
  // Use React.use() to unwrap the Promise for client components
  const resolvedParams = React.use(params);
  
  // Decode URL parameters
  const company = decodeURIComponent(resolvedParams.company);
  const role = decodeURIComponent(resolvedParams.role);

  return (
    <div className="min-h-screen w-full">
      <LiveInterviewInterface
        company={company}
        role={role}
      />
    </div>
  );
}