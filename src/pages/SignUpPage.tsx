import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateReferralId } from '../lib/referralValidation';
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/api/errors';
import { AuthPayload } from '../lib/types/auth';

type RegistrationStep = 'details' | 'verify-email' | 'phone' | 'password';
type Gender = 'male' | 'female';

// Țările de reședință (T&C 3.1, 4.1) – aceeași listă ca în aplicația mobilă.
const COUNTRY_OPTIONS = [
  { code: 'MD', label: 'Moldova' },
  { code: 'RO', label: 'România' },
  { code: 'UA', label: 'Ucraina' },
  { code: 'IT', label: 'Italia' },
  { code: 'DE', label: 'Germania' },
  { code: 'FR', label: 'Franța' },
  { code: 'GB', label: 'Marea Britanie' },
];

const LEGAL = {
  terms: '/legal/termeni-si-conditii',
  privacy: '/legal/politica-de-confidentialitate',
  raffle: '/legal/regulamentul-tombolei',
};

// Acordurile cerute la înregistrare (T&C 2.2, Politica de Confidențialitate 5).
const CONSENTS: { key: string; required: boolean; label: React.ReactNode }[] = [
  {
    key: 'terms',
    required: true,
    label: (
      <>
        Am citit și accept{' '}
        <a href={LEGAL.terms} target="_blank" rel="noreferrer" className="text-blue-600 underline">Termenii și Condițiile</a>{' '}
        și{' '}
        <a href={LEGAL.raffle} target="_blank" rel="noreferrer" className="text-blue-600 underline">Regulamentul Tombolei</a>
      </>
    ),
  },
  {
    key: 'privacy',
    required: true,
    label: (
      <>
        Sunt de acord cu prelucrarea datelor conform{' '}
        <a href={LEGAL.privacy} target="_blank" rel="noreferrer" className="text-blue-600 underline">Politicii de Confidențialitate</a>
      </>
    ),
  },
  { key: 'age_18', required: true, label: 'Confirm că am împlinit 18 ani' },
  { key: 'geolocation', required: false, label: 'Permit folosirea locației pentru a găsi service-uri apropiate (opțional)' },
  { key: 'personalized_ads', required: false, label: 'Accept reclame personalizate de la partenerii Smart Driver (opțional)' },
  { key: 'marketing', required: false, label: 'Vreau să primesc noutăți și oferte (opțional)' },
];

