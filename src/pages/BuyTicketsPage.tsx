import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { supabase, TicketType } from '../lib/supabase';
import { useDbUser } from '../contexts/UserContext';
import { Check, ArrowLeft, Loader2, CreditCard, Ticket } from 'lucide-react';

export function BuyTicketsPage() {
  const navigate = useNavigate();
  const { dbUser, loading: userLoading } = useDbUser();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setShowPaymentForm(true);
  };

  const handlePurchase = async () => {
    if (!selectedTicket || !dbUser) return;

    setPurchasing(true);
    try {
      const ticket = tickets.find(t => t.id === selectedTicket);
      if (!ticket) return;

      const validFrom = new Date();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + ticket.validity_days);

      const ticketNumber = `BEP${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error } = await supabase
        .from('purchased_tickets')
        .insert({
          user_id: dbUser.id,
          ticket_type_id: ticket.id,
          ticket_number: ticketNumber,
          status: 'active',
          valid_from: validFrom.toISOString(),
          valid_until: validUntil.toISOString(),
        });

      if (error) throw error;

      navigate('/tickets');
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      alert('A apărut o eroare la cumpărarea biletului. Te rugăm să încerci din nou.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || userLoading) {
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
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Alege biletul potrivit
          </h1>
          <p className="text-xl text-white/90">
            Selectează pachetul care se potrivește nevoilor tale
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket.id)}
              className={`bg-white rounded-3xl p-8 cursor-pointer transition-all transform hover:scale-105 ${
                selectedTicket === ticket.id
                  ? 'ring-4 ring-white shadow-2xl'
                  : 'hover:shadow-xl'
              }`}
            >
              {selectedTicket === ticket.id && (
                <div className="flex justify-end mb-4">
                  <div className="bg-[#0194FE] text-white rounded-full p-2">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {ticket.name}
              </h3>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-[#0194FE]">
                  {ticket.price} MDL
                </span>
              </div>

              <p className="text-gray-600 mb-6">
                {ticket.description}
              </p>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Valabilitate:</span>
                  <span className="font-semibold text-gray-900">
                    {ticket.validity_days} zile
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedTicket && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Finalizează comanda
            </h2>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Bilet selectat:</span>
                <span className="font-semibold text-gray-900">
                  {tickets.find(t => t.id === selectedTicket)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-900">Total de plată:</span>
                <span className="text-[#0194FE]">
                  {tickets.find(t => t.id === selectedTicket)?.price} MDL
                </span>
              </div>
            </div>

            {!showPaymentForm ? (
              <button
                onClick={handlePayment}
                className="w-full bg-[#0194FE] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#0166B8] transition flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                Continuă la plată
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-[#0194FE] p-4">
                  <p className="text-sm text-gray-700">
                    Aceasta este o plată simulată. Introdu orice date pentru a testa procesul.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Număr card
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0194FE] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nume titular card
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="ION POPESCU"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0194FE] focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data expirării
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 2) {
                          setExpiryDate(value);
                        } else {
                          setExpiryDate(value.slice(0, 2) + '/' + value.slice(2, 4));
                        }
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0194FE] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0194FE] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl text-lg font-bold hover:bg-gray-300 transition"
                  >
                    Înapoi
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing || !cardNumber || !cardName || !expiryDate || !cvv}
                    className="flex-1 bg-[#0194FE] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#0166B8] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Se procesează...
                      </>
                    ) : (
                      'Confirmă plata'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
