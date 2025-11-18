import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ValidateReferralRequest {
  referralId: string;
}

interface ValidateReferralResponse {
  valid: boolean;
  message: string;
  referrerName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const { referralId }: ValidateReferralRequest = await req.json();

      if (!referralId || referralId.trim() === '') {
        return new Response(
          JSON.stringify({
            valid: false,
            message: 'Referral ID is required',
          } as ValidateReferralResponse),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const { data: referrer, error } = await supabase
        .from('users')
        .select('id, full_name, personal_id, has_purchased_bep, is_verified')
        .eq('personal_id', referralId.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({
            valid: false,
            message: 'Error validating referral ID',
          } as ValidateReferralResponse),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (!referrer) {
        return new Response(
          JSON.stringify({
            valid: false,
            message: 'Invalid referral ID. Please check with the person who invited you.',
          } as ValidateReferralResponse),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (!referrer.has_purchased_bep || !referrer.is_verified) {
        return new Response(
          JSON.stringify({
            valid: false,
            message: 'This referral ID belongs to an unverified user. They must purchase a BEP ticket first.',
          } as ValidateReferralResponse),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          message: 'Valid referral ID',
          referrerName: referrer.full_name || 'User',
        } as ValidateReferralResponse),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: 'An unexpected error occurred',
      } as ValidateReferralResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
