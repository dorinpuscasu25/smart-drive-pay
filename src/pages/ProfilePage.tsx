import { useDbUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { User, Users, Trophy, Copy, CheckCircle, LogOut, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const { dbUser, referralStats } = useDbUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyPersonalId = () => {
    if (dbUser?.personal_id) {
      navigator.clipboard.writeText(dbUser.personal_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{dbUser.full_name || 'User'}</h1>
              <p className="text-slate-600">{dbUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Account Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">BEP Purchased:</span>
                  <span className={dbUser.has_purchased_bep ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {dbUser.has_purchased_bep ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Verified:</span>
                  <span className={dbUser.is_verified ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {dbUser.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Your Referral ID</h3>
              </div>
              {dbUser.personal_id ? (
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold text-blue-600 tracking-wider">
                      {dbUser.personal_id}
                    </code>
                    <button
                      onClick={handleCopyPersonalId}
                      className="p-2 hover:bg-slate-200 rounded-lg transition"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Share this ID with people you want to invite
                  </p>
                </div>
              ) : (
                <div className="text-slate-600">
                  <p className="mb-2">Not available yet</p>
                  <p className="text-sm">Purchase a BEP ticket to get your personal referral ID</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Referral Statistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">Total Referrals</span>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-blue-900">
                {referralStats?.total_referrals || 0}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 font-medium">Successful Referrals</span>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-900">
                {referralStats?.successful_referrals || 0}
              </p>
              <p className="text-sm text-green-700 mt-1">Users who purchased BEP</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-800 font-medium">Tombola Tickets</span>
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-4xl font-bold text-amber-900">
                {referralStats?.tombola_tickets_earned || 0}
              </p>
              <p className="text-sm text-amber-700 mt-1">Raffle entries earned</p>
            </div>
          </div>
        </div>

        {!dbUser.has_purchased_bep && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Start Inviting?</h3>
            <p className="text-blue-800 mb-4">
              Purchase a BEP ticket to receive your personal referral ID and start building your network.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Buy BEP Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
