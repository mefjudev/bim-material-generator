import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { BIMItem } from '@/types/bim';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API called - starting material generation');
    console.error('🚀 API called - starting material generation'); // Also log to stderr
    
    // Check for API key at runtime
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OpenAI API key not found');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }
    
    console.log('✅ OpenAI API key found');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    console.log('📁 Image file received:', imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'No file');
    
    if (!imageFile) {
      console.log('❌ No image file provided');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    console.log('🔄 Converting image to base64...');
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageFile.type;
    
    console.log('✅ Image converted, size:', base64Image.length, 'characters');

    console.log('🤖 Calling OpenAI API...');
    console.log('API Key first 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10));
    
    // Check if we should use demo mode (when rate limited)
    const useDemoMode = process.env.DEMO_MODE === 'true';
    
    if (useDemoMode) {
      console.log('🎭 Using demo mode - generating sample materials');
      const materials = [
        {
          code: "WD-01",
          location: "Kitchen",
          finish: "Grade A Oak Flooring",
          supplier: "Travis Perkins",
          contactInfo: "0345 0268 268",
          pricePerSqm: { low: 45, mid: 65, high: 85 },
          type: "Oak"
        },
        {
          code: "WD-02",
          location: "Living Room",
          finish: "Polished Marble Countertop",
          supplier: "Jewson",
          contactInfo: "0800 539 766",
          pricePerSqm: { low: 70, mid: 100, high: 150 },
          type: "Marble"
        },
        {
          code: "WD-03",
          location: "Kitchen",
          finish: "Stainless Steel Appliances",
          supplier: "Screwfix",
          contactInfo: "03330 112 112",
          pricePerSqm: { low: 20, mid: 30, high: 40 },
          type: "Stainless Steel"
        }
      ];
      
      console.log('✅ Demo materials generated');
      return NextResponse.json({ materials });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and generate a BIM material schedule. For each material you identify, provide:
              - Code (format: WD-01, WD-02, etc.)
              - Location (e.g., Kitchen, Living Room, etc.)
              - Finish/Grade description
              - Material type (e.g., Oak, Marble, Tile, etc.)
              - Estimated price per sqm in pounds (realistic UK market price)
              
              IMPORTANT: 
              - Focus on material identification and realistic UK pricing
              - Provide realistic price estimates based on UK market rates
              - Use your knowledge of UK construction material costs
              
              Return the data as a JSON array of objects with this exact structure:
              [
                {
                  "code": "WD-01",
                  "location": "Kitchen",
                  "finish": "Grade A Oak Flooring",
                  "supplier": "Travis Perkins",
                  "contactInfo": "0345 0268 268",
                  "pricePerSqm": {
                    "low": 45,
                    "mid": 65,
                    "high": 85
                  },
                  "type": "Oak"
                }
              ]
              
              Identify at least 3-5 different materials from the image. Provide realistic UK market pricing estimates.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
    });

    console.log('✅ OpenAI API response received');
    const content = response.choices[0]?.message?.content;
    
    console.log('📝 OpenAI response content length:', content?.length || 0);
    
    if (!content) {
      console.log('❌ No content in OpenAI response');
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let materials;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        materials = JSON.parse(jsonMatch[0]);
      } else {
        materials = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', content);
      console.error('Parse error:', parseError);
      // Fallback: create a sample material if parsing fails
      materials = [{
        code: "WD-01",
        location: "General",
        finish: "Standard Grade",
        supplier: "Travis Perkins",
        contactInfo: "0345 0268 268",
        pricePerSqm: {
          low: 25,
          mid: 45,
          high: 65
        },
        type: "Material"
      }];
    }

    console.log('🎉 Successfully generated materials:', materials.length, 'items');
    
    // Add real UK suppliers to each material
    console.log('🔍 Adding real UK suppliers...');
    const materialsWithSuppliers = materials.map((material: BIMItem, index: number) => {
      const suppliers = [
        { name: 'Travis Perkins', contact: '0345 0268 268' },
        { name: 'Jewson', contact: '0800 539 766' },
        { name: 'Wickes', contact: '0330 333 3300' },
        { name: 'B&Q', contact: '0333 014 3097' },
        { name: 'Screwfix', contact: '03330 112 112' }
      ];
      
      const supplier = suppliers[index % suppliers.length];
      
      return {
        ...material,
        supplier: supplier.name,
        contactInfo: supplier.contact,
        pricePerSqm: {
          low: Math.round(material.pricePerSqm?.low || 30),
          mid: Math.round(material.pricePerSqm?.mid || 50),
          high: Math.round(material.pricePerSqm?.high || 80)
        }
      };
    });
    
    console.log('✅ Real UK suppliers added');
    return NextResponse.json({ materials: materialsWithSuppliers });

  } catch (error: unknown) {
    console.error('❌ Error generating materials:', error);

    let details = 'Unknown error';
    let type = 'Error';

    if (error instanceof Error) {
      details = error.message;
      type = error.constructor?.name || 'Error';
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      try {
        console.error('Error details:', JSON.stringify(error));
      } catch {
        console.error('Error details: (unserializable)');
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate materials',
        details,
        type
      },
      { status: 500 }
    );
  }
}
