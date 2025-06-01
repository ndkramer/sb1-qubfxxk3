import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.1";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    switch(req.method){
      case 'GET':
        {
          const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) throw new Error(listError.message);
          console.log(`[GET] Returned ${users.users.length} users`);
          return new Response(JSON.stringify({
            users: users.users
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      case 'POST':
        {
          const { email, fullName } = await req.json();
          if (!email || !fullName) throw new Error('Email and full name are required');
          console.log(`[POST] Creating user: ${email}, send_email: true`);
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            password: crypto.randomUUID(),
            options: {
              data: {
                full_name: fullName
              },
              send_email: true
            }
          });
          if (createError) {
            console.error(`[POST] Failed to create user: ${createError.message}`);
            throw new Error(createError.message);
          }
          console.log(`[POST] User created: ${newUser.user?.id}`);
          return new Response(JSON.stringify({
            user: newUser
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      case 'DELETE':
        {
          const { userId } = await req.json();
          if (!userId) throw new Error('User ID is required');
          console.log(`[DELETE] Deleting user: ${userId}`);
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (deleteError) {
            console.error(`[DELETE] Failed to delete user: ${deleteError.message}`);
            throw new Error(deleteError.message);
          }
          console.log(`[DELETE] User deleted: ${userId}`);
          return new Response(JSON.stringify({
            message: 'User deleted successfully'
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      default:
        return new Response(JSON.stringify({
          error: 'Method not allowed'
        }), {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
    }
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

