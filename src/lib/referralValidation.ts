import { api } from './api';

interface ValidateReferralResponse {
  valid: boolean;
  message: string;
  referrerName?: string;
}

export async function validateReferralId(referralId: string): Promise<ValidateReferralResponse> {
  try {
    const numericReferralId = Number.parseInt(referralId.trim(), 10);

    if (!Number.isInteger(numericReferralId) || numericReferralId <= 0) {
      return {
        valid: false,
        message: 'ID-ul de invitație trebuie să fie numeric.',
      };
    }

    const response = await api.public.post<{
      ok: boolean;
      inviter?: {
        id: number;
        name: string;
      };
    }>('/auth/register/check-referrer', {
      referral_id: numericReferralId,
    });

    if (!response?.ok || !response?.inviter) {
      return {
        valid: false,
        message: 'Nu am găsit utilizatorul care te-a invitat.',
      };
    }

    return {
      valid: true,
      message: 'ID valid.',
      referrerName: response.inviter.name,
    };
  } catch {
    return {
      valid: false,
      message: 'Nu am putut valida ID-ul de invitație.',
    };
  }
}
