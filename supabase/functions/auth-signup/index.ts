import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error. Please contact support.' }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let email: string;
    let password: string;
    let phoneNumber: string | undefined;

    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
      phoneNumber = body.phoneNumber;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request format.' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long.' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const signupData: any = {
      email,
      password,
      email_confirm: true,
      user_metadata: {},
    };

    if (phoneNumber && phoneNumber.trim()) {
      signupData.user_metadata.phone_number = phoneNumber;
    }

    console.log('Creating user with email:', email);

    const { data, error } = await supabaseAdmin.auth.admin.createUser(signupData);

    if (error) {
      console.error('Signup error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Signup failed. Please try again.' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data.user) {
      console.error('User creation succeeded but no user data returned');
      return new Response(
        JSON.stringify({ error: 'User creation failed. Please try again.' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (phoneNumber && phoneNumber.trim()) {
      try {
        console.log('Saving phone number for user:', data.user.id);
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            phone_number: phoneNumber,
          });

        if (profileError) {
          console.error('Error saving phone number:', profileError);
        }
      } catch (profileException) {
        console.error('Profile creation exception:', profileException);
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error('Unexpected exception in auth-signup:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Signup failed. Please check your internet connection and try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
