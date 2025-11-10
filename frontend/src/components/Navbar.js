import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

// Bus Icon SVG Component
const BusIcon = ({ className, size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Bus Body */}
    <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor"/>
    {/* Bus Windows */}
    <rect x="4" y="8" width="3" height="2.5" rx="0.5" fill="currentColor"/>
    <rect x="8.5" y="8" width="3" height="2.5" rx="0.5" fill="currentColor"/>
    <rect x="13" y="8" width="3" height="2.5" rx="0.5" fill="currentColor"/>
    {/* Bus Door */}
    <rect x="17" y="9" width="2.5" height="5" rx="0.5" fill="currentColor"/>
    {/* Bus Wheels */}
    <circle cx="7" cy="19" r="2" fill="currentColor"/>
    <circle cx="17" cy="19" r="2" fill="currentColor"/>
    {/* Bus Front Window */}
    <rect x="20" y="8" width="1.5" height="4" rx="0.3" fill="currentColor"/>
  </svg>
);

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Lacak Bus', to: '/track' },
  { label: 'Jadwal', to: '/schedule' },
  { label: 'Daftar Rute', to: '/routes' },
  { label: 'Daftar Halte', to: '/stops' },
  { label: 'Beli Tiket', to: '/ticket' }
];

const Navbar = () => {
  const { isAuthenticated, user, openLogin, logout } = useAuth();

  return (
    <nav className="w-full bg-white shadow-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2">
            <BusIcon className="text-primary" size={24} />
            <span className="font-semibold text-lg text-primary">TransTrack</span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (
                  isActive ? 'text-secondary font-medium' : 'text-text hover:text-primary transition-colors'
                )}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={openLogin}
                className="border border-secondary text-secondary px-4 py-2 rounded-md hover:bg-secondary/10 transition-colors"
              >
                Masuk
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-textSecondary text-sm hidden md:inline">{user?.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="border border-primary text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-sm"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


