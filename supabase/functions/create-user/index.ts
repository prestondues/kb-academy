import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
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

    const firstName = String(body.first_name ?? '').trim()
    const lastName = String(body.last_name ?? '').trim()
    const username = String(body.username ?? '').trim()
    const employeeId =
      body.employee_id !== undefined &&
      body.employee_id !== null &&
      String(body.employee_id).trim() !== ''
        ? String(body.employee_id).trim()
        : null
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const roleId =
      body.role_id !== undefined &&
      body.role_id !== null &&
      String(body.role_id).trim() !== ''
        ? String(body.role_id).trim()
        : null
    const probationary = Boolean(body.probationary)
    const trainerEnabled = Boolean(body.trainer_enabled)

    if (!firstName || !lastName || !username || !email || !password) {
      return new Response(
        JSON.stringify({
          error:
            'Missing required fields: first_name, last_name, username, email, password',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const { data: existingUsername, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      return new Response(
        JSON.stringify({ error: usernameError.message }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    if (existingUsername) {
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      })

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({
          error: authError?.message ?? 'Failed to create auth user',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const userId = authData.user.id

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username,
      employee_id: employeeId,
      email,
      role_id: roleId,
      probationary,
      trainer_enabled: trainerEnabled,
      is_active: true,
      must_change_password: true,
      must_create_pin: true,
      pin_reset_required: false,
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)

      return new Response(
        JSON.stringify({ error: profileError.message }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          username,
        },
      }),
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