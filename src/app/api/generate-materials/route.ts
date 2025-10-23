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
              - Code (format: WD-XX, MT-XX, GL-XX, CT-XX, ST-XX, PT-XX based on material type)
              - Area (e.g., Kitchen, Living Room)
              - Location of finish (e.g., Skirting, Wall, Ceiling, Floor)
              - Finish (Specific name from a high/mid-grade supplier, incorporating material type)
              - Supplier and Contact (Recommended high/mid-grade UK supplier with Company Name, Contact Email, and Phone Number)
              - Estimated price per sqm in pounds (realistic UK market price for high/mid-grade products)
              - Type (General category like Oak, Marble, Tile, Paint, Upholstery)
              
              IMPORTANT: 
              - Focus on identifying *all* visible materials in the image (aim for at least 8-10 distinct items).
              - Ensure codes strictly follow the WD/MT/GL/CT/ST/PT-XX format.
              - Provide realistic UK market pricing estimates for high or mid-grade products.
              - Prioritize high or mid-grade suppliers, NOT low-grade products.
              - Supplier details MUST include Company Name, Contact Email, and Phone Number, combined into a single string.
              
              Return the data as a JSON array of objects with this exact structure:
              [
                {
                  "code": "WD-01",
                  "area": "Kitchen",
                  "location": "Floor",
                  "finish": "Prime Grade European Oak Flooring (Product Code: OAK-FLR-01)",
                  "supplierAndContact": "Junckers UK (sales@junckers.co.uk, 01376 534700)",
                  "pricePerSqm": {
                    "low": 70,
                    "mid": 95,
                    "high": 120
                  },
                  "type": "Oak"
                }
              ]
              
              Identify all visible materials from the image. Provide realistic UK market pricing estimates for high/mid-grade products.`
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
    
    // First, process materials to determine code prefixes and types
    const materialsWithPrefixes = materials.map((material: BIMItem) => {
      // Determine the code prefix based on material finish
      let codePrefix = 'UN'; // Unknown
      const lowerFinish = material.finish.toLowerCase();
      if (lowerFinish.includes('wood') || lowerFinish.includes('oak') || lowerFinish.includes('walnut')) codePrefix = 'WD';
      else if (lowerFinish.includes('metal') || lowerFinish.includes('steel') || lowerFinish.includes('aluminium')) codePrefix = 'MT';
      else if (lowerFinish.includes('glass') || lowerFinish.includes('mirror')) codePrefix = 'GL';
      else if (lowerFinish.includes('tile') || lowerFinish.includes('ceramic') || lowerFinish.includes('porcelain')) codePrefix = 'CT';
      else if (lowerFinish.includes('stone') || lowerFinish.includes('marble') || lowerFinish.includes('granite')) codePrefix = 'ST';
      else if (lowerFinish.includes('paint') || lowerFinish.includes('wallpaper') || lowerFinish.includes('plaster')) codePrefix = 'PT';

      // Attempt to derive type from finish if not already provided by AI
      let materialType = material.type; // Use AI-provided type if available
      if (!materialType) {
        if (lowerFinish.includes('oak') || lowerFinish.includes('wood')) materialType = 'Oak';
        else if (lowerFinish.includes('marble') || lowerFinish.includes('stone')) materialType = 'Marble';
        else if (lowerFinish.includes('tile') || lowerFinish.includes('ceramic') || lowerFinish.includes('porcelain')) materialType = 'Tile';
        else if (lowerFinish.includes('paint') || lowerFinish.includes('plaster')) materialType = 'Paint';
        else if (lowerFinish.includes('velvet') || lowerFinish.includes('upholstery')) materialType = 'Upholstery';
        else if (lowerFinish.includes('glass') || lowerFinish.includes('mirror')) materialType = 'Glass';
        else if (lowerFinish.includes('metal') || lowerFinish.includes('steel')) materialType = 'Metal';
        else materialType = 'Other'; // Default if no clear type is derived
      }

      return {
        ...material,
        codePrefix: codePrefix,
        type: materialType,
        // Ensure pricePerSqm exists and has rounded values
        pricePerSqm: {
          low: Math.round(material.pricePerSqm?.low || 50), // Default to higher prices
          mid: Math.round(material.pricePerSqm?.mid || 80),
          high: Math.round(material.pricePerSqm?.high || 110)
        }
      };
    });

    // Group materials by their derived codePrefix
    const groupedMaterials = materialsWithPrefixes.reduce((acc, material) => {
      (acc[material.codePrefix] = acc[material.codePrefix] || []).push(material);
      return acc;
    }, {} as Record<string, (BIMItem & { codePrefix: string })[]>);

    // Generate contiguous codes within each group and flatten back to an array
    let materialsWithContiguousCodes: (BIMItem & { codePrefix: string })[] = [];
    for (const prefix in groupedMaterials) {
      if (Object.prototype.hasOwnProperty.call(groupedMaterials, prefix)) {
        const group = groupedMaterials[prefix];
        group.forEach((material, idx) => {
          material.code = `${prefix}-${String(idx + 1).padStart(2, '0')}`;
          materialsWithContiguousCodes.push(material);
        });
      }
    }

    // Sort the final list to maintain the order by prefix and then by code number
    materialsWithContiguousCodes.sort((a, b) => {
      if (a.codePrefix < b.codePrefix) return -1;
      if (a.codePrefix > b.codePrefix) return 1;
      
      const getCodeNumber = (code: string) => parseInt(code.split('-')[1], 10);
      return getCodeNumber(a.code) - getCodeNumber(b.code);
    });

    console.log('🔍 Adding real UK suppliers...');
    const suppliersData = [
      { name: 'Junckers UK', email: 'sales@junckers.co.uk', contact: '01376 534700' }, // High-end wood
      { name: 'Porcelanosa', email: 'info@porcelanosa.co.uk', contact: '0333 003 4000' }, // High-end tiles/stone
      { name: 'Farrow & Ball', email: 'info@farrow-ball.com', contact: '01202 876123' }, // High-end paint/wallpaper
      { name: 'VitrA Bathrooms', email: 'sales@vitra.co.uk', contact: '01235 750990' }, // Mid-High end sanitaryware
      { name: 'Amtico', email: 'info@amtico.com', contact: '0116 204 1000' }, // Mid-High end LVT flooring
      { name: 'Topps Tiles', email: 'customer.service@toppstiles.co.uk', contact: '0800 014 2935' }, // Mid-range tiles
      { name: 'Graham & Brown', email: 'info@grahambrown.com', contact: '0808 168 3795' }, // Mid-range wallpaper
      { name: 'Altro', email: 'info@altro.com', contact: '01462 707600' }, // Commercial flooring
      { name: 'Forbo Flooring', email: 'info@forbo.com', contact: '01773 744121' } // Commercial flooring
    ];
    
    const materialsWithSuppliers = materialsWithContiguousCodes.map((material, index) => {
      const assignedSupplier = suppliersData[index % suppliersData.length];
      
      // Construct the combined supplier and contact string
      const supplierAndContactString = 
        `${assignedSupplier.name} (${assignedSupplier.email}, ${assignedSupplier.contact})`;

      return {
        ...material,
        supplierAndContact: supplierAndContactString, // Override with combined string
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
