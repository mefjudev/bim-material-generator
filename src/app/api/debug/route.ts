import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Debug endpoint called');
  console.log('Environment variables:');
  console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  console.log('- OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
  console.log('- OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-') || false);
  
  return NextResponse.json({
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    apiKeyStartsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
    timestamp: new Date().toISOString()
  });
}
