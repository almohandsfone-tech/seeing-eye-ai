import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, prompt, mode } = await req.json()
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyBjQ-CboEqFC5L1zX5Gskp3XtbIFDM23rA'
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    let systemPrompt = ''
    
    switch (mode) {
      case 'object_detection':
        systemPrompt = 'You are an AI assistant helping blind and visually impaired users. Describe objects in the image clearly, including their positions, distances (estimate), and any potential hazards or helpful information. Be concise but detailed. Respond in both Arabic and English.'
        break
      case 'scene_description':
        systemPrompt = 'You are an AI assistant helping blind and visually impaired users. Provide a comprehensive description of the entire scene like a narrator. Include environment, people, activities, mood, and spatial relationships. Make it vivid and helpful. Respond in both Arabic and English.'
        break
      case 'text_reading':
        systemPrompt = 'You are an AI assistant helping blind and visually impaired users. Read and transcribe ALL visible text in the image. Include signs, labels, documents, screens, or any written content. If the text is in Arabic, provide it in Arabic. If in English, provide it in English. Be accurate and complete.'
        break
      case 'color_advisor':
        systemPrompt = 'You are a fashion and color advisor for blind and visually impaired users. Analyze the clothing and colors in the image. Provide advice on color combinations, style suggestions, and whether the outfit looks good together. Be encouraging and helpful. Respond in both Arabic and English.'
        break
      case 'navigation_helper':
        systemPrompt = 'You are a navigation assistant for blind and visually impaired users. Describe the path ahead, any obstacles, safe walking areas, landmarks, and directional guidance. Focus on safety and clear directions. Respond in both Arabic and English.'
        break
      default:
        systemPrompt = 'You are an AI assistant helping blind and visually impaired users. Analyze the image and provide helpful, clear descriptions. Respond in both Arabic and English.'
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `${systemPrompt}\n\nUser request: ${prompt || 'Describe what you see'}`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image.split(',')[1] // Remove data:image/jpeg;base64, prefix
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error('No response generated from Gemini')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        description: generatedText,
        mode: mode 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ai-vision function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})