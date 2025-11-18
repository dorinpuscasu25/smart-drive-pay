const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ValidateReferralResponse {
  valid: boolean;
  message: string;
  referrerName?: string;
}

export async function validateReferralId(referralId: string): Promise<ValidateReferralResponse> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/validate-referral`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralId }),
      }
    );

    if (!response.ok) {
      return {
        valid: false,
        message: 'Error validating referral ID',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Referral validation error:', error);
    return {
      valid: false,
      message: 'Network error. Please try again.',
    };
  }
}
