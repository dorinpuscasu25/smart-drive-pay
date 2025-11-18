import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Apple, PlayCircle, ShoppingCart, Smartphone, CheckCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';

export function HomePage() {
  const { t } = useTranslation();

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
                <div className="flex items-center gap-3">
                  <LanguageSelector />
                  <Link to="/sign-in">
                    <button className="text-white px-6 py-2 rounded-full font-semibold hover:bg-white/10 transition">
                      {t('nav.login')}
                    </button>
                  </Link>
                  <Link to="/sign-up">
                    <button className="bg-white text-[#0194FE] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                      {t('nav.register')}
                    </button>
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <Link to="/tickets">
                    <button className="text-white px-4 py-2 rounded-full font-semibold hover:bg-white/10 transition">
                      {t('nav.myTickets')}
                    </button>
                  </Link>
                  <Link to="/profile">
                    <button className="flex items-center gap-2 bg-white text-[#0194FE] px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                      <User className="w-4 h-4" />
                      {t('nav.profile')}
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
            {t('home.title')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('home.howItWorks')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-[#0194FE]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#0194FE]">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step1Title')}</h3>
              <p className="text-gray-600">
                {t('home.step1Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#0194FE]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#0194FE]">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step2Title')}</h3>
              <p className="text-gray-600">
                {t('home.step2Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#0194FE]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#0194FE]">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step3Title')}</h3>
              <p className="text-gray-600">
                {t('home.step3Desc')}
              </p>
            </div>
          </div>

          <div className="bg-[#0194FE]/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#0194FE]" />
              {t('home.perfectIntegration')}
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>{t('home.integration1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>{t('home.integration2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>{t('home.integration3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>{t('home.integration4')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#0194FE] mt-0.5 flex-shrink-0" />
                <span>{t('home.integration5')}</span>
              </li>
            </ul>
          </div>
        </div>

        <SignedOut>
          <div className="text-center mb-16">
            <Link to="/sign-up">
              <button className="bg-white text-[#0194FE] px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-3 mx-auto">
                <ShoppingCart className="w-6 h-6" />
                {t('home.startBuying')}
              </button>
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center mb-16">
            <Link to="/buy">
              <button className="bg-white text-[#0194FE] px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-3 mx-auto">
                <ShoppingCart className="w-6 h-6" />
                {t('home.buyNow')}
              </button>
            </Link>
          </div>
        </SignedIn>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('home.downloadApp')}
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
            © 2025 Smart Driver. {t('home.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
