import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Parse the request body
    const { pdfData, accessCode, ldap, quizId } = await req.json()

    // Validate required fields
    if (!pdfData || !accessCode || !ldap || !quizId) {
      throw new Error('Missing required fields')
    }

    // Initialize Supabase client with admin privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Validate access code
    const { data: accessCodeData, error: accessCodeError } = await supabaseClient
      .from('v2_access_codes')
      .select('*')
      .eq('code', accessCode)
      .eq('is_used', false)
      .single()

    if (accessCodeError || !accessCodeData) {
      throw new Error('Invalid or used access code')
    }

    // Check if access code is expired
    if (accessCodeData.expires_at && new Date(accessCodeData.expires_at) < new Date()) {
      throw new Error('Access code has expired')
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${ldap}-${timestamp}.pdf`

    // Decode base64 PDF data
    const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Upload PDF to storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('quiz-pdfs')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('quiz-pdfs')
      .getPublicUrl(filename)

    // Return success response with PDF URL
    return new Response(
      JSON.stringify({ pdf_url: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
