import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.json()

    const {
      email,
      password,
      employee_id,
      username,
      first_name,
      last_name,
      role_id,
      home_department_id,
      home_shift_id,
      hire_date,
      birthday,
      probationary,
      trainer_enabled,
    } = body

    if (
      !email ||
      !password ||
      !employee_id ||
      !username ||
      !first_name ||
      !last_name ||
      !role_id ||
      !home_department_id ||
      !home_shift_id
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const authUserId = authData.user.id

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authUserId,
        employee_id,
        username,
        first_name,
        last_name,
        email,
        role_id,
        home_department_id,
        home_shift_id,
        hire_date: hire_date || null,
        birthday: birthday || null,
        probationary: Boolean(probationary),
        trainer_enabled: Boolean(trainer_enabled),
        is_active: true,
        must_change_password: true,
        must_create_pin: true,
        pin_reset_required: false,
      })
      .select()
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ user: profileData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})