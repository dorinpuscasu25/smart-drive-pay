import { LogOut, ShoppingCart, Smartphone, Ticket, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext.tsx';

/**
 * Bara de navigare comună tuturor paginilor.
 * `variant="light"` pentru paginile pe fundal deschis (ex. Profil), implicit pe fundalul albastru.
 */
export function SiteNavbar({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const light = variant === 'light';

  const shell = light ? 'bg-white/80 border-slate-200 text-slate-900' : 'bg-white/10 border-white/20 text-white';
  const linkBase = 'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-semibold transition';
  const linkIdle = light ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10';
  const linkActive = light ? 'bg-slate-900 text-white' : 'bg-white text-[#0194FE]';

  const navLink = (to: string, label: string, Icon: typeof Ticket) => (
    <NavLink to={to} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`} title={label}>
      <Icon className="w-4 h-4" />
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${shell}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className={`rounded-full p-2 ${light ? 'bg-[#0194FE]' : 'bg-white'}`}>
              <Smartphone className={`w-5 h-5 ${light ? 'text-white' : 'text-[#0194FE]'}`} />
            </div>
            <span className="font-bold text-lg hidden sm:inline">Smart Driver Club</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSelector />

            {isLoading ? null : !isAuthenticated ? (
              <>
                <Link to="/sign-in" className={`${linkBase} ${linkIdle}`}>
                  {t('nav.login')}
                </Link>
                <Link to="/sign-up" className={`${linkBase} ${light ? 'bg-[#0194FE] text-white' : 'bg-white text-[#0194FE]'}`}>
                  {t('nav.register')}
                </Link>
              </>
            ) : (
              <>
                {navLink('/buy', t('nav.buy'), ShoppingCart)}
                {navLink('/tickets', t('nav.myTickets'), Ticket)}
                {navLink('/profile', t('nav.profile'), User)}
                <button
                  onClick={() => void logout()}
                  className={`${linkBase} ${linkIdle}`}
                  title={user?.email ?? t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('nav.logout')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
