import { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { validateReferralId } from '../lib/referralValidation';
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';

export function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    referralId: '',
  });

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

  const handleReferralIdChange = async (value: string) => {
    setFormData({ ...formData, referralId: value });
    setReferralStatus({ checking: false, valid: null, message: '' });

    if (value.trim().length >= 6) {
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

    if (!isLoaded || !signUp) return;

    if (!referralStatus.valid) {
      setError('Please enter a valid referral ID before continuing');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0] || formData.fullName,
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        unsafeMetadata: {
          referralId: formData.referralId.trim().toUpperCase(),
        },
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      } else {
        setError('Registration incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600">Join our referral network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="referralId" className="block text-sm font-medium text-slate-700 mb-2">
                Referral ID <span className="text-red-500">*</span>
              </label>
              <input
                id="referralId"
                type="text"
                required
                value={formData.referralId}
                onChange={(e) => handleReferralIdChange(e.target.value.toUpperCase())}
                placeholder="Enter your referral ID"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition uppercase"
              />
              {referralStatus.checking && (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating referral ID...</span>
                </div>
              )}
              {referralStatus.valid === true && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Valid! Referred by {referralStatus.referrerName}</span>
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
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !referralStatus.valid}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
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
          <p>Don't have a referral ID?</p>
          <p className="mt-1">Contact an existing member to get one</p>
        </div>
      </div>
    </div>
  );
}
