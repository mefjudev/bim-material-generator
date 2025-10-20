import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧪 Simple test API called');
    
    // Test if we can import OpenAI
    console.log('📦 Testing OpenAI import...');
    const OpenAI = require('openai');
    console.log('✅ OpenAI imported successfully');
    
    // Test if we can create OpenAI instance
    console.log('🔑 Testing OpenAI instance creation...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI instance created');
    
    // Test a simple API call
    console.log('🤖 Testing simple OpenAI call...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });
    
    console.log('✅ OpenAI API call successful');
    return NextResponse.json({ 
      success: true, 
      message: response.choices[0]?.message?.content 
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.constructor.name);
    
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      type: error.constructor.name,
      stack: error.stack
    }, { status: 500 });
  }
}
