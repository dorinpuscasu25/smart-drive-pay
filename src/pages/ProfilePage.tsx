import { useNavigate } from 'react-router-dom';
import { User, Ticket, Building2, Car, LogOut, ArrowLeft, Mail, Phone, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AuthUser } from '../lib/types/auth';

function displayName(user: AuthUser | null) {
  if (!user) {
    return 'User';
  }

  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.name || user.email || 'User';
}

export function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const hasPurchasedBep = (user?.bep_pass_assignments_count ?? 0) > 0;

  const handleCopyPersonalId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Se încarcă profilul...</p>
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
            <span>Înapoi</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Ieșire</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{displayName(user)}</h1>
              <p className="text-slate-600">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Starea contului</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">BEP cumpărat:</span>
                  <span className={hasPurchasedBep ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {hasPurchasedBep ? 'Da' : 'Nu'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email confirmat:</span>
                  <span className={user.email_verified_at ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {user.email_verified_at ? 'Da' : 'Nu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">ID utilizator</h3>
              </div>
              {user.id ? (
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold text-blue-600 tracking-wider">
                      {user.id}
                    </code>
                    <button
                      onClick={handleCopyPersonalId}
                      className="p-2 hover:bg-slate-200 rounded-lg transition"
                      title="Copiază"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Acest ID poate fi folosit ca ID de invitație la înregistrare.
                  </p>
                </div>
              ) : (
                <div className="text-slate-600">
                  <p className="mb-2">Indisponibil momentan</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Mașini</span>
                <Car className="w-5 h-5 text-[#0194FE]" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{user.cars_count ?? 0}</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">BEP</span>
                <Ticket className="w-5 h-5 text-[#0194FE]" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{user.bep_pass_assignments_count ?? 0}</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Comenzi</span>
                <Ticket className="w-5 h-5 text-[#0194FE]" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{user.orders_count ?? 0}</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Companii</span>
                <Building2 className="w-5 h-5 text-[#0194FE]" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{user.companies_owned_count ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-[#0194FE]" />
                <span className="text-slate-600">Email</span>
              </div>
              <p className="font-semibold text-slate-900 break-all">{user.email || '—'}</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-[#0194FE]" />
                <span className="text-slate-600">Telefon</span>
              </div>
              <p className="font-semibold text-slate-900">{user.phone || '—'}</p>
            </div>
          </div>
        </div>

        {!hasPurchasedBep && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Gata să cumperi primul BEP?</h3>
            <p className="text-blue-800 mb-4">
              Pe web, contul tău este folosit doar pentru cumpărarea BEP-urilor și vizualizarea lor.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Cumpără BEP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
