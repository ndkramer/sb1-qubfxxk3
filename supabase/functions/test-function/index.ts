import { corsHeaders } from '../_shared/cors.ts';

interface reqPayload {
  name?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    let name = 'World';

    // If this is a POST request, try to get the name from the body
    if (req.method === 'POST') {
      const payload: reqPayload = await req.json();
      if (payload.name) {
        name = payload.name;
      }
    }

    // Return the response with CORS headers
    return new Response(
      JSON.stringify({
        message: `Hello ${name}!`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});