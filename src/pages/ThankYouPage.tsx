import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, CheckCircle2, Loader2, Mail, Receipt, Ticket } from 'lucide-react';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/api/errors';
import { SiteNavbar } from '../components/SiteNavbar';

type OrderInfo = {
  id: number;
  total: string;
  currency: string | null;
  payment_status: string | null;
  paid_at: string | null;
  email: string | null;
  phone: string | null;
  created_at?: string | null;
  pay_id?: string | null;
  bep_pass?: {
    id: number;
    name?: string | null;
    display_name?: string | null;
    code?: string | null;
    description?: string | null;
    display_description?: string | null;
  } | null;
  bep_pass_assignments?: Array<{
    id: number;
    code?: string | null;
    valid_from: string | null;
    valid_until: string | null;
    status: string | null;
  }>;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentLabel(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'Achitat';
    case 'failed':
      return 'Eșuat';
    case 'pending':
      return 'În procesare';
    default:
      return status || 'Necunoscut';
  }
}

function paymentBadgeClass(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700';
    case 'failed':
      return 'bg-red-100 text-red-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function ThankYouPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      throw new Error('Lipsește identificatorul comenzii.');
    }

    const data = await api.authed.get<{ order: OrderInfo }>(`/orders/get-order-info/${orderId}`);
    return data.order;
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | null = null;
    let attempts = 0;

    const run = async () => {
      try {
        setError('');
        const nextOrder = await loadOrder();

        if (cancelled) {
          return;
        }

        setOrder(nextOrder);

        const shouldKeepPolling = nextOrder.payment_status === 'pending' && attempts < 5;
        if (!shouldKeepPolling && intervalId) {
          window.clearInterval(intervalId);
        }
      } catch (nextError: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(nextError, 'Nu am putut încărca detaliile comenzii.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    intervalId = window.setInterval(() => {
      attempts += 1;
      void run();
    }, 3000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [loadOrder]);

  const primaryAssignment = useMemo(
    () => order?.bep_pass_assignments?.[0] ?? null,
    [order?.bep_pass_assignments]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0194FE] to-[#0166B8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0194FE] to-[#0166B8]">
      <SiteNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Plata a fost procesată cu succes</h1>
            <p className="text-lg text-slate-600">
              Comanda ta a fost înregistrată. Dacă statusul este încă în procesare, pagina se actualizează automat.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
              {error}
            </div>
          )}

          {order ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="rounded-2xl bg-slate-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Receipt className="w-6 h-6 text-[#0194FE]" />
                    <h2 className="text-xl font-bold text-slate-900">Detalii comandă</h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Order ID</span>
                      <span className="font-semibold text-slate-900">#{order.id}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Status plată</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(order.payment_status)}`}>
                        {paymentLabel(order.payment_status)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Total</span>
                      <span className="font-semibold text-slate-900">
                        {order.total} {order.currency ?? 'MDL'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Achitat la</span>
                      <span className="font-semibold text-slate-900">{formatDateTime(order.paid_at)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Pay ID</span>
                      <span className="font-mono text-slate-900">{order.pay_id || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Ticket className="w-6 h-6 text-[#0194FE]" />
                    <h2 className="text-xl font-bold text-slate-900">BEP cumpărat</h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Denumire</span>
                      <span className="font-semibold text-slate-900">
                        {order.bep_pass?.display_name || order.bep_pass?.name || 'BEP'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Cod</span>
                      <span className="font-mono text-slate-900">{primaryAssignment?.code || order.bep_pass?.code || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Activ de la</span>
                      <span className="font-semibold text-slate-900">
                        {formatDateTime(primaryAssignment?.valid_from)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Valabil până la</span>
                      <span className="font-semibold text-slate-900">
                        {formatDateTime(primaryAssignment?.valid_until)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="rounded-2xl bg-blue-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-[#0194FE]" />
                    <h3 className="text-lg font-bold text-slate-900">Date contact</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700"><span className="text-slate-500">Email:</span> {order.email || '—'}</p>
                    <p className="text-slate-700"><span className="text-slate-500">Telefon:</span> {order.phone || '—'}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-[#0194FE]" />
                    <h3 className="text-lg font-bold text-slate-900">Ce urmează</h3>
                  </div>
                  <p className="text-sm text-slate-700">
                    Loghează-te în aplicația mobilă Smart Driver Club cu același cont. BEP-ul cumpărat aici va apărea automat în contul tău.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">
              Nu am găsit detaliile comenzii.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/tickets" className="flex-1">
              <button className="w-full rounded-2xl bg-[#0194FE] px-6 py-4 text-white font-bold hover:bg-[#0166B8] transition">
                Vezi biletele mele
              </button>
            </Link>
            <Link to="/buy" className="flex-1">
              <button className="w-full rounded-2xl bg-slate-100 px-6 py-4 text-slate-900 font-bold hover:bg-slate-200 transition">
                Cumpără încă un BEP
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
