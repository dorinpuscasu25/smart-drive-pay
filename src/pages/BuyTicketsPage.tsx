import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ArrowLeft, Loader2, Ticket, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/api/errors';

type BepPass = {
  id: number;
  name: string;
  description?: string | null;
  code: string;
  price: string;        // vine ca "160.00"
  currency: string;     // "MDL"
  status: 'active' | 'inactive' | string;
  created_at: string;
  updated_at: string;
};

type PaymentRedirect = {
  payUrl?: string;
  payId?: string;
};

type OrderPaymentResponse = {
  pay?: PaymentRedirect | null;
};

export function BuyTicketsPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, logout } = useAuth();

  const [passes, setPasses] = useState<BepPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);

  const selectedPass = useMemo(
    () => passes.find((p) => p.id === selectedId) ?? null,
    [passes, selectedId]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/sign-in', { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    (async () => {
      try {
        setError('');
        setLoading(true);

        const res = await api.authed.get<{ bep_passes: BepPass[] }>('/bep-passes/all');

        const active = (res?.bep_passes ?? []).filter((p) => p.status === 'active');
        setPasses(active);

        if (active.length > 0) setSelectedId(active[0].id);
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Nu am putut încărca lista de bilete.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPass) return;

    try {
      setPurchasing(true);
      setError('');

      const data = await api.authed.post<OrderPaymentResponse>(
        '/orders/new-order',
        { bep_pass_id: selectedPass.id }
      );

      if (!data?.pay) {
        throw new Error('Nu am primit gateway_url de la server.');
      }

      if (data && data?.pay?.payUrl) {
        window.location.href = data?.pay?.payUrl;
        return;
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Nu am putut iniția plata. Încearcă din nou.'));
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || authLoading) {
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

            <div className="flex items-center gap-4">
              <Link to="/tickets">
                <button className="text-white flex items-center gap-2 hover:text-white/80 transition font-semibold">
                  <Ticket className="w-5 h-5" />
                  Biletele Mele
                </button>
              </Link>

              <button
                onClick={() => void logout()}
                className="text-white flex items-center gap-2 hover:text-white/80 transition font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Alege biletul potrivit</h1>
          <p className="text-xl text-white/90">Selectează pachetul care se potrivește nevoilor tale</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            {error}
          </div>
        )}

        {passes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center">
            <p className="text-gray-700 font-semibold">Momentan nu există BEP-uri active.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {passes.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`bg-white rounded-3xl p-8 cursor-pointer transition-all transform hover:scale-105 ${
                    selectedId === p.id ? 'ring-4 ring-white shadow-2xl' : 'hover:shadow-xl'
                  }`}
                >
                  {selectedId === p.id && (
                    <div className="flex justify-end mb-4">
                      <div className="bg-[#0194FE] text-white rounded-full p-2">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{p.name}</h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-[#0194FE]">
                      {p.price} {p.currency}
                    </span>
                  </div>

                  {!!p.description && <p className="text-gray-600 mb-6">{p.description}</p>}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Cod:</span>
                      <span className="font-mono font-semibold text-gray-900">{p.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPass && (
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Finalizează comanda</h2>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Bilet selectat:</span>
                    <span className="font-semibold text-gray-900">{selectedPass.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-900">Total de plată:</span>
                    <span className="text-[#0194FE]">
                      {selectedPass.price} {selectedPass.currency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full bg-[#0194FE] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#0166B8] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Se inițiază plata...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      Cumpără
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
