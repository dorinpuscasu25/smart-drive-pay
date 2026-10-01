import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, ShoppingCart, Car as CarIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/api/errors';
import type { Car } from '../lib/types';
import { SiteNavbar } from '../components/SiteNavbar';

// T&C 4.1: profilul auto complet e necesar pentru BEP (aceleași câmpuri ca pe server).
const CAR_PROFILE_FIELDS: [keyof Car, string][] = [
  ['registration_number', 'număr de înmatriculare'],
  ['brand', 'marca'],
  ['model', 'modelul'],
  ['year', 'anul'],
  ['cc', 'cilindreea'],
  ['body_type', 'tipul caroseriei'],
  ['transmission', 'cutia de viteză'],
  ['fuel_type', 'tipul de combustibil'],
  ['color', 'culoarea'],
  ['vin', 'codul VIN'],
];

function missingCarFields(car: Car) {
  return CAR_PROFILE_FIELDS.filter(([key]) => car[key] === null || car[key] === undefined || car[key] === '').map(([, label]) => label);
}

function carName(car: Car) {
  return [car.brand, car.model, car.year].filter(Boolean).join(' ');
}

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
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [passes, setPasses] = useState<BepPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const selectedCar = useMemo(
    () => cars.find((c) => c.id === selectedCarId) ?? null,
    [cars, selectedCarId]
  );
  const selectedCarMissing = selectedCar ? missingCarFields(selectedCar) : [];

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

        const [res, carsRes] = await Promise.all([
          api.authed.get<{ bep_passes: BepPass[] }>('/bep-passes/all'),
          api.authed.get<{ cars: Car[] }>('/cars/all'),
        ]);

        const active = (res?.bep_passes ?? []).filter((p) => p.status === 'active');
        setPasses(active);

        if (active.length > 0) setSelectedId(active[0].id);

        // Mașinile vin din profilul din aplicație; dacă e una singură, o alegem direct.
        const userCars = carsRes?.cars ?? [];
        setCars(userCars);
        if (userCars.length === 1) setSelectedCarId(userCars[0].id);
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Nu am putut încărca lista de bilete.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPass) return;
    if (!selectedCar) {
      setError('Alege mașina pentru care cumperi BEP-ul.');
      return;
    }

    try {
      setPurchasing(true);
      setError('');

      const data = await api.authed.post<OrderPaymentResponse>(
        '/orders/new-order',
        { bep_pass_id: selectedPass.id, car_id: selectedCar.id }
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
      <SiteNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Cumpără BEP</h1>
          <p className="text-xl text-white/90">Alege BEP-ul și mașina pentru care îl cumperi</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pentru ce mașină cumperi BEP-ul?</h2>
                <p className="text-gray-600 mb-6">Un BEP este valabil pentru o singură mașină (un număr de înmatriculare).</p>

                {cars.length === 0 ? (
                  <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>
                      Nu ai nicio mașină în profil. Adaug-o în aplicația Smart Driver Club (Profil → Mașinile mele), apoi revino pe această pagină.
                    </span>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {cars.map((car) => {
                      const missing = missingCarFields(car);
                      const active = car.id === selectedCarId;
                      return (
                        <button
                          key={car.id}
                          type="button"
                          onClick={() => setSelectedCarId(car.id)}
                          className={`text-left rounded-2xl border-2 p-4 transition ${
                            active ? 'border-[#0194FE] bg-[#0194FE]/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CarIcon className="w-6 h-6 text-[#0194FE] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-mono font-bold text-gray-900">{car.registration_number || '—'}</div>
                              <div className="text-sm text-gray-600 truncate">{carName(car) || `Mașina #${car.id}`}</div>
                            </div>
                            {active && <Check className="w-5 h-5 text-[#0194FE] ml-auto shrink-0" />}
                          </div>
                          {missing.length > 0 && (
                            <div className="mt-2 text-xs text-amber-700">Profil incomplet: lipsește {missing.join(', ')}.</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedCar && selectedCarMissing.length > 0 && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>
                      Completează în aplicație profilul mașinii {selectedCar.registration_number} ({selectedCarMissing.join(', ')}), apoi revino aici. Codul VIN îl găsești în certificatul de înmatriculare.
                    </span>
                  </div>
                )}

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">BEP selectat:</span>
                    <span className="font-semibold text-gray-900">{selectedPass.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Mașina:</span>
                    <span className="font-mono font-semibold text-gray-900">{selectedCar?.registration_number || '—'}</span>
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
                  disabled={purchasing || !selectedCar || selectedCarMissing.length > 0}
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
