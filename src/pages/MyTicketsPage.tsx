import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Ticket, Calendar, Hash, CheckCircle, Car, LogOut } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext.tsx';

type BepAssignment = {
  id: number;
  status: 'active' | 'expired' | 'used' | string;
  valid_from: string | null;
  valid_until: string | null;
  code?: string | null;
  bep_pass?: {
    id: number;
    name: string;
    code: string;
    price: string;
    currency: string;
  } | null;
  car?: {
    plate_number?: string | null;
  } | null;
};

export function MyTicketsPage() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const [tickets, setTickets] = useState<BepAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    if (!user) return;

    try {
      const data = await api.authed.get<{ assignments: BepAssignment[] }>('/bep-assignments');
      setTickets(data?.assignments ?? []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void loadTickets();
    }
  }, [user, loadTickets]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0194FE] to-[#0166B8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0194FE] to-[#0166B8]">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="text-white flex items-center gap-2 hover:text-white/80 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Înapoi</span>
            </button>
            <button
              onClick={() => void logout()}
              className="text-white flex items-center gap-2 hover:text-white/80 transition font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Biletele Mele
          </h1>
          <p className="text-xl text-white/90">
            Vizualizează toate biletele tale achiziționate
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="bg-[#0194FE]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-[#0194FE]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nu ai niciun bilet încă
            </h2>
            <p className="text-gray-600 mb-8">
              Cumpără primul tău bilet BEP pentru a începe să folosești aplicația Smart Driver
            </p>
            <button
              onClick={() => navigate('/buy')}
              className="bg-[#0194FE] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#0166B8] transition"
            >
              Cumpără bilet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-[#0194FE] text-white rounded-full px-4 py-1 text-sm font-semibold uppercase">
                        {ticket.status === 'active' ? 'Activ' : ticket.status === 'expired' ? 'Expirat' : 'Utilizat'}
                      </div>
                      {ticket.status === 'active' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {ticket.bep_pass?.name ?? 'BEP'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-[#0194FE] mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Număr bilet</div>
                          <div className="font-mono font-semibold text-gray-900">
                            {ticket.code ?? `BEP-${ticket.id}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#0194FE] mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Valabilitate</div>
                          <div className="font-semibold text-gray-900">
                            {ticket.valid_from ? formatDate(ticket.valid_from) : '—'} - {ticket.valid_until ? formatDate(ticket.valid_until) : '—'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Car className="w-5 h-5 text-[#0194FE] mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600">Mașină asociată</div>
                          <div className="font-semibold text-gray-900">
                            {ticket.car?.plate_number || 'Neasociat încă'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0194FE]/10 rounded-2xl p-6 text-center min-w-[200px]">
                    <div className="text-sm text-gray-600 mb-2">Preț achitat</div>
                    <div className="text-3xl font-bold text-[#0194FE]">
                      {ticket.bep_pass?.price ?? '—'} {ticket.bep_pass?.currency ?? 'MDL'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Cum folosești biletul:</strong> Descarcă aplicația Smart Driver și loghează-te cu același cont. BEP-ul va apărea automat în aplicație.
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center pt-6">
              <button
                onClick={() => navigate('/buy')}
                className="bg-white text-[#0194FE] px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Cumpără alt bilet
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
