import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Apple, PlayCircle, ShoppingCart, Smartphone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0194FE] to-[#0166B8]">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <Smartphone className="w-6 h-6 text-[#0194FE]" />
              </div>
              <span className="text-white font-bold text-xl">Smart Driver</span>
            </div>
            <div>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-white text-[#0194FE] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                    Logare
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link to="/tickets">
                    <button className="bg-white text-[#0194FE] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                      Biletele Mele
                    </button>
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Cumpără Bilete Electronice
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Cumpără bilete BEP pentru aplicația Smart Driver și gestionează-ți programările ușor și rapid
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Cum funcționează?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-[#0194FE]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#0194FE]">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Creează cont sau Logare</h3>
              <p className="text-gray-600">
                Înregistrează-te cu email, Google, Facebook sau Apple
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#0194FE]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#0194FE]">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Alege biletul dorit</h3>
              <p className="text-gray-600">
                Selectează pachetul care se potrivește nevoilor tale
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#0194FE]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#0194FE]">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Folosește în aplicație</h3>
              <p className="text-gray-600">
                Descarcă aplicația și logează-te cu același cont
              </p>
            </div>
          </div>

          <div className="bg-[#0194FE]/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#0194FE]" />
              Integrare perfectă
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>Cumpără bilete aici pe web cu cardul tău bancar</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>Descarcă aplicația Smart Driver din Google Play sau App Store</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>Logează-te cu același cont creat aici</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>Biletele tale vor apărea automat în aplicație</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>Dacă ai cont în aplicație, poți cumpăra bilete aici cu același email</span>
              </li>
            </ul>
          </div>
        </div>

        <SignedOut>
          <div className="text-center mb-16">
            <SignInButton mode="modal">
              <button className="bg-white text-[#0194FE] px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-3 mx-auto">
                <ShoppingCart className="w-6 h-6" />
                Începe să cumperi bilete
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center mb-16">
            <Link to="/buy">
              <button className="bg-white text-[#0194FE] px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-3 mx-auto">
                <ShoppingCart className="w-6 h-6" />
                Cumpără bilete acum
              </button>
            </Link>
          </div>
        </SignedIn>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Descarcă aplicația Smart Driver
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="#"
              className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition shadow-lg w-full sm:w-auto justify-center"
            >
              <Apple className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </a>

            <a
              href="#"
              className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition shadow-lg w-full sm:w-auto justify-center"
            >
              <PlayCircle className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-white/80">
            © 2025 Smart Driver. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}
