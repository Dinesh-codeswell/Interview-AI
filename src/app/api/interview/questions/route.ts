import { NextRequest, NextResponse } from 'next/server';

// Sample interview questions for testing
const interviewQuestions = [
  {
    id: 1,
    text: "Hello! Welcome to your interview. Let's start with a brief introduction. Can you tell me about yourself, your background, and what brings you here today?",
    type: "introduction",
    expectedDuration: 120 // 2 minutes
  },
  {
    id: 2,
    text: "Thank you for that introduction. Now, I'd like to learn more about your professional background. Can you walk me through your work experience and highlight any key achievements or projects you're particularly proud of?",
    type: "background",
    expectedDuration: 180 // 3 minutes
  },
  {
    id: 3,
    text: "That's impressive! Finally, let's discuss your previous employment. Can you tell me about your most recent role, what your responsibilities were, and what motivated you to seek new opportunities?",
    type: "previous_employment",
    expectedDuration: 150 // 2.5 minutes
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const role = searchParams.get('role');

    // In a real application, you would customize questions based on company and role
    const customizedQuestions = interviewQuestions.map(question => ({
      ...question,
      text: question.text.replace(/your interview/g, `your ${company} ${role} interview`)
    }));

    return NextResponse.json({
      success: true,
      questions: customizedQuestions,
      company,
      role
    });

  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { questionId, userResponse, transcription } = await request.json();

    // Here you would typically:
    // 1. Store the user's response
    // 2. Analyze the response
    // 3. Generate follow-up questions if needed
    // 4. Calculate scores

    console.log('Received response for question:', questionId);
    console.log('User response:', userResponse);
    console.log('Transcription:', transcription);

    return NextResponse.json({
      success: true,
      message: 'Response recorded successfully',
      nextAction: 'continue' // or 'complete' for last question
    });

  } catch (error) {
    console.error('Questions POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    );
  }
}