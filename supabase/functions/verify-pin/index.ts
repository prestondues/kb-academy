import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: corsHeaders,
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.json()
    const profileId = String(body.profileId ?? '')
    const pin = String(body.pin ?? '')

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'Missing profileId' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    if (!/^\d{6}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: 'PIN must be exactly 6 digits' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('pin_hash, pin')
      .eq('id', profileId)
      .maybeSingle()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ valid: false }),
        {
          status: 200,
          headers: corsHeaders,
        }
      )
    }

    const submittedHash = await sha256Hex(pin)
    const storedHash = data.pin_hash ?? null
    const legacyRawPin = data.pin ?? null

    const valid =
      (storedHash && submittedHash === storedHash) ||
      (legacyRawPin && pin === legacyRawPin)

    return new Response(
      JSON.stringify({ valid }),
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})