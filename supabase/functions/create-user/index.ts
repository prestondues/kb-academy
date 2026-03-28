import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function buildInternalAuthEmail(username: string) {
  const cleaned = username.trim().toLowerCase().replace(/\s+/g, '.')
  return `${cleaned}@kbacademy.local`
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
    const contactEmail =
      body.email !== undefined &&
      body.email !== null &&
      String(body.email).trim() !== ''
        ? String(body.email).trim().toLowerCase()
        : null
    const password = String(body.password ?? '')
    const roleId =
      body.role_id !== undefined &&
      body.role_id !== null &&
      String(body.role_id).trim() !== ''
        ? String(body.role_id).trim()
        : null
    const departmentId =
      body.department_id !== undefined &&
      body.department_id !== null &&
      String(body.department_id).trim() !== ''
        ? String(body.department_id).trim()
        : null
    const shiftId =
      body.shift_id !== undefined &&
      body.shift_id !== null &&
      String(body.shift_id).trim() !== ''
        ? String(body.shift_id).trim()
        : null
    const probationary = Boolean(body.probationary)
    const trainerEnabled = Boolean(body.trainer_enabled)

    if (!firstName) {
      return new Response(JSON.stringify({ error: 'First name is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!lastName) {
      return new Response(JSON.stringify({ error: 'Last name is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!password) {
      return new Response(JSON.stringify({ error: 'Temporary password is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!roleId) {
      return new Response(JSON.stringify({ error: 'Role is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!departmentId) {
      return new Response(JSON.stringify({ error: 'Department is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!shiftId) {
      return new Response(JSON.stringify({ error: 'Shift is required.' }), {
        status: 400,
        headers: corsHeaders,
      })
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
        JSON.stringify({ error: 'Username already exists.' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const authEmail = buildInternalAuthEmail(username)

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: authEmail,
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
          error: authError?.message ?? 'Failed to create auth user.',
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
      email: contactEmail,
      role_id: roleId,
      department_id: departmentId,
      shift_id: shiftId,
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
          username,
          auth_email: authEmail,
          contact_email: contactEmail,
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
        error: error instanceof Error ? error.message : 'Unexpected error.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})