export function SignUpPage() {
  const navigate = useNavigate();
  const { localLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    referralId: '',
    emailCode: '',
    phone: '',
    gender: 'male' as Gender,
    countryCode: 'MD',
  });
  const [consents, setConsents] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CONSENTS.map((consent) => [consent.key, false]))
  );
  const missingRequiredConsents = CONSENTS.some((consent) => consent.required && !consents[consent.key]);
  const [registrationId, setRegistrationId] = useState('');
  const [step, setStep] = useState<RegistrationStep>('details');

  const [referralStatus, setReferralStatus] = useState<{
    checking: boolean;
    valid: boolean | null;
    message: string;
    referrerName?: string;
  }>({
    checking: false,
    valid: null,
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isReferralReady = useMemo(
    () => referralStatus.valid === true,
    [referralStatus.valid]
  );

  const handleReferralIdChange = async (value: string) => {
    setFormData((current) => ({ ...current, referralId: value }));
    setReferralStatus({ checking: false, valid: null, message: '' });
    setError('');

    if (value.trim().length >= 1) {
      setReferralStatus({ checking: true, valid: null, message: '' });
      const result = await validateReferralId(value);
      setReferralStatus({
        checking: false,
        valid: result.valid,
        message: result.message,
        referrerName: result.referrerName,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (step === 'details') {
        if (!isReferralReady) {
          throw new Error('Introdu un ID de invitație valid înainte de a continua.');
        }

        const response = await api.public.post<{ registration_id: string }>(
          '/auth/register/start',
          {
            referral_id: Number.parseInt(formData.referralId.trim(), 10),
            full_name: formData.fullName.trim(),
            gender: formData.gender,
            country_code: formData.countryCode,
            email: formData.email.trim(),
          }
        );

        setRegistrationId(response.registration_id);
        setStep('verify-email');
        setSuccessMessage('Am trimis codul de confirmare pe email.');
      } else if (step === 'verify-email') {
        await api.public.post('/auth/register/confirm-email', {
          registration_id: registrationId,
          code: formData.emailCode.trim(),
        });

        setStep('phone');
        setSuccessMessage('Emailul a fost confirmat.');
      } else if (step === 'phone') {
        await api.public.post('/auth/register/set-phone', {
          registration_id: registrationId,
          phone: formData.phone.trim(),
        });

        setStep('password');
        setSuccessMessage('Numărul de telefon a fost salvat.');
      } else {
        if (formData.password.length < 8) {
          throw new Error('Parola trebuie să aibă minimum 8 caractere.');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Parolele nu coincid.');
        }

        if (missingRequiredConsents) {
          throw new Error('Pentru a crea contul trebuie să accepți documentele obligatorii și să confirmi vârsta de 18 ani.');
        }

        const response = await api.public.post<AuthPayload>('/auth/register/finish', {
          registration_id: registrationId,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          device_name: 'web',
          consents,
        });

        await localLogin(response.token, response.user);
        navigate('/buy', { replace: true });
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Nu am reușit să finalizăm înregistrarea.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = (() => {
    if (isSubmitting) {
      return step === 'details'
        ? 'Se trimite...'
        : step === 'verify-email'
          ? 'Se verifică...'
          : step === 'phone'
            ? 'Se salvează...'
            : 'Se creează contul...';
    }

    return step === 'details'
      ? 'Continuă'
      : step === 'verify-email'
        ? 'Confirmă emailul'
        : step === 'phone'
          ? 'Salvează telefonul'
          : 'Creează contul';
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600">
              {step === 'details' && 'Creează contul Smart Driver pentru web și mobil'}
              {step === 'verify-email' && 'Confirmă codul primit pe email'}
              {step === 'phone' && 'Adaugă numărul de telefon'}
              {step === 'password' && 'Alege parola contului tău'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 'details' && (
              <>
                <div>
                  <label htmlFor="referralId" className="block text-sm font-medium text-slate-700 mb-2">
                    ID invitație <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="referralId"
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.referralId}
                    onChange={(e) => handleReferralIdChange(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Introdu ID-ul utilizatorului care te-a invitat"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  {referralStatus.checking && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Se validează ID-ul de invitație...</span>
                    </div>
                  )}
                  {referralStatus.valid === true && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Invitație validă. Invitator: {referralStatus.referrerName}</span>
                    </div>
                  )}
                  {referralStatus.valid === false && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span>{referralStatus.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Nume complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData((current) => ({ ...current, fullName: e.target.value }))}
                    placeholder="Introdu numele complet"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-2">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData((current) => ({ ...current, gender: e.target.value as Gender }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  >
                    <option value="male">Masculin</option>
                    <option value="female">Feminin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="countryCode" className="block text-sm font-medium text-slate-700 mb-2">
                    Țara de reședință <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="countryCode"
                    value={formData.countryCode}
                    onChange={(e) => setFormData((current) => ({ ...current, countryCode: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>{country.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((current) => ({ ...current, email: e.target.value }))}
                    placeholder="Introdu email-ul"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </>
            )}

            {step === 'verify-email' && (
              <div>
                <label htmlFor="emailCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Cod email <span className="text-red-500">*</span>
                </label>
                <input
                  id="emailCode"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={formData.emailCode}
                  onChange={(e) => setFormData((current) => ({ ...current, emailCode: e.target.value.replace(/[^\d]/g, '') }))}
                  placeholder="Introdu codul din email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            )}

            {step === 'phone' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((current) => ({ ...current, phone: e.target.value }))}
                  placeholder="+37369111333"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            )}

            {step === 'password' && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Parolă <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((current) => ({ ...current, password: e.target.value }))}
                    placeholder="Creează o parolă"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmă parola <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((current) => ({ ...current, confirmPassword: e.target.value }))}
                    placeholder="Repetă parola"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-3">
                  {CONSENTS.map((consent) => (
                    <label key={consent.key} className="flex items-start gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={consents[consent.key]}
                        onChange={(e) => setConsents((current) => ({ ...current, [consent.key]: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span>
                        {consent.label}
                        {consent.required && <span className="text-red-500"> *</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (step === 'details' && !isReferralReady) || (step === 'password' && missingRequiredConsents)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {submitLabel}
                </>
              ) : (
                submitLabel
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/sign-in')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Nu ai un ID de invitație?</p>
          <p className="mt-1">Cere ID-ul numeric de la un utilizator existent din Smart Driver.</p>
        </div>
      </div>
    </div>
  );
}